// miniprogram-user/pages/mine/mine.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    stats: { total: 0, printing: 0, pickup: 0, done: 0 }
  },

  onShow() {
    this.setData({ userInfo: app.globalData.userInfo || {} });
    this.loadStats();
  },

  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getStats',
        data: { role: 'user' }
      });
      if (result) this.setData({ stats: result });
    } catch (e) {
      console.error('加载统计失败:', e);
    }
  },

  bindPhone(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') return;
    wx.cloud.callFunction({
      name: 'getPhoneNumber',
      data: { cloudID: e.detail.cloudID }
    }).then(({ result }) => {
      if (result.phone) {
        const userInfo = { ...this.data.userInfo, phone: result.phone };
        this.setData({ userInfo });
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
        wx.showToast({ title: '绑定成功', icon: 'success' });
      }
    });
  },

  goOrders() { wx.switchTab({ url: '/pages/orders/orders' }); },
  aboutPrint() { wx.navigateTo({ url: '/pages/index/index' }); },
  contactUs() { wx.showModal({ title: '联系客服', content: '客服电话：400-XXX-XXXX\n工作时间：9:00-18:00', showCancel: false }); },
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  }
});
