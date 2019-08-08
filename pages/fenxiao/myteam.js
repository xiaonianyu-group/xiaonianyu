// pages/fenxiao/myteam.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgPath: rootDocment,
    hiddenLoading: true,
    dataType: 1,
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
    that.getList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList();
    wx.stopPullDownRefresh();
  },

  //切换
  changeType: function (e) {
    var that = this;
    var otype = e.currentTarget.dataset.type
    that.setData({
      dataType: otype,
      dataList: []
    });
    that.getList();
  },

  //获取列表
  getList: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    paraArr['level'] = that.data.dataType;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/fenxiao/getUserList',
      data: { user_id: paraArr['user_id'], level: paraArr['level'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res);
        that.setData({
          dataList: res.data,
          hiddenLoading: true
        });
      }
    })
  }

})