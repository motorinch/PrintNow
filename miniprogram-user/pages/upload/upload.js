// miniprogram-user/pages/upload/upload.js
const app = getApp();

Page({
  data: {
    files: [],
    config: {
      copies: 1,
      color: 'bw',
      duplex: 'single',
      paperSize: 'A4',
      binding: 'none'
    },
    bindingMap: { none: '无', staple: '订书钉', glue: '胶装' },
    totalPages: 0,
    estimatedPrice: 0,
    parsing: false
  },

  onShow() {
    // 从参数设置页返回时更新配置
    const pages = getCurrentPages();
    const config = wx.getStorageSync('printConfig');
    if (config) {
      this.setData({ config });
      this.calcPrice();
    }
  },

  chooseFile() {
    const that = this;
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success(res) {
        const newFiles = res.tempFiles.map(f => ({
          name: f.name,
          path: f.path,
          size: f.size,
          sizeText: that.formatSize(f.size),
          icon: that.getFileIcon(f.name),
          pages: 0,
          cloudFileID: null
        }));
        that.setData({ files: [...that.data.files, ...newFiles], parsing: true });
        that.uploadAndParse(newFiles);
      }
    });
  },

  removeFile(e) {
    const idx = e.currentTarget.dataset.index;
    const files = this.data.files;
    files.splice(idx, 1);
    this.setData({ files });
    this.calcPrice();
  },

  getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const map = { pdf: '📕', doc: '📘', docx: '📘', ppt: '📙', pptx: '📙', xls: '📗', xlsx: '📗', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️' };
    return map[ext] || '📄';
  },

  formatSize(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / 1048576).toFixed(1) + 'MB';
  },

  async uploadAndParse(newFiles) {
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      try {
        // 上传到云存储
        const cloudPath = 'print-files/' + Date.now() + '_' + file.name;
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: file.path
        });

        // 调用云函数解析文件页数
        const parseRes = await wx.cloud.callFunction({
          name: 'parseFile',
          data: { fileID: uploadRes.fileID, fileName: file.name }
        });

        const pages = parseRes.result.pages || 1;
        const idx = this.data.files.findIndex(f => f.name === file.name && !f.cloudFileID);
        if (idx >= 0) {
          const files = this.data.files;
          files[idx].cloudFileID = uploadRes.fileID;
          files[idx].pages = pages;
          this.setData({ files });
        }
      } catch (e) {
        console.error('上传解析失败:', file.name, e);
        wx.showToast({ title: file.name + ' 上传失败', icon: 'none' });
      }
    }
    this.setData({ parsing: false });
    this.calcPrice();
  },

  calcPrice() {
    const { files, config } = this.data;
    const totalPages = files.reduce((sum, f) => sum + (f.pages || 0), 0);
    let pricePerPage = config.color === 'bw' ? 0.2 : 1.0;
    if (config.paperSize === 'A3') pricePerPage *= 1.5;
    if (config.duplex === 'duplex') pricePerPage *= 0.6; // 双面时每面折价
    const estimatedPrice = (totalPages * pricePerPage * config.copies).toFixed(2);
    this.setData({ totalPages, estimatedPrice });
  },

  goConfig() {
    wx.setStorageSync('printConfig', this.data.config);
    wx.navigateTo({ url: '/pages/config/config' });
  },

  goConfirm() {
    if (this.data.files.length === 0) {
      wx.showToast({ title: '请先选择文件', icon: 'none' });
      return;
    }
    wx.setStorageSync('printConfig', this.data.config);
    wx.setStorageSync('uploadFiles', this.data.files);
    wx.navigateTo({ url: '/pages/confirm/confirm' });
  }
});
