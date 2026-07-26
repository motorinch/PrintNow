// cloudfunctions/getOrders/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { role, status, pageSize = 20, skip = 0 } = event;

  try {
    let query = db.collection('orders');

    // 用户端只查自己的订单
    if (role === 'user') {
      query = query.where({ _openid: wxContext.OPENID });
    }

    // 状态筛选
    if (status === 'done') {
      query = query.where({ status: _.in([4, 5]) }); // 已完成、已取消
    } else if (status !== null && status !== undefined) {
      query = query.where({ status: Number(status) });
    }

    const res = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return { success: true, orders: res.data };
  } catch (e) {
    console.error('getOrders error:', e);
    return { success: false, orders: [], error: e.message };
  }
};
