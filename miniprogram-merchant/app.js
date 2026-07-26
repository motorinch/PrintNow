// miniprogram-merchant/app.js
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
    const merchant = wx.getStorageSync('merchantInfo');
    if (!merchant) {
      const { result } = await wx.cloud.callFunction({ name: 'login' });
      if (result && result.user && result.user.role === 'merchant') {
        wx.setStorageSync('merchantInfo', result.user);
        this.globalData.merchantInfo = result.user;
      } else {
        wx.redirectTo({ url: '/pages/login/login' });
      }
    } else {
      this.globalData.merchantInfo = merchant;
    }
  },

  globalData: {
    merchantInfo: null,
    statusMap: {
      0: { label: '待支付', cls: 'status-pending' },
      1: { label: '已支付', cls: 'status-paid' },
      2: { label: '打印中', cls: 'status-printing' },
      3: { label: '待取件', cls: 'status-pickup' },
      4: { label: '已完成', cls: 'status-done' },
      5: { label: '已取消', cls: 'status-cancelled' }
    }
  }
});
