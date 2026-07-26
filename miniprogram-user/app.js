// miniprogram-user/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('Please use base library version 2.2.3 or above for cloud capabilities');
    } else {
      wx.cloud.init({
        env: 'cloudbase-d7g8b9shyba5d75ce',
        traceUser: true
      });
    }
    // 异步登录，不阻塞启动
    this.checkLogin();
  },

  async checkLogin() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'login' });
      if (result && result.user) {
        wx.setStorageSync('userInfo', result.user);
        this.globalData.userInfo = result.user;
      }
    } catch (e) {
      console.error('Login failed:', e);
    }
  },

  globalData: {
    userInfo: null,
    printConfig: {
      copies: 1,
      color: 'bw',        // bw | color
      duplex: 'single',   // single | duplex
      paperSize: 'A4',    // A4 | A3
      binding: 'none'     // none | staple | glue
    }
  }
});