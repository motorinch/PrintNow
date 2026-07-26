// miniprogram-user/pages/order-detail/order-detail.js
Page({
  data: {
    order: { files: [], printConfig: {}, pickupCode: '', orderNo: '', status: 0 },
    bindingMap: { none: '无', staple: '订书钉', glue: '胶装' },
    statusLabel: '待支付', statusCls: 'status-pending', totalPages: 0,
    statusMap: {
      0: { label: '待支付', cls: 'status-pending' },
      1: { label: '已支付', cls: 'status-paid' },
      2: { label: '打印中', cls: 'status-printing' },
      3: { label: '待取件', cls: 'status-pickup' },
      4: { label: '已完成', cls: 'status-done' },
      5: { label: '已取消', cls: 'status-cancelled' }
    }
  },
  onLoad(options) { if (options.id) this.loadOrder(options.id); },
  async loadOrder(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('orders').doc(id).get();
      const order = res.data;
      const totalPages = (order.files || []).reduce((s, f) => s + (f.pages || 0), 0);
      const si = this.data.statusMap[order.status] || {};
      this.setData({ order, totalPages, statusLabel: si.label, statusCls: si.cls });
    } catch (e) { wx.showToast({ title: 'Load failed', icon: 'none' }); }
  }
});