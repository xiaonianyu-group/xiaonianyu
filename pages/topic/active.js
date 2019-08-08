// pages/topic/active.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    scrollHeight: 0,
    page: 1,
    lastPage: 0,
    timer: null,
    is_new:1,
    isLoadData: false,

    active_id: 0,//默认没有活动
    packetShow:true,
    packetList:[],
    packetListshow:false,
    taskTimer: null,//页面级定时函数
  },
  initLoadData() {
    // if (this.data.isLoadData) return;
    let id = app.globalData.userID; 
    if (id) {
      this.loadList();
      // this.data.isLoadData = true;
      return;
    }

    let timer = setInterval(() => {
      id = app.globalData.userID; 
      if (id) {
        clearInterval(timer);
        this.loadList();
      }
    }, 50);
    // this.data.isLoadData = true;
  },
  // 初始化商品列表
  loadList() {
    var that = this;
      var paraArr = new Array();
      let id = app.globalData.userID;      
      var sign = app.signature(paraArr);
      console.log(id)
      wx.request({
        url: rootDocment + '/api/com_get/getNewGoodsList/',
        data: {
          size: 10,
          index: 0,
          user_id: id,
          page: that.data.page,
          sign: sign,
          isNew: new Date(),
        },
        method: 'GET',
        header: {},
        success: function (res) {
          console.log("下面是新人专享商品列表！！！！！！！");
          console.log(res);
          let arr = [...res.data.new_goods_list.data];
          let list = that.data.goodsList;
          
          // 防止加载相同数据
          if (list[list.length - 1]) {
            if (arr[arr.length - 1].id == list[list.length - 1].id) {
              console.log('商品重复!');
              return;
            }
          }

          arr.forEach(function (item, index) {
            list.push(item);
          });
          that.setData({
            goodsList: list,
          });
          if (that.data.page <= 1) {
            that.setData({
              lastPage: res.data.new_goods_list.last_page,
              is_new: res.data.is_new,
              active_id: res.data.active_id,
            });
            if (res.data.active_id != 0) {
              that.setData({
                packetShow:false,
              });
            }
          };
        }
      });
  },

  //滚动到底部触发事件  
  showScrollLower: function () {
    var that = this;
    let page = that.data.page;
    if (page < that.data.lastPage) {
      page++;
      that.setData({
        page: page
      });
      that.loadList();
      return;
    }
    console.log('最后一页：'+ that.data.page)
  },

  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    if (e.detail.scrollTop > 100) {
      this.setData({
        hiddenTop: false
      });
    } else {
      this.setData({
        hiddenTop: true
      });
    }
  },

  // 自定义分享事件
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '好货不贵，小年鱼邀你一起耍大牌，新人优惠，直降500，仅限首单！',
      imageUrl: 'https://img.xiaonianyu.com/1563330683su.png',
      path: '/pages/index/index?isActive=true',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  //抢红包
  strongPacket: function() {
    let that = this;
    let activeId = that.data.active_id;
    let userId = app.globalData.userID;
    wx.request({
      url: rootDocment + '/api/coupon/active',
      data: {
        id: activeId,
        user_id: userId,
      },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log('抢红包ajax成功后的动作');
        console.log(res);
        that.setCountDown(res.data);
        that.setData({
          packetList:res.data,
          packetListshow:true,
        });
        //阿拉丁埋点
        app.aldstat.sendEvent("抢红包",{});
        // 启动定时器，主要作用加判断
        that.startUpTimer();
      }
    });
  },

  //关闭红包
  closePacket: function() {
    console.log('关闭红包');
    this.setData({
      packetShow: true,
    });
    //阿拉丁埋点
    app.aldstat.sendEvent("关闭红包", {});
  },

  //打开红包
  OpendPacket: function () {
    console.log('红包列表activeid恢复');
    let that = this;
    that.setData({
      packetShow: false,
    });
  },

  //关闭红包列表activeid清零
  closeOpendPacket: function() {
    console.log('关闭红包列表activeid清零');
    let that = this;
    that.setData({
      active_id:0,
    });
    //清除定时器
    that.clearTimer();
  },

  //跳转页面
  goH5: function () {
    let url = 'https://saptest.xiaonianyu.com/miniapph5/trust.html';
    wx.navigateTo({
      url: '/pages/topic/trust?url=' + url,
    })
  },
  goIndex: function () {
    app.gotaburl('index/index');
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("#### new -> load ####");
    let that = this;
    if (options.scene) {
      app.globalData.fxID = options.scene.split("_")[0];
    };
    // 如果有广告
    if (options.gdt_vid) {
      getApp().globalData.gdt_vid = options.gdt_vid;//储存一次性数据
    }
    app.login(function () {
      console.log(app.globalData.isNew)
      if (!app.globalData.isNew) {
        app.gotaburl('index/index');
        return;
      }
      // that.loadList();
      // that.initLoadData();
    });

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    //阿拉丁埋点
    app.aldstat.sendEvent("进入新人专享活动页", {});
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
    console.log("#### new -> show ####");
    // let that = this;
    // if (that.data.is_new != 1) {
    //   app.gotaburl('index/index?isActive=false');
    //   return;
    // };
    if (app.globalData.userID > 0 && !app.globalData.isNew) {
      app.gotaburl('index/index');
      return;
    }
    //暂行办法，原因是用户id开始获取不到  
    this.initLoadData();
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
    // this.loadList();
    // wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
    that.setCountDown(that.data.packetList);
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
          ['packetList[' + i + '].countDD']: oList[i].countDD,
          ['packetList[' + i + '].countHH']: oList[i].countHH,
          ['packetList[' + i + '].countMM']: oList[i].countMM,
          ['packetList[' + i + '].countSS']: oList[i].countSS,
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