// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 查询是否已有用户记录
    const res = await db.collection('users').where({ _openid: openid }).get();

    let user;
    if (res.data.length > 0) {
      // 老用户，更新登录时间
      user = res.data[0];
      await db.collection('users').doc(user._id).update({
        data: { lastLoginTime: db.serverDate() }
      });
    } else {
      // 新用户，创建记录
      const newUser = {
        _openid: openid,
        role: 'user',        // 默认为普通用户
        createTime: db.serverDate(),
        lastLoginTime: db.serverDate()
      };
      const addRes = await db.collection('users').add({ data: newUser });
      user = { ...newUser, _id: addRes._id };
    }

    return { success: true, user };
  } catch (e) {
    console.error('login error:', e);
    return { success: false, error: e.message };
  }
};