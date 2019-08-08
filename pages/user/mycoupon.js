// pages/user/mycoupon.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: [],
    taskTimer: null, //页面级定时函数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  //下拉刷新
  onPullDownRefresh: function() {
    this.getList();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(opt) {
    //用户授权登录
    app.login();
    var that = this;
    that.getList();
    that.startUpTimer();
  },

  //获取列表
  getList: function() {
    var that = this;
    wx.request({
      url: rootDocment + '/api/com_get/getCoupon',
      data: {
        user_id: app.globalData.userID,
        active_id: 1,
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res);
        that.setCountDown(res.data.coupon_list);
        that.setData({
          couponList: res.data.coupon_list,
        });
      }
    });
  },

  // 启动定时函数判断函数
  startUpTimer: function() {
    let that = this;
    //现在开始设置taskTimer， 如果已经有函数，不启动。
    if (!that.data.taskTimer) {
      console.log("启动定时器!");
      that.setData({
        taskTimer: setInterval(function() {
          that.task()
        }, 1000)
      })
    };
  },
  // 定时函数（里面的添加的函数可以每秒执行一次）
  task: function() {
    console.log('我的红包task在执行！');
    var that = this;
    that.setCountDown(that.data.couponList);
  },
  // 清除定时函数
  clearTimer: function() {
    console.log('关闭定时器！');
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
  // 以下是被定时的函数 //本页定时函数启动的地方有：每次onshow后 无启动条件;//
                      //对应清除的地方:每次onHide,onUnload后，无关闭条件//
                      //如果出问题请检查是否一一对应/////
  // 倒计时
  setCountDown: function(oList) {
    console.log('我是被定时执行的函数setCountDown');
    var that = this;
    var t_edate = '';
    var t_tamp = 0;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    for (var i = 0; i < oList.length; i++) {
      t_tamp = oList[i]['s_date'] * 1000; //结束时间戳 注PHP时间戳只精确到秒，js精确到毫秒
      if (n_tamp > t_tamp) {
        oList.splice(i, 1); //移除了
      } else if (t_tamp - n_tamp > 1 * 24 * 3600 * 1000) {
        //如果现在是1天外，那么不需要修改
        //这种情况就不用管
      } else {
        let formatTime = that.getFormat(t_tamp - n_tamp);
        oList[i]['countDD'] = `${formatTime.dd}`;
        oList[i]['countHH'] = `${formatTime.hh}`;
        oList[i]['countMM'] = `${formatTime.mm}`;
        oList[i]['countSS'] = `${formatTime.ss}`;
        //只修改个别字段,不同页面稍有不同
        that.setData({
          ['couponList[' + i + '].countDD']: oList[i].countDD,
          ['couponList[' + i + '].countHH']: oList[i].countHH,
          ['couponList[' + i + '].countMM']: oList[i].countMM,
          ['couponList[' + i + '].countSS']: oList[i].countSS,
        });
      }
    }
  },
  //格式化时间
  getFormat: function(msec) {
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