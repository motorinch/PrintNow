// miniprogram-merchant/pages/order-detail/order-detail.js
const app = getApp();
Page({
  data: {
    order: { files: [], printConfig: {}, pickupCode: '' },
    bindingMap: { none: '无', staple: '订书钉', glue: '胶装' },
    statusLabel: '', statusCls: ''
  },
  onLoad(options) { if (options.id) this.loadOrder(options.id); },
  async loadOrder(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('orders').doc(id).get();
      const order = res.data;
      const si = app.globalData.statusMap[order.status] || {};
      this.setData({ order, statusLabel: si.label, statusCls: si.cls });
    } catch (e) { console.error(e); }
  },
  async changeStatus(e) {
    const ns = Number(e.currentTarget.dataset.status);
    const labels = { 2: 'Accept order', 3: 'Notify pickup', 4: 'Confirm pickup', 5: 'Cancel order' };
    wx.showModal({
      title: 'Confirm',
      content: labels[ns] + '?',
      success: async r => {
        if (!r.confirm) return;
        try {
          await wx.cloud.callFunction({ name: 'updateOrderStatus', data: { orderId: this.data.order._id, status: ns } });
          wx.showToast({ title: 'Done', icon: 'success' });
          setTimeout(() => this.loadOrder(this.data.order._id), 800);
        } catch (err) { wx.showToast({ title: 'Failed', icon: 'none' }); }
      }
    });
  },
  async previewFile(e) {
    const { id } = e.currentTarget.dataset;
    wx.showLoading({ title: 'Loading...' });
    try {
      const res = await wx.cloud.downloadFile({ fileID: id });
      wx.openDocument({ filePath: res.tempFilePath, showMenu: true });
    } catch (err) { wx.showToast({ title: 'Preview failed', icon: 'none' }); }
    finally { wx.hideLoading(); }
  }
});