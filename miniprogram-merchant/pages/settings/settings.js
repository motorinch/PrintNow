// miniprogram-merchant/pages/settings/settings.js
Page({
  data: {
    shopName: '', shopPhone: '', shopAddress: '',
    priceBW: '0.2', priceColor: '1.0', priceDuplex: '0.6', priceA3: '1.5',
    notifyNewOrder: true, notifyDone: true
  },

  onShow() { this.loadSettings(); },

  async loadSettings() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('config').get();
      const map = {};
      res.data.forEach(c => { map[c.key] = c.value; });
      this.setData({
        shopName: map.shopName || '',
        shopPhone: map.shopPhone || '',
        shopAddress: map.shopAddress || '',
        priceBW: map.priceBW || '0.2',
        priceColor: map.priceColor || '1.0',
        priceDuplex: map.priceDuplex || '0.6',
        priceA3: map.priceA3 || '1.5',
        notifyNewOrder: map.notifyNewOrder !== false,
        notifyDone: map.notifyDone !== false
      });
    } catch (e) { console.error(e); }
  },

  onShopName(e) { this.setData({ shopName: e.detail.value }); },
  onShopPhone(e) { this.setData({ shopPhone: e.detail.value }); },
  onShopAddress(e) { this.setData({ shopAddress: e.detail.value }); },
  onPriceBW(e) { this.setData({ priceBW: e.detail.value }); },
  onPriceColor(e) { this.setData({ priceColor: e.detail.value }); },
  onPriceDuplex(e) { this.setData({ priceDuplex: e.detail.value }); },
  onPriceA3(e) { this.setData({ priceA3: e.detail.value }); },
  onNotifyNewOrder(e) { this.setData({ notifyNewOrder: e.detail.value }); },
  onNotifyDone(e) { this.setData({ notifyDone: e.detail.value }); },

  async saveSettings() {
    const db = wx.cloud.database();
    const configs = [
      { key: 'shopName', value: this.data.shopName },
      { key: 'shopPhone', value: this.data.shopPhone },
      { key: 'shopAddress', value: this.data.shopAddress },
      { key: 'priceBW', value: this.data.priceBW },
      { key: 'priceColor', value: this.data.priceColor },
      { key: 'priceDuplex', value: this.data.priceDuplex },
      { key: 'priceA3', value: this.data.priceA3 },
      { key: 'notifyNewOrder', value: this.data.notifyNewOrder },
      { key: 'notifyDone', value: this.data.notifyDone }
    ];
    try {
      for (const cfg of configs) {
        const existing = await db.collection('config').where({ key: cfg.key }).get();
        if (existing.data.length) {
          await db.collection('config').doc(existing.data[0]._id).update({ data: { value: cfg.value } });
        } else {
          await db.collection('config').add({ data: cfg });
        }
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('merchantInfo');
          wx.reLaunch({ url: '/pages/hall/hall' });
        }
      }
    });
  }
});
