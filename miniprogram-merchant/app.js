// miniprogram-merchant/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('Please use base library version 2.2.3 or above');
    } else {
      wx.cloud.init({
        env: 'cloudbase-d7g8b9shyba5d75ce',
        traceUser: true
      });
    }
    this.checkLogin();
  },

  async checkLogin() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'login' });
      if (result && result.user) {
        wx.setStorageSync('merchantInfo', result.user);
        this.globalData.merchantInfo = result.user;
      }
    } catch (e) {
      console.warn('Login deferred (deploy cloud functions to enable):', e.errCode);
    }
  },

  globalData: {
    merchantInfo: null,
    statusMap: {
      0: { label: 'Pending', cls: 'status-pending' },
      1: { label: 'Paid', cls: 'status-paid' },
      2: { label: 'Printing', cls: 'status-printing' },
      3: { label: 'Pickup', cls: 'status-pickup' },
      4: { label: 'Done', cls: 'status-done' },
      5: { label: 'Cancelled', cls: 'status-cancelled' }
    }
  }
});