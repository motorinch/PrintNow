// miniprogram-merchant/pages/hall/hall.js
const app = getApp();

Page({
  data: {
    orders: [],
    activeTab: null,
    loading: false,
    noMore: false,
    pageSize: 20,
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
        name: 'getOrders',
        data: { role: 'merchant', status: this.data.activeTab, pageSize: this.data.pageSize }
      });
      const orders = (result.orders || []).map(o => ({
        ...o,
        createTimeText: this.formatTime(o.createTime)
      }));
      this.setData({ orders, noMore: orders.length < this.data.pageSize });
    } catch (e) {
      console.error('加载订单失败:', e);
    } finally {
      this.setData({ loading: false });
    }
  },

  async acceptOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认接单',
      content: '确认接单后将自动通知用户',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await wx.cloud.callFunction({
            name: 'updateOrderStatus',
            data: { orderId, status: 2 }
          });
          wx.showToast({ title: '已接单', icon: 'success' });
          this.loadOrders();
        } catch (err) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => ('0' + n).slice(-2);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id });
  }
});
