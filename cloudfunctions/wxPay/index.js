// cloudfunctions/wxPay/index.js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { orderId, totalPrice } = event;

  try {
    // 调用微信支付统一下单（需要商户号配置）
    // 此处返回模拟支付参数，实际使用需开通微信支付商户平台
    const payment = await cloud.cloudPay.unifiedOrder({
      body: 'PrintNow打印服务',
      outTradeNo: orderId,
      spbillCreateIp: '127.0.0.1',
      subMchId: '', // 子商户号（服务商模式）
      totalFee: Math.round(parseFloat(totalPrice) * 100), // 单位：分
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'payCallback'
    });

    return { success: true, payment };
  } catch (e) {
    console.error('wxPay error:', e);
    // 支付未开通时返回提示信息
    return {
      success: false,
      message: '支付功能暂未开通，请联系管理员',
      error: e.message
    };
  }
};
