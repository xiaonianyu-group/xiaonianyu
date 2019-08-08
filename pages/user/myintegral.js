// pages/user/myintegral.js

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
    integral: 0,
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
    var that = this;
    that.getData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData();
    wx.stopPullDownRefresh();
  },
  
  /**
   * 获取数据
   */
  getData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    paraArr['type'] = 'integral';
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getPayLog',
      data: { user_id: paraArr['user_id'], type: paraArr['type'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          dataList: res.data.list,
          integral: res.data.integral,
          hiddenLoading: true
        });
      }
    })

  }

})