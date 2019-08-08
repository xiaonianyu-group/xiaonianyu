// pages/user/index.js

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
    userInfo: [],
    integral: 0,
    balance: 0,
    isFX:'',
    orderNum:[0,0,0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getUserInfo();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    //用户授权登录
    app.login(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        isFX: app.globalData.isFX
      })
    });
    this.getUserInfo();
   
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_user/' + paraArr['id'],
      data: { sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res);
        that.setData({
          integral: res.data.integral,
          balance: res.data.user_money,
          isFX: res.data.is_fx,
          hiddenLoading: true
        });
      }
    })
    var myArr = new Array();
    var numArr = [0, 0, 0];
    myArr['user_id'] = app.globalData.userID;
    var sign = app.signature(myArr);
    wx.request({
      url: rootDocment + '/api/order/orderConut/',
      data: { user_id: myArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data)
        that.setData({
          orderNum: res.data
        });
      }
    })
  },
  
  //清除缓存
  clearCache: function () {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success(res) {
        console.log(res);
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          })
        }
      }
    })
  },

})