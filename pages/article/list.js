// pages/article/list.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    articleList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArticle();
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getArticle();
    wx.stopPullDownRefresh();
  },

  //获取列表
  getArticle: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "20";
    paraArr['cat'] = "7,8,9";
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_article',
      data: { size: paraArr['size'], cat: paraArr['cat'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          articleList: res.data.data,
          hiddenLoading: true
        });
      }
    })
  }
  
})