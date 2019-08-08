// pages/article/detail.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    hiddenLoading: false,
    currentID: '',
    detail: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setDetailData(options.id);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setDetailData(that.data.currentID);
    wx.stopPullDownRefresh();
  },

  //初始化详情
  setDetailData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_article/' + id,
      data: { sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        WxParse.wxParse('article', 'html', res.data.info, that, 5);
        that.setData({
          hiddenLoading: true,
          currentID:id,
          detail: res.data
        });
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})