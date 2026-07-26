// miniprogram-merchant/pages/order-detail/order-detail.js
const app = getApp();

Page({
  data: {
    order: { files: [], printConfig: {}, pickupCode: '' },
    bindingMap: { none: '无', staple: '订书钉', glue: '胶装' },
    statusLabel: '', statusCls: ''
  },

  onLoad(options) {
    if (options.id) this.loadOrder(options.id);
  },

  async loadOrder(id) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('orders').doc(id).get();
      const order = res.data;
      const statusInfo = app.globalData.statusMap[order.status] || {};
      this.setData({
        order,
        statusLabel: statusInfo.label,
        statusCls: statusInfo.cls
      });
    } catch (e) {
      console.error('加载订单失败:', e);
    }
  },

  async changeStatus(e) {
    const newStatus = Number(e.currentTarget.dataset.status);
    const labels = { 2: '确认接单', 3: '通知取件', 4: '确认取件', 5: '取消订单' };
    wx.showModal({
      title: '确认操作',
      content: '确定要' + labels[newStatus] + '吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await wx.cloud.callFunction({
            name: 'updateOrderStatus',
            data: { orderId: this.data.order._id, status: newStatus }
          });
          wx.showToast({ title: '操作成功', icon: 'success' });
          setTimeout(() => this.loadOrder(this.data.order._id), 800);
        } catch (err) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  async previewFile(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showLoading({ title: '加载文件...' });
    try {
      const res = await wx.cloud.downloadFile({ fileID: id });
      wx.openDocument({ filePath: res.tempFilePath, showMenu: true });
    } catch (err) {
      wx.showToast({ title: '预览失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
