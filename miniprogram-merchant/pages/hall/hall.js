// miniprogram-merchant/pages/hall/hall.js
const app = getApp();
Page({
  data: {
    orders: [], activeTab: null, loading: false, noMore: false, pageSize: 20, dbOk: true,
    statusMap: app.globalData.statusMap
  },
  onShow() { this.loadOrders(); },
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab === '' ? null : Number(tab), orders: [], noMore: false });
    this.loadOrders();
  },
  async loadOrders() {
    this.setData({ loading: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrders', data: { role: 'merchant', status: this.data.activeTab, pageSize: this.data.pageSize }
      });
      const orders = (result.orders || []).map(o => ({ ...o, createTimeText: this.fmt(o.createTime) }));
      this.setData({ orders, noMore: orders.length < this.data.pageSize, dbOk: true });
    } catch (e) {
      console.warn('load orders skipped:', e.errCode || e.message);
      this.setData({ orders: [], dbOk: false });
    } finally { this.setData({ loading: false }); }
  },
  async acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Confirm', content: 'Accept this order?',
      success: async r => {
        if (!r.confirm) return;
        try {
          await wx.cloud.callFunction({ name: 'updateOrderStatus', data: { orderId, status: 2 } });
          wx.showToast({ title: 'Accepted', icon: 'success' });
          this.loadOrders();
        } catch (err) { wx.showToast({ title: 'Failed', icon: 'none' }); }
      }
    });
  },
  fmt(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return (''+(d.getMonth()+1)).padStart(2,'0')+'-'+(''+d.getDate()).padStart(2,'0')+' '+(''+d.getHours()).padStart(2,'0')+':'+(''+d.getMinutes()).padStart(2,'0');
  },
  goDetail(e) { wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id }); }
});