// pages/user/myaddress.js

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
    dateList: [],

    // 删除
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  //下拉刷新
  onPullDownRefresh: function() {
    this.getAddress();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //用户授权登录
    app.login();
    this.getAddress();
  },

  /**
   * 获取地址列表
   */
  getAddress: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_address',
      data: {
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data);
        that.setData({
          dateList: res.data,
          hiddenLoading: true
        });
      }
    })
  },

  /**
   * 设置默认地址
   */
  changeAddress: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var key = e.currentTarget.dataset.key;
    var dateList = that.data.dateList;
    for (var j = 0; j < dateList.length; j++) {
      dateList[j]['is_default'] = 0;
    }
    dateList[key]['is_default'] = 1;
    that.setData({
      dateList: dateList
    });
    wx.request({
      url: rootDocment + '/api_address/' + id,
      data: {
        m_default: 1,
        user_id: app.globalData.userID
      },
      method: 'PUT',
      header: {},
      success: function(res) {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  /**
   * 添加地址
   */
  addAddress: function() {
    app.redirect('user/addaddress');
  },

  /**
   * 编辑地址
   */
  editAddress: function(e) {
    var id = e.currentTarget.dataset.id
    if (!id) return;
    app.redirect('user/editaddress', 'id=' + id);
  },

  //删除地址
  delAddress: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var paraArr = new Array();
    paraArr['id'] = id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要删除吗！',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_address/' + id,
            data: {
              user_id: paraArr['user_id'],
              sign: sign
            },
            method: 'DELETE',
            header: {},
            success: function(res) {
              // wx.navigateBack({
              //   delta: 1
              // })
              that.getAddress();
              wx.stopPullDownRefresh();
            }
          })
        }
      }
    })
  },




  /**
   * 显示删除按钮
   */
  showDeleteButton: function(e) {
    let productIndex = e.currentTarget.dataset.productindex
    this.setXmove(productIndex, -65)
  },

  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function(e) {
    let productIndex = e.currentTarget.dataset.productindex
    this.setXmove(productIndex, 0)
  },

  /**
   * 设置movable-view位移
   */
  setXmove: function(productIndex, xmove) {
    let dateList = this.data.dateList
    dateList[productIndex].xmove = xmove

    this.setData({
      dateList: dateList
    })
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function(e) {
    if (e.detail.source === 'friction') {
      if (e.detail.x < -30) {
        this.showDeleteButton(e)
      } else {
        this.hideDeleteButton(e)
      }
    } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
      this.hideDeleteButton(e)
    }
  },

  /**
   * 处理touchstart事件
   */
  handleTouchStart(e) {
    this.startX = e.touches[0].pageX
  },

  /**
   * 处理touchend事件
   */
  handleTouchEnd(e) {
    if (e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
      this.showDeleteButton(e)
    } else if (e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pageX - this.startX < 30) {
      this.showDeleteButton(e)
    } else {
      this.hideDeleteButton(e)
    }
  },


})