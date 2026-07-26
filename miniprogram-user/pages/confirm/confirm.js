// miniprogram-user/pages/confirm/confirm.js
Page({
  data: {
    files: [],
    config: {},
    bindingMap: { none: '无', staple: '订书钉', glue: '胶装' },
    totalPrice: '0.00',
    pickupName: '',
    pickupPhone: '',
    remark: '',
    agreed: false,
    submitting: false
  },

  onLoad() {
    const files = wx.getStorageSync('uploadFiles') || [];
    const config = wx.getStorageSync('printConfig') || {};
    let totalPages = files.reduce((s, f) => s + (f.pages || 0), 0);
    let pricePerPage = config.color === 'bw' ? 0.2 : 1.0;
    if (config.paperSize === 'A3') pricePerPage *= 1.5;
    if (config.duplex === 'duplex') pricePerPage *= 0.6;
    const totalPrice = (totalPages * pricePerPage * (config.copies || 1)).toFixed(2);
    this.setData({ files, config, totalPrice });
  },

  onPickupName(e) { this.setData({ pickupName: e.detail.value }); },
  onPickupPhone(e) { this.setData({ pickupPhone: e.detail.value }); },
  onRemark(e) { this.setData({ remark: e.detail.value }); },
  toggleAgree() { this.setData({ agreed: !this.data.agreed }); },

  async submitOrder() {
    if (!this.data.pickupName.trim()) {
      wx.showToast({ title: '请输入取件人姓名', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(this.data.pickupPhone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      // 1. 创建订单
      const { result } = await wx.cloud.callFunction({
        name: 'createOrder',
        data: {
          files: this.data.files,
          config: this.data.config,
          totalPrice: this.data.totalPrice,
          pickupName: this.data.pickupName,
          pickupPhone: this.data.pickupPhone,
          remark: this.data.remark
        }
      });

      if (!result.success) {
        throw new Error(result.message || '创建订单失败');
      }

      // 2. 调起微信支付
      const payRes = await wx.cloud.callFunction({
        name: 'wxPay',
        data: { orderId: result.orderId, totalPrice: this.data.totalPrice }
      });

      if (payRes.result.payment) {
        const { timeStamp, nonceStr, pkg, signType, paySign } = payRes.result.payment;
        await new Promise((resolve, reject) => {
          wx.requestPayment({
            timeStamp, nonceStr, package: pkg, signType, paySign,
            success: resolve,
            fail: reject
          });
        });

        wx.showToast({ title: '支付成功', icon: 'success' });
        wx.removeStorageSync('uploadFiles');
        wx.removeStorageSync('printConfig');

        setTimeout(() => {
          wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + result.orderId });
        }, 1500);
      } else {
        wx.showToast({ title: '订单已创建，请稍后支付', icon: 'none' });
        wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + result.orderId });
      }
    } catch (e) {
      console.error('提交失败:', e);
      wx.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
