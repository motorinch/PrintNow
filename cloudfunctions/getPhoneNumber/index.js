// cloudfunctions/getPhoneNumber/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { cloudID } = event;

  try {
    // 通过 cloudID 获取手机号
    const res = await cloud.openapi.phonenumber.getPhoneNumber({
      openid: wxContext.OPENID,
      code: cloudID
    });

    const phone = res.phoneInfo?.phoneNumber || '';

    // 更新用户手机号
    if (phone) {
      const userRes = await db.collection('users').where({ _openid: wxContext.OPENID }).get();
      if (userRes.data.length > 0) {
        await db.collection('users').doc(userRes.data[0]._id).update({
          data: { phone }
        });
      }
    }

    return { success: true, phone };
  } catch (e) {
    console.error('getPhoneNumber error:', e);
    return { success: false, phone: '', error: e.message };
  }
};