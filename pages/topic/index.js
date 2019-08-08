// pages/topic/index.js

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
    topicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setTopicData();
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.setTopicData();
    wx.stopPullDownRefresh();
  },

  //初始化新品
  setTopicData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = '10';
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_topic',
      data: { size: paraArr['size'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          topicList: res.data.data,
          hiddenLoading: true
        });
      }
    })
  },

})