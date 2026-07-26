// miniprogram-user/pages/mine/mine.js
const app = getApp();
Page({
  data: { userInfo: {}, stats: { total: 0, printing: 0, pickup: 0, done: 0 } },
  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
    this.loadStats();
  },
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'getStats', data: { role: 'user' } });
      if (result) this.setData({ stats: result });
    } catch (e) { console.error(e); }
  },
  bindPhone(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') return;
    wx.cloud.callFunction({ name: 'getPhoneNumber', data: { cloudID: e.detail.cloudID } })
      .then(({ result }) => {
        if (result && result.phone) {
          const u = { ...this.data.userInfo, phone: result.phone };
          this.setData({ userInfo: u });
          app.globalData.userInfo = u;
          wx.setStorageSync('userInfo', u);
          wx.showToast({ title: 'Phone bound', icon: 'success' });
        }
      });
  },
  goOrders() { wx.switchTab({ url: '/pages/orders/orders' }); },
  aboutPrint() { wx.switchTab({ url: '/pages/index/index' }); },
  contactUs() {
    wx.showModal({
      title: 'Contact us',
      content: 'Phone: 400-XXX-XXXX\nHours: 9:00-18:00',
      showCancel: false
    });
  },
  clearCache() {
    wx.showModal({
      title: 'Clear cache',
      content: 'Are you sure?',
      success: r => { if (r.confirm) { wx.clearStorage(); wx.showToast({ title: 'Cleared', icon: 'success' }); } }
    });
  }
});