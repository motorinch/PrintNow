// cloudfunctions/getStats/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { role } = event;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let baseQuery = db.collection('orders');
    if (role === 'user') {
      baseQuery = baseQuery.where({ _openid: wxContext.OPENID });
    }

    // 汇总统计
    const [todayRes, weekRes, monthRes, allRes] = await Promise.all([
      baseQuery.where({ createTime: _.gte(todayStart), status: _.in([1, 2, 3, 4]) }).count(),
      baseQuery.where({ createTime: _.gte(weekAgo), status: _.in([1, 2, 3, 4]) }).count(),
      baseQuery.where({ createTime: _.gte(monthStart), status: _.in([1, 2, 3, 4]) }).count(),
      baseQuery.where({ status: _.in([1, 2, 3, 4]) }).count()
    ]);

    // 读取价格配置计算收入（简化处理）
    const todayOrders = await baseQuery.where({ createTime: _.gte(todayStart), status: _.in([1, 2, 3, 4]) }).get();
    const weekOrders = await baseQuery.where({ createTime: _.gte(weekAgo), status: _.in([1, 2, 3, 4]) }).get();
    const monthOrders = await baseQuery.where({ createTime: _.gte(monthStart), status: _.in([1, 2, 3, 4]) }).get();
    const totalOrders = await baseQuery.where({ status: _.in([1, 2, 3, 4]) }).get();

    const sumPrice = (list) => list.reduce((s, o) => s + (o.totalPrice || 0), 0);

    // 近7天每日趋势
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart.getTime() - i * 86400000);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayRes = await baseQuery.where({
        createTime: _.gte(dayStart).and(_.lt(dayEnd)),
        status: _.in([1, 2, 3, 4])
      }).get();
      dailyData.push({
        date: dayStart.toISOString().slice(0, 10),
        count: dayRes.data.length,
        income: sumPrice(dayRes.data)
      });
    }

    // 状态分布
    const statusLabels = ['待支付', '已支付', '打印中', '待取件', '已完成', '已取消'];
    const statusDist = [];
    for (let s = 0; s <= 5; s++) {
      const countRes = await baseQuery.where({ status: s }).count();
      statusDist.push({ label: statusLabels[s], count: countRes.total });
    }

    return {
      summary: {
        todayOrders: todayRes.total,
        todayIncome: sumPrice(todayOrders.data).toFixed(2),
        weekOrders: weekRes.total,
        weekIncome: sumPrice(weekOrders.data).toFixed(2),
        monthOrders: monthRes.total,
        monthIncome: sumPrice(monthOrders.data).toFixed(2),
        totalOrders: allRes.total,
        totalIncome: sumPrice(totalOrders.data).toFixed(2)
      },
      daily: dailyData,
      statusDist
    };
  } catch (e) {
    console.error('getStats error:', e);
    return { summary: {}, daily: [], statusDist: [], error: e.message };
  }
};
