//logs.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var util = require('../../utils/util.js')
Page({
  data: {
    logs: []
  },

  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset: function() {
    console.log('form发生了reset事件')
  },

  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      })
    })
  }
})
