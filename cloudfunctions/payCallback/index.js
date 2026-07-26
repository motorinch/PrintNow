// cloudfunctions/payCallback/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { outTradeNo, returnCode } = event;

  try {
    if (returnCode === 'SUCCESS') {
      await db.collection('orders').doc(outTradeNo).update({
        data: {
          status: 1, // 已支付
          payTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });

      // 支付成功后触发订阅消息推送
      try {
        await cloud.callFunction({
          name: 'sendSubscribeMsg',
          data: { orderId: outTradeNo, type: 'paid' }
        });
      } catch (e) {
        console.log('推送支付通知失败:', e.message);
      }
    }

    return { errcode: 0, errmsg: 'ok' };
  } catch (e) {
    console.error('payCallback error:', e);
    return { errcode: -1, errmsg: e.message };
  }
};
