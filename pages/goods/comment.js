// pages/goods/comment.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rootUrl: rootDocment,
    hiddenLoading: false,
    gid: 0,
    clist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setListData(options.gid);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setListData(that.data.gid);
    wx.stopPullDownRefresh();
  },

  //初始化
  setListData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['goods_id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_comment',
      data: { goods_id: id, sign: sign},
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          clist: res.data,
          gid: id,
          hiddenLoading: true
        });
      }
    })
  },

})