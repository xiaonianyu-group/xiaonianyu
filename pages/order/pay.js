// pages/order/pay.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pay_type: 1,
    order_sn: '',
    pay_total: 99999,
    order_type: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var m_sn = options.sn;
    var m_type = 1;
    if (typeof (options.type) != "undefined") m_type = options.type;
    if (m_type == 1) { //订单支付
      wx.request({
        url: rootDocment + '/api/com_get/getOrderPrice',
        data: { sn: m_sn, user_id: app.globalData.userID },
        method: 'GET',
        header: {},
        success: function (res) {
          if (res.data.code=='1001'){
            that.setData({
              order_sn: m_sn,
              pay_total: res.data.data.total
            });
          }
          else {
            wx.showModal({
              title: '提示',
              content: '此订单不存在或已支付！',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
          }
        }
      })
    }
    else { //2:充值
      that.setData({
        pay_total: options.total,
        order_type: m_type
      });
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
  },

  //切换支付方式
  changePay: function(e){
    var that = this;
    that.setData({
      pay_type: e.detail.value
    });
  },

  //稍后支付
  payLater: function () {
    var that = this;
    if (that.data.order_type == 1) {
      app.gourl('user/myorder', 'type=0');
    }
    else {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  //立即支付
  payNow: function () {
    var that = this;
    if (that.data.pay_type==1){//微信支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/wx_pay',
        data: { order_no: that.data.order_sn, open_id: app.globalData.openID, total: that.data.pay_total, uid: app.globalData.userID, order_type: that.data.order_type },
        method: 'GET',
        header: {},
        success: function (res) {
          console.log(res.data);
          console.log(res.data.timeStamp);
          console.log(res.data.nonceStr);
          console.log(res.data.package);
          console.log(res.data.paySign);
          //更新订单formID
          if (that.data.order_type == 1) {
            var form_id = res.data.package.replace('prepay_id=','');
            wx.request({
              url: rootDocment + '/api/com_get/updateFormID',
              data: { sn: that.data.order_sn, prepay_id: form_id },
              method: 'GET',
              header: {},
              success: function (res) {
              }
            })
          }

          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              if (that.data.order_type == 1) {
                app.redirect('user/myorder', 'type=');
              }
              else {
                app.gotaburl('user/index');
              }
            },
            'fail': function (res) {
              console.log(res);
            }
          })
          
        }
      })
    }
    else {//余额支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/balance_pay',
        data: { sn: that.data.order_sn, user_id: app.globalData.userID },
        method: 'POST',
        header: {},
        success: function (res) {
          if (res.data.code == '1001') {
            app.redirect('user/myorder', 'type=');
          }
          else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        }
      })
    }
  },

})