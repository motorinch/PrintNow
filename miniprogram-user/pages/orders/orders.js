// miniprogram-user/pages/orders/orders.js
Page({
  data: {
    orders: [],
    activeTab: null,
    loading: false,
    noMore: false,
    pageSize: 20,
    statusMap: {
      0: { label: '待支付', cls: 'status-pending' },
      1: { label: '已支付', cls: 'status-paid' },
      2: { label: '打印中', cls: 'status-printing' },
      3: { label: '待取件', cls: 'status-pickup' },
      4: { label: '已完成', cls: 'status-done' },
      5: { label: '已取消', cls: 'status-cancelled' }
    }
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
        data: { role: 'user', status: this.data.activeTab, pageSize: this.data.pageSize }
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

  formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => ('0' + n).slice(-2);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  },

  goDetail(e) {
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id });
  }
});
