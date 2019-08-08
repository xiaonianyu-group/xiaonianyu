// pages/user/cashWithdrawal.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: 0,
    tx_money: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    // commission
    this.setData({
      total: options.commission
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getMoney: function(e) {
    var that = this;
    var value = e.detail.value;

    that.setData({
      tx_money: value
    })

    console.log(e);

  },
  cashWithdrawal: function() {
    var that = this;
    if (that.data.tx_money < 50) {
      return;
    }
    if (that.data.tx_money > 500) {
      wx.showToast({
        title: '金额超500 !',
        icon: 'none',
        duration: 1000,
        mask: true
      });
      return;
    }
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    paraArr['m_fee'] = that.data.tx_money;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/user_pay_log/save',
      data: {
        user_id: paraArr['user_id'],
        m_fee: paraArr['m_fee'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res);
        if (res.data.code == "1001") {
          wx.redirectTo({
            url: '/pages/user/cashSuccess'
          })
        } else {
          wx.showToast({
            title: res.data.msg + ' !',
            icon: 'none'
          })
        }

      }
    })

  },

  fullCashWithdrawal: function() {
    var that = this;

    that.setData({
      tx_money: that.data.total
    })

  }
})