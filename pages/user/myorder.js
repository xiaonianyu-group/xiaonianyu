// pages/user/myorder.js

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
    order_type: -1,
    orderList: [],
    gray: '提醒发货',
    pay_type: 1, // 微信支付
    pay_total: 99999, //预防出错
    wx_order_type: 1, //
    taskTimer: null, //页面级定时函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options.type != '') {
      that.setData({
        order_type: options.type
      });
    }
  },

  //下拉刷新
  onPullDownRefresh: function() {
    this.getOrder();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(opt) {
    console.log('订单列表onshow！');
    var that = this;
    //用户授权登录
    app.login();
    //暂行办法，原因是用户id开始获取不到  
    that.initLoadData();// that.getOrder();
    // 启动定时器,一定要最后启动，添加条件
    that.startUpTimer();
  },
  initLoadData() {
    let that = this;
    let id = app.globalData.userID;
    if (id) {
      that.getOrder();
      return;
    }
    let timer = setInterval(() => {
      id = app.globalData.userID;
      if (id) {
        clearInterval(timer);
        that.getOrder();
      }
    }, 50);
  },

  //切换订单
  changeOrder: function(e) {
    var that = this;
    console.log(e);
    var otype = e.currentTarget.dataset.type;
    that.setData({
      order_type: otype
    });
    that.getOrder();
    // 启动定时器,一定要最后启动
    that.startUpTimer();
  },

  //获取订单列表
  getOrder: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['state'] = that.data.order_type;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_order',
      data: {
        state: paraArr['state'],
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data)
        // 修饰数据
        res.data.forEach(function(item, index) {
          let num = 0;
          for (let i = 0; i < item.goods.length; i++) {
            num += item.goods[i].amount;
          }
          item.goods_allNum = num;
        });
        that.setData({
          orderList: res.data,
          hiddenLoading: true,
        });
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
          order_type: that.data.wx_order_type
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
                console.log(1)
                // app.redirect('user/myorder', 'type=');
                app.gourl('user/myorderdetail', 'order_sn=' + order_sn + '0001' + '&id=' + app.globalData.userID);
              } else {
                console.log(2)
                // app.gotaburl('user/index');
                app.redirect('user/myorderdetail', 'order_sn=' + order_sn + '0001' + '&id=' + app.globalData.userID);
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
              app.gourl('user/myorder', 'type=' + that.data.order_type);
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
              app.gourl('user/myorder', 'type=3');
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
              app.gourl('user/myorder', 'type=' + that.data.order_type);
            }
          })
        }
      }
    })
  },
  //提醒发货
  tixingHandle(e) {
    var that = this;
    let orderList = that.data.orderList;
    let index = e.currentTarget.dataset.index;
    orderList[index].gray = "已提醒";
    console.log(orderList);
    that.setData({
      orderList: orderList,
    })
  },
  // 启动定时函数
  startUpTimer:function() {
    let that = this;
    var otype = that.data.order_type;
    console.log(that.data.order_type);
    if (otype == -1 || otype == 0) {
      //现在开始设置taskTimer， 如果已经有函数，不启动。
      console.log()
      if (!that.data.taskTimer) {
        console.log("启动定时器!");
        that.setData({
          taskTimer: setInterval(function () {
            that.task()
          }, 1000)
        })
      };
    } else {
      console.log("关闭定时器!");
      that.clearTimer();
    };
  },
  // 定时函数（里面的添加的函数可以每秒执行一次）
  task: function() {
    console.log('订单列表定时器在执行！');
    var that = this;
    that.setCountDown(that.data.orderList);
  },
  // 清除定时函数
  clearTimer: function() {
    clearInterval(this.data.taskTimer);
    this.setData({
      taskTimer: null,
    })
  },
  onHide: function() {
    // 清除定时函数
    this.clearTimer();
  },

  onUnload: function() {
    // 清除定时函数
    this.clearTimer();
  },


  // 以下是被定时的函数 //本页定时函数启动的地方有：每次onshow后 当 => type == -1 type == 0;切换标签 当 => type == -1 type == 0;//
                      //对应清除的地方:每次onHide,onUnload后，切换标签 当 => type == 1,type == 2;//
                      //如果出问题请检查是否一一对应/////
  // 倒计时
  setCountDown: function (orderList) {
    let time = 1000;
    var that = this;
    var t_edate = '';
    var t_tamp = 0;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    // var orderList = that.data.orderList;
    for (var i = 0; i < orderList.length; i++) {
      t_edate = orderList[i]['add_date'];
      t_edate = t_edate.substring(0, 19);
      t_edate = t_edate.replace(/-/g, '/');
      t_tamp = parseInt(new Date(t_edate).getTime());
      t_tamp = parseInt(t_tamp) + 1800000; //结束时间戳
      if (n_tamp > t_tamp) {
        // orderList.splice(i, 1); //移除了
      } else {
        let formatTime = that.getFormat(t_tamp - n_tamp);
        orderList[i]['countDD'] = `${formatTime.dd}`;
        orderList[i]['countHH'] = `${formatTime.hh}`;
        orderList[i]['countMM'] = `${formatTime.mm}`;
        orderList[i]['countSS'] = `${formatTime.ss}`;
      }
    }
    that.setData({
      orderList: orderList,
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

})