// cloudfunctions/createOrder/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 生成6位取件码
function genPickupCode() {
  return ('' + Math.floor(100000 + Math.random() * 900000));
}

// 生成订单号
function genOrderNo() {
  const now = new Date();
  const pad = n => ('0' + n).slice(-2);
  return 'PN' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
         pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const { files, config, totalPrice, pickupName, pickupPhone, remark } = event;

  if (!files || !files.length) return { success: false, message: '请上传文件' };
  if (!pickupName || !pickupPhone) return { success: false, message: '请填写取件信息' };

  try {
    const orderData = {
      _openid: wxContext.OPENID,
      orderNo: genOrderNo(),
      files: files.map(f => ({ name: f.name, fileID: f.cloudFileID, pages: f.pages })),
      printConfig: {
        copies: config.copies || 1,
        color: config.color || 'bw',
        duplex: config.duplex || 'single',
        paperSize: config.paperSize || 'A4',
        binding: config.binding || 'none'
      },
      totalPrice: parseFloat(totalPrice) || 0,
      pickupName,
      pickupPhone,
      remark: remark || '',
      pickupCode: genPickupCode(),
      status: 0, // 0-待支付
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };

    const res = await db.collection('orders').add({ data: orderData });
    return { success: true, orderId: res._id, orderNo: orderData.orderNo };
  } catch (e) {
    console.error('createOrder error:', e);
    return { success: false, message: e.message };
  }
};
