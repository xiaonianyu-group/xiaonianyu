// pages/fenxiao/index.js

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
    userInfo: [],
    distribut_money: 0,
    distribut_enbale_money: 0.00,
    team_size: 0,
    showShare: false,
    sharePic: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.getInfo();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    //用户授权登录
    app.login(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
    that.getInfo();
  },

  //获取信息
  getInfo: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/fenxiao',
      data: { user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res)
        that.setData({
          distribut_money: res.data.money,
          team_size: res.data.team_size,
          distribut_enbale_money: res.data.distribut_enable_money,
          hiddenLoading: true
        });
      }
    })
  },

  //获取分享图
  getPic: function () {
    var that = this;
    if (that.data.showShare) {
      that.setData({
        showShare: !that.data.showShare
      });
    }
    else {
      that.setData({
        hiddenLoading: false
      });
      var m_page = 'pages/index/index';
      var m_scene = app.globalData.userID;
      var paraArr = new Array();
      paraArr['page'] = m_page;
      paraArr['scene'] = m_scene;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api/get_qrcode',
        data: { page: m_page, scene: m_scene, sign: sign },
        method: 'GET',
        header: {},
        success: function (res) {
          console.log(res.data.msg);
          if (res.data.success == true) {
            that.setData({
              showShare: !that.data.showShare,
              sharePic: res.data.msg,
              hiddenLoading: true
            });
          }
        }
      })
    }

  },
  //保存分享图片
  savePic: function () {
    var that = this;
    wx.downloadFile({
      url: that.data.rootUrl + that.data.sharePic,
      success: function (res) {
        let path = res.tempFilePath
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(res) {
            wx.showToast({
              title: '保存成功'
            })
          },
          fail(res) {
            wx.showToast({
              title: '保存失败'
            })
          },
          complete(res) {
            that.setData({
              showPic: 0
            });
          }
        })
      }, fail: function (res) {
        console.log(res)
      }
    })

  }

})