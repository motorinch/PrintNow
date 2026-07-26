// miniprogram-merchant/pages/history/history.js
const app = getApp();
Page({
  data: { orders: [], loading: false, statusMap: app.globalData.statusMap, page: 0 },
  onShow() { this.setData({ orders: [], page: 0 }); this.loadMore(); },
  onReachBottom() { this.loadMore(); },
  async loadMore() {
    this.setData({ loading: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getOrders', data: { role: 'merchant', status: 'done', pageSize: 20, skip: this.data.page * 20 }
      });
      const orders = result.orders.map(o => ({ ...o, createTimeText: this.fmt(o.createTime) }));
      this.setData({ orders: [...this.data.orders, ...orders], page: this.data.page + 1 });
    } catch (e) { console.error(e); }
    finally { this.setData({ loading: false }); }
  },
  fmt(ts) { const d = new Date(ts); return (d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+(''+d.getMinutes()).padStart(2,'0'); },
  goDetail(e) { wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + e.currentTarget.dataset.id }); }
});