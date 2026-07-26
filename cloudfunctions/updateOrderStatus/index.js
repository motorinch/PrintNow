// cloudfunctions/updateOrderStatus/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { orderId, status } = event;

  try {
    const updateData = {
      status: Number(status),
      updateTime: db.serverDate()
    };

    if (status === 4) {
      updateData.finishTime = db.serverDate();
    }

    await db.collection('orders').doc(orderId).update({ data: updateData });

    // 状态变更时尝试推送通知
    if ([2, 3, 4, 5].includes(Number(status))) {
      try {
        await cloud.callFunction({
          name: 'sendSubscribeMsg',
          data: { orderId, type: 'statusChange', status }
        });
      } catch (e) {
        console.log('推送状态通知失败:', e.message);
      }
    }

    return { success: true };
  } catch (e) {
    console.error('updateOrderStatus error:', e);
    return { success: false, error: e.message };
  }
};
