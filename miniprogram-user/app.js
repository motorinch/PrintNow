// miniprogram-user/app.js
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
    // Non-blocking login - won'\''t break the app if cloud functions aren'\''t deployed
    this.checkLogin();
  },

  async checkLogin() {
    const cached = wx.getStorageSync('userInfo');
    if (cached) {
      this.globalData.userInfo = cached;
      return;
    }
    try {
      const { result } = await wx.cloud.callFunction({ name: 'login' });
      if (result && result.user) {
        wx.setStorageSync('userInfo', result.user);
        this.globalData.userInfo = result.user;
      }
    } catch (e) {
      // Cloud function not deployed yet - app still works without login
      console.warn('Login deferred (deploy cloud functions to enable):', e.errCode);
    }
  },

  globalData: {
    userInfo: null,
    printConfig: {
      copies: 1,
      color: 'bw',
      duplex: 'single',
      paperSize: 'A4',
      binding: 'none'
    }
  }
});