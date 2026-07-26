// miniprogram-user/pages/index/index.js
Page({
  data: {
    recentOrders: [],
    statusMap: {
      0: { label: '待支付', cls: 'status-pending' },
      1: { label: '已支付', cls: 'status-paid' },
      2: { label: '打印中', cls: 'status-printing' },
      3: { label: '待取件', cls: 'status-pickup' },
      4: { label: '已完成', cls: 'status-done' },
      5: { label: '已取消', cls: 'status-cancelled' }
    },
    dbOk: true
  },

  onShow() { this.loadRecentOrders(); },

  async loadRecentOrders() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('orders')
        .orderBy('createTime', 'desc').limit(3).get();
      this.setData({ recentOrders: res.data, dbOk: true });
    } catch (e) {
      console.warn('load orders skipped:', e.errCode || e.message);
      this.setData({ recentOrders: [], dbOk: false });
    }
  },

  goUpload() { wx.navigateTo({ url: '/pages/upload/upload' }); },
  goOrders() { wx.switchTab({ url: '/pages/orders/orders' }); },
  goDetail(e) {
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id });
  }
});