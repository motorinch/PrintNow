// cloudfunctions/sendSubscribeMsg/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 状态到消息模板的映射
const statusMessages = {
  2: { thing1: '打印中', thing2: '商家已接单，正在为您打印' },
  3: { thing1: '待取件', thing2: '打印完成，请凭取件码到店取件' },
  4: { thing1: '已完成', thing2: '订单已确认完成，感谢使用PrintNow' },
  5: { thing1: '已取消', thing2: '订单已被取消，如有疑问请联系客服' }
};

exports.main = async (event) => {
  const { orderId, type, status } = event;

  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;
    if (!order) return { success: false, message: '订单不存在' };

    let templateId, data;

    if (type === 'paid') {
      templateId = ''; // 替换为您的订阅消息模板ID
      data = {
        character_string1: { value: order.orderNo },
        amount2: { value: order.totalPrice + '元' },
        thing3: { value: '已支付，等待商家接单' }
      };
    } else if (type === 'statusChange' && statusMessages[status]) {
      templateId = ''; // 替换为您的订阅消息模板ID
      const msg = statusMessages[status];
      data = {
        character_string1: { value: order.orderNo },
        phrase2: { value: msg.thing1 },
        thing3: { value: msg.thing2 }
      };
    }

    if (!templateId) {
      return { success: false, message: '消息模板未配置' };
    }

    // 发送订阅消息
    await cloud.openapi.subscribeMessage.send({
      touser: order._openid,
      page: '/pages/order-detail/order-detail?id=' + orderId,
      data,
      templateId,
      miniprogramState: 'formal'
    });

    return { success: true };
  } catch (e) {
    console.error('sendSubscribeMsg error:', e);
    return { success: false, error: e.message };
  }
};
