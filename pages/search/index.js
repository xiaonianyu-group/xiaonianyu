// pages/search/index.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },

  goSearch: function () {
    var key = this.data.inputVal.replace(/\s+/g, "");
    if (key == '') {
      wx.showToast({
        title: '关键词为空！',
        icon: 'none'
      })
    }
    else {
      app.redirect('search/list', 'key=' + key);
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})