// miniprogram-merchant/pages/processing/processing.js
const app = getApp();
Page({
  data: { orders: [], loading: false, statusMap: app.globalData.statusMap },
  onShow() { this.loadOrders(); },
  async loadOrders() {
    this.setData({ loading: true });
    try {
      const { result } = await wx.cloud.callFunction({ name: 'getOrders', data: { role: 'merchant', status: 2, pageSize: 50 } });
      this.setData({ orders: result.orders || [] });
    } catch (e) { console.error(e); }
    finally { this.setData({ loading: false }); }
  },
  goDetail(e) { wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id }); }
});