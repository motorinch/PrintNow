// miniprogram-user/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'printnow-xxxxxx', // 替换为你的云环境ID
        traceUser: true
      });
    }
    this.checkLogin();
  },

  async checkLogin() {
    const user = wx.getStorageSync('userInfo');
    if (!user) {
      const { result } = await wx.cloud.callFunction({ name: 'login' });
      if (result && result.user) {
        wx.setStorageSync('userInfo', result.user);
        this.globalData.userInfo = result.user;
      }
    } else {
      this.globalData.userInfo = user;
    }
  },

  globalData: {
    userInfo: null,
    printConfig: {
      copies: 1,
      color: 'bw',       // bw | color
      duplex: 'single',  // single | duplex
      paperSize: 'A4',   // A4 | A3
      binding: 'none'    // none | staple | glue
    },
    priceTable: {
      bw: 0.2,    // 黑白单面每页
      color: 1.0,  // 彩色单面每页
      duplex: 0.3, // 双面加价系数
      A3: 1.5      // A3加价系数
    }
  }
});
