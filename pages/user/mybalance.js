// pages/user/mybalance.js

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
    balance: 0,
    dataList: [],
    showPop: false
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
    paraArr['type'] = 'balance';
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getPayLog',
      data: { user_id: paraArr['user_id'], type: paraArr['type'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          dataList: res.data.list,
          balance: res.data.balance,
          hiddenLoading: true
        });
      }
    })
  },
  
  /*
  *弹窗
   */
  recharge: function () {
    var that = this;
    that.setData({
      showPop: !that.data.showPop
    });
  },

  /**
   * 确认充值
   */
  formSubmit: function (e) {
    var that = this;
    var m_total = e.detail.value.m_total;

    var myreg = /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/;
    if (!myreg.test(m_total)) {
      wx.showModal({
        title: '提示',
        content: '充值金额不正确！'
      })
      return false;
    }
    app.gourl('order/pay', 'type=2&total=' + m_total);
  },

})