// miniprogram-user/pages/config/config.js
Page({
  data: { config: { copies: 1, color: 'bw', duplex: 'single', paperSize: 'A4', binding: 'none' } },
  onLoad() {
    const config = wx.getStorageSync('printConfig');
    if (config) this.setData({ config });
  },
  minusCopies() {
    if (this.data.config.copies > 1) this.setData({ 'config.copies': this.data.config.copies - 1 });
  },
  plusCopies() {
    if (this.data.config.copies < 99) this.setData({ 'config.copies': this.data.config.copies + 1 });
  },
  selectOption(e) {
    const { key, val } = e.currentTarget.dataset;
    this.setData({ ['config.' + key]: val });
  },
  saveConfig() {
    wx.setStorageSync('printConfig', this.data.config);
    wx.navigateBack();
  }
});