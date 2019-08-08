// pages/order/usePacket.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active_id:0,//默认没有活动
    price:0,//订单价格默认为零
    couponList: [],//红包列表
    closePacketList: true,//红包列表默认隐藏
    coupon_id:0,//红包id
    taskTimer:null,//全局定时函数
  },
  //获取红包
  setCouponData: function (order_price, packet_index) {
    var that = this;
    wx.request({
      url: rootDocment + '/api/com_get/getCoupon',
      data: {
        price: order_price,
        user_id: app.globalData.userID,
        active_id: 1,
      },
      method: 'GET',
      header: {},
      success: function (res) {
        //遍历数据
        let arr = [];
        res.data.coupon_list.forEach((item, index) => {
          item.is_use = 0;
          if (packet_index == '') {
            //
          }else if (packet_index == index) {
            console.log(packet_index == index)
            item.is_use = 1;
            that.setData({
              coupon_id: item.id,
            });
          }
          arr.push(item);
        });
        console.log(res);
        that.setCountDown(arr);
        that.setData({
          coupon_enable: res.data.enable,
          couponList: arr,
        });
        // 启动定时器，加条件判断
        that.startUpTimer();
      }
    })
  },

  //切换红包
  couponChange: function (e) {
    var that = this;
    let i = e.currentTarget.dataset.index;
    let yh_price = e.currentTarget.dataset.yh_price;
    console.log(i, yh_price)
    let arr = [];
    that.data.couponList.forEach((item, index) => {
      item.is_use = 0;
      if (i == index) {
        item.is_use = 1;
        that.setData({
          coupon_id: item.id,
        });
      }
      arr.push(item);
    });
    that.setData({
      couponList: arr,
      coupon_price: yh_price,
    })
    that.returnData(i);
  },

  //不使用红包
  closePacketList: function () {
    var that = this;
    let arr = [];
    let i = '';
    that.data.couponList.forEach((item, index) => {
      item.is_use = 0;
      arr.push(item);
    });
    that.setData({
      couponList: arr,
      coupon_price: 0,
    })
    that.returnData(i);
  },

  //设计数据
  returnData: function (i) {
    let that = this;
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
      coupon_price: that.data.coupon_price,
      packet_index:i,
      coupon_id:that.data.coupon_id,
    })//上一个页面内执行setData操作，将我们想要的信息保存住。当我们返回去的时候，页面已经处理完毕。
    //最后就是返回上一个页面。
    wx.navigateBack({
      delta: 1  // 返回上一级页面。
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setCouponData(options.order_price, options.packet_index);
    //阿拉丁埋点
    app.aldstat.sendEvent("订单确认页，使用红包", {});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 启动定时函数判断函数
  startUpTimer: function () {
    let that = this;
    //现在开始设置taskTimer， 如果已经有函数，不启动。
    if (!that.data.taskTimer) {
      console.log("启动定时器!");
      that.setData({
        taskTimer: setInterval(function () {
          that.task()
        }, 1000)
      })
    };
  },
  // 定时函数（里面的添加的函数可以每秒执行一次）
  task: function () {
    console.log('我的红包task在执行！');
    var that = this;
    that.setCountDown(that.data.couponList);
  },
  // 清除定时函数
  clearTimer: function () {
    console.log('关闭定时器！');
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
  // 以下是被定时的函数 //本页定时函数启动的地方有：每次onshow后 无启动条件;//
                      //对应清除的地方:每次onHide,onUnload后，无关闭条件//
                      //如果出问题请检查是否一一对应/////
  // 倒计时
  setCountDown: function (oList) {
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