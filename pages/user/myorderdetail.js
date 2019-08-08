// pages/user/myorderdetail.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [],
    currentID: '',
    currentOrder_sn: '',
    userInfo: [],
    pay_type: 1, // 微信支付
    pay_total: 99999, //预防出错
    order_type: 1, //
    shadow: false,

    iconShow:false,//显示动图
    oInvalidTimer:{},//订单失效倒计时
    add_date:"",//订单添加时间
    taskTimer:null,//页面级定时函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setDetailData(options.id, options.order_sn);
  },

  //下拉刷新
  onPullDownRefresh: function() {
    var that = this;
    this.setDetailData(that.data.currentID, that.data.currentOrder_sn);
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    //用户授权登录
    app.login(function(userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
    that.getInfo();
    // 启动定时器,一定要最后启动,添加条件
    that.startUpTimer();
  },

  //获取信息
  getInfo: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/fenxiao',
      data: {
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
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

  //初始化详情
  setDetailData: function(id, order_sn) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    paraArr['order_sn'] = order_sn;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_order/' + id,
      data: {
        user_id: paraArr['user_id'],
        order_sn: paraArr['order_sn'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data)
        that.setData({
          detail: res.data,
          currentID: id,
          currentOrder_sn: order_sn,
          add_date: res.data.add_date,
        });
        that.replaceIcon(res.data.order_sn, app.globalData.userID);
      }
    })
  },

  // //去付款 舍弃跳页面
  // goPay: function (e) { 
  //   app.redirect('order/pay', 'sn=' + e.currentTarget.dataset.sn);
  // },
  //立即支付
  goPay: function(e) {
    var that = this;
    console.log(e);
    let order_sn = e.currentTarget.dataset.sn;
    let total = e.currentTarget.dataset.pay_price;
    console.log(e)
    if (that.data.pay_type == 1) { //微信支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/wx_pay',
        data: {
          order_no: order_sn,
          open_id: app.globalData.openID,
          total: total || that.data.pay_total,
          uid: app.globalData.userID,
          order_type: that.data.order_type
        },
        method: 'GET',
        header: {},
        success: function(res) {
          //更新订单formID
          if (that.data.order_type == 1) {
            var form_id = res.data.package.replace('prepay_id=', '');
            wx.request({
              url: rootDocment + '/api/com_get/updateFormID',
              data: {
                sn: that.data.order_sn,
                prepay_id: form_id
              },
              method: 'GET',
              header: {},
              success: function(res) {}
            })
          }

          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function(res) {
              if (that.data.order_type == 1) {
                // app.redirect('user/myorder', 'type=');
                console.log(3)
                app.gourl('user/myorderdetail', 'order_sn=' + order_sn + '0001' + '&id=' + app.globalData.userID);
              } else {
                console.log(4)
                app.gotaburl('user/index');
              }
            },
            'fail': function(res) {
              console.log(res);
              
            }
          })

        }
      })
    } else { //余额支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/balance_pay',
        data: {
          sn: that.data.order_sn,
          user_id: app.globalData.userID
        },
        method: 'POST',
        header: {},
        success: function(res) {
          if (res.data.code == '1001') {
            app.redirect('user/myorder', 'type=');
          } else {
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

  //去评价
  goComment: function(e) {
    app.redirect('user/mycomment', 'id=' + e.currentTarget.dataset.id);
  },

  //取消订单
  cancelOrder: function(e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['m_type'] = 'cancel';
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要取消吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: {
              m_type: 'cancel',
              user_id: paraArr['user_id'],
              sign: sign
            },
            method: 'PUT',
            header: {},
            success: function(res) {
              app.redirect('user/myorder', 'type=0');
            }
          })
        }
      }
    })
  },

  //确认收货
  shOrder: function(e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['m_type'] = 'sh';
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要收货吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: {
              m_type: 'sh',
              user_id: paraArr['user_id'],
              sign: sign
            },
            method: 'PUT',
            header: {},
            success: function(res) {
              app.redirect('user/myorder', 'type=3');
            }
          })
        }
      }
    })
  },

  //查看物流
  showSend: function(e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    app.redirect('user/logistics', 'id=' + m_id);
  },

  //删除订单
  delOrder: function(e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id
    if (!m_id) return;
    var paraArr = new Array();
    paraArr['id'] = m_id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要删除吗？',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_order/' + m_id,
            data: {
              user_id: paraArr['user_id'],
              sign: sign
            },
            method: 'DELETE',
            header: {},
            success: function(res) {
              app.redirect('user/myorder', 'type=-1');
            }
          })
        }
      }
    })
  },

  //退换货
  toReturns: function(e) {
    var that = this;
    var m_id = e.currentTarget.dataset.id;
    var u_id = e.currentTarget.dataset.u_id;
    var order_sn = e.currentTarget.dataset.order_sn;
    app.redirect('user/returns', 'id=' + m_id + '&order_sn=' + order_sn + '&u_id=' + u_id);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  // 显示遮罩 
  showShadow(e) {
    let that = this;
    console.log(e)
    if (e.currentTarget.dataset.replace) {
      wx.setStorageSync(that.data.detail.user_id + that.data.currentOrder_sn,true);
      that.setData({
        iconShow:true,
      })
    }
    if (e.currentTarget.dataset.isshow) {
      wx.setStorageSync(that.data.detail.user_id + that.data.currentOrder_sn, true);
      that.setData({
        shadow: !that.data.shadow,
      })
    }
  },

  // 更换红包icon
  replaceIcon(order_sn,user_id) {
    let that = this;
    let iconId = user_id + order_sn;
    console.log(iconId)
    wx:wx.getStorage({
      key: iconId,
      success: function(res) {
        console.log(res)
        that.setData({
          iconShow: true,
          
        });
      },
      fail: function(res) {
        console.log(res)
        that.setData({
          shadow: true,
        });
        
      },
      complete: function(res) {},
    })
  },
  // 倒计时
  countdown: function () {
    var that = this;
    var time = 1000;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    var t_tamp = that.data.add_date;
    var mss = 0;
    var oInvalidTimer = {};

    t_tamp = t_tamp.substring(0, 19);
    t_tamp = t_tamp.replace(/-/g, '/');
    t_tamp = parseInt(new Date(t_tamp).getTime()); //结束时间戳
    t_tamp = parseInt(t_tamp) + 1800000;
    mss = t_tamp - n_tamp;

    let formatTime = that.getFormat(mss);
    oInvalidTimer['countDD'] = `${formatTime.dd}`;
    oInvalidTimer['countHH'] = `${formatTime.hh}`;
    oInvalidTimer['countMM'] = `${formatTime.mm}`;
    oInvalidTimer['countSS'] = `${formatTime.ss}`;
    console.log(oInvalidTimer);
    that.setData({
      oInvalidTimer,
    });
  },

  //格式化时间
  getFormat: function (msec) {
    let ss = parseInt(msec / 1000);
    let ms = parseInt(msec % 1000);
    let mm = 0;
    let hh = 0;
    let dd = 0;
    if (ss > 60) {
      mm = parseInt(ss / 60);
      ss = parseInt(ss % 60);
      if (mm > 60) {
        // dd = parseInt(hh / 24);
        // hh = parseInt(mm / 60);
        // mm = parseInt(mm % 60);
        hh = parseInt(mm / 60);
        mm = parseInt(mm % 60);
        if (hh > 24) {
          dd = parseInt(hh / 24);
          hh = parseInt(hh % 24);
        }
      }
    }
    ss = ss > 9 ? ss : `0${ss}`;
    mm = mm > 9 ? mm : `0${mm}`;
    hh = hh > 9 ? hh : `0${hh}`;
    return {
      ms,
      ss,
      mm,
      hh,
      dd
    };
  },
  // 启动定时函数，主要作用是添加判断条件是否启动
  startUpTimer: function () {
    let that = this;
    //现在开始设置taskTimer
    console.log(that.taskTimer);
    if (!that.taskTimer) {
      that.setData({
        taskTimer: setInterval(function () {
          that.task()
        }, 1000)
      })
    };
  },
  // 定时函数（里面的添加的函数可以每秒执行一次）
  task:function() {
    var that = this;
    console.log('订单详情task在执行！');
    that.countdown();
  },
  // 清除定时函数
  clearTimer: function () {
    console.log('订单详情clearTimer在执行！');
    clearInterval(this.data.taskTimer);
    this.setData({
      taskTimer: null,
    })
  }, 
  onHide: function () {
    // 清除定时函数
    this.clearTimer();
  },
  onUnload: function () {
    // 清除定时函数
    this.clearTimer();
  },

})