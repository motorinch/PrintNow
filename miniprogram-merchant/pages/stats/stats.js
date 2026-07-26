// miniprogram-merchant/pages/stats/stats.js
Page({
  data: {
    stats: { todayOrders:0,todayIncome:0,weekOrders:0,weekIncome:0,monthOrders:0,monthIncome:0,totalOrders:0,totalIncome:0 },
    chartData: [], statusDist: []
  },
  onShow() { this.loadStats(); },
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'getStats', data: { role: 'merchant' } });
      if (result) {
        this.setData({
          stats: result.summary || this.data.stats,
          chartData: this.buildChart(result.daily || []),
          statusDist: this.buildStatusDist(result.statusDist || [])
        });
      }
    } catch (e) { console.error(e); }
  },
  buildChart(daily) {
    const colors = ['#4A90D9','#4A90D9','#4A90D9','#4A90D9','#4A90D9','#F39C12','#E74C3C'];
    const maxVal = Math.max(...daily.map(d => d.count), 1);
    return daily.map((d,i) => ({ label: d.date?d.date.slice(5):'', value: d.count, height: Math.max(10,d.count/maxVal*150), color: colors[i]||'#4A90D9' }));
  },
  buildStatusDist(items) {
    const cm = { '待支付':'#E65100','已支付':'#1565C0','打印中':'#2E7D32','待取件':'#C62828','已完成':'#27AE60','已取消':'#95A5A6' };
    const total = items.reduce((s,i)=>s+i.count,0)||1;
    return items.map(i => ({ ...i, pct: Math.round(i.count/total*100), color: cm[i.label]||'#999' }));
  }
});