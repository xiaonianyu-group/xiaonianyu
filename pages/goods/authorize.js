// pages/goods/authorize.js

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
    rootUrl: rootDocment,
  },


  //初始化图片
  initial: function (goods_id) {
    var that = this;
    var paraArr = new Array();
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/goods/getGoodsSupplierBook/',
      data: {
        goods_id: goods_id,
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function (res) {
        WxParse.wxParse('article', 'html', res.data, that, 5);
        console.log(res.data.split(';'));
        // let imgUrl = JSON.parse(res.data);
        // console.log(imgUrl)
      }
    })
  },

  previewImage(e) {
    console.log(e)
    var current = e.currentTarget.dataset.src;
    let arr =[];
    arr.push(current);
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: arr // 需要预览的图片http链接列表  
    })
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    that.initial(options.goods_id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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