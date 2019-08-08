// pages/user/addaddress.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: ['', '', ''],
    addr: '',
    name: '',
    tel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //用户授权登录
    app.login();
  },

  /**
   * 选择地址
   */
  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value,
    })
  },

  /**
   * 获取微信地址
   */
  getAddress: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.address']) {
          //已经允许过
          wx.chooseAddress({
            success(res) {
              that.setData({
                region: [res.provinceName, res.cityName, res.countyName],
                addr: res.detailInfo,
                name: res.userName,
                tel: res.telNumber
              })
            }
          })

        } else {
          if (res.authSetting['scope.address'] == false) {
            //如果之前拒绝了就调起设置窗口
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
              }
            })
          } else {
            //首次允许后
            wx.chooseAddress({
              success(res) {
                that.setData({
                  region: [res.provinceName, res.cityName, res.countyName],
                  addr: res.detailInfo,
                  name: res.userName,
                  tel: res.telNumber
                })
              }
            })
          }
        }
      }
    })
  },

  /**
   * 添加地址
   */
  formSubmit: function(e) {
    var that = this;
    var m_province = e.detail.value.m_city[0];
    var m_city = e.detail.value.m_city[1];
    var m_county = e.detail.value.m_city[2];
    var m_addr = e.detail.value.m_addr;
    var m_name = e.detail.value.m_name;
    var m_tel = e.detail.value.m_tel;
    var m_default = true;
    if (m_default) {
      m_default = 1;
    } else {
      m_default = 0;
    }


    if (m_name == '') {
      // wx.showModal({
      //   title: '提示',
      //   content: '姓名为空！'
      // })
      wx.showModal({
        title: '提示',
        content: '姓名为空！',
        showCancel: false, //是否显示取消按钮-----》false去掉取消按钮
        cancelText: "否", //默认是“取消”
        cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "确定", //默认是“确定”
        confirmColor: '#333', //确定文字的颜色
        success: function(res) {
          if (res.cancel) {
            //点击取消
            console.log("您点击了取消")
          } else if (res.confirm) {
            //点击确定
            console.log("您点击了确定")
          }
        }
      })
      return false;
    }

    var myreg = /^((1[3,5,8][0-9])|(14[5,7,9])|(16[6])|(19[8,9])|(17[0,1,3,5,6,7,8]))\d{8}$/
    if (!myreg.test(m_tel)) {
      wx.showModal({
        title: '提示',
        content: '手机号码输入有误！',
        showCancel: false, //是否显示取消按钮-----》false去掉取消按钮
        cancelText: "否", //默认是“取消”
        cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "确定", //默认是“确定”
        confirmColor: '#333', //确定文字的颜色
        success: function(res) {
          if (res.cancel) {
            //点击取消
            console.log("您点击了取消")
          } else if (res.confirm) {
            //点击确定
            console.log("您点击了确定")
          }
        }
      })
      return false;
    }

    let region = that.data.region.join('');
    console.log(region)
    if (region == '省市区') {
      // wx.showModal({
      //   title: '提示',
      //   content: '请选择省市区！'
      // })
      wx.showModal({
        title: '提示',
        content: '请选择省市区！',
        showCancel: false, //是否显示取消按钮-----》false去掉取消按钮
        cancelText: "否", //默认是“取消”
        cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "确定", //默认是“确定”
        confirmColor: '#333', //确定文字的颜色
        success: function(res) {
          if (res.cancel) {
            //点击取消
            console.log("您点击了取消")
          } else if (res.confirm) {
            //点击确定
            console.log("您点击了确定")
          }
        }
      })
      return false;
    }

    if (m_addr == '') {
      // wx.showModal({
      //   title: '提示',
      //   content: '详细地址为空！'
      // })
      wx.showModal({
        title: '提示',
        content: '详细地址为空！',
        showCancel: false, //是否显示取消按钮-----》false去掉取消按钮
        cancelText: "否", //默认是“取消”
        cancelColor: 'skyblue', //取消文字的颜色
        confirmText: "确定", //默认是“确定”
        confirmColor: '#333', //确定文字的颜色
        success: function(res) {
          if (res.cancel) {
            //点击取消
            console.log("您点击了取消")
          } else if (res.confirm) {
            //点击确定
            console.log("您点击了确定")
          }
        }
      })
      return false;
    }
    
    wx.request({
      url: rootDocment + '/api_address',
      data: {
        m_province: m_province,
        m_city: m_city,
        m_county: m_county,
        m_address: m_addr,
        m_name: m_name,
        m_tel: m_tel,
        m_default: m_default,
        user_id: app.globalData.userID
      },
      method: 'POST',
      header: {},
      success: function(res) {
        wx.navigateBack({
          delta: 1
        })
      }
    })
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

})