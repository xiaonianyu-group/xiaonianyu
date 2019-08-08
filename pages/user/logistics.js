// pages/user/logistics.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logistics: {},
    info:[],
    infoLength:0,
    order_id:'',
  },

  //查看物流
  showSend: function (id) {
    var that = this;
    wx.request({
      url: rootDocment + '/api/express/get',
      data: { id: id },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data.data)
        console.log(JSON.parse(res.data.data.info));
        let info = JSON.parse(res.data.data.info);
        info.forEach(function(item,index) {
          let day = item.ftime.slice(5, 10);
          let isTimer = item.ftime.slice(11, 16);
          item.day = day;
          item.isTimer = isTimer;
        });
        that.setData({
          logistics: res.data.data,
          info,
          infoLength:info.length,
          order_id:id,
        });
      }
    })
  },
  // 复制
  copyHandle() {
    wx.showToast({
      title: '复制成功',
    })
    wx.setClipboardData({
      data: this.data.logistics.express_sn,
      success: function (res) {
        wx.getClipboardData({
          //这个api是把拿到的数据放到电脑系统中的
          success: function(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.showSend(options.id);
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

  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.showSend(this.data.order_id);
    wx.stopPullDownRefresh();
  }
})