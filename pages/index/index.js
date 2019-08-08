//index.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

//获取应用实例
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({
  data: {
    openId: app.globalData.openID,
    imgPath: rootDocment + '/upload/pic/',
    banner: [],
    currentID: 0,
    hiddenLoading: false,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    topicList: [],
    newGoodsList: [],
    hotGoodsList: [],
    inputShowed: false,
    inputVal: "",
    fid: 0,
    catList: [],
    hiddenTop: true,
    tabSelect: true,
    xianShi: {
      "countHH": "00",
      "countMM": "00",
      "countSS": "00"
    },
    e_date: "",
    new_people: 1,
    is_xl: false,
    th_type: "index",
    size: "10",
    page: 1,
    last_page: 0,
    new_list: [],
    swiper_index: 0,
    current: 0,
    aheight: 0,
    is_dj: true,
    detailID: 0,
    detailFlag: false,
    scroll_top : 0,
    user_id:"",
    //全局定时器执行间隔
    timeNumber: 1000,
    //全局定时器对象
    taskTimer: null,
    current_page: 1,
    activeFlag: true,
    isDataInit: false, // 首页数据是否初始化
  },
  onLoad: function(options) {
    console.log("#### home -> load ####");
    var that = this;
    let isForceRedirectNewPage = false;//不强制跳转新人页面
    console.log(options)
    // 如果要跳转新人页面
    if (options.isActive) {
      // 如果带有分销信息
      if (options.scene) {
        app.redirect('topic/active?scene=' + options.scene);
        return;
      }
      app.redirect('topic/active');
      return;
    }
    //获取分销ID
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      let arr = options.scene.split('_');

      let detailID = 0;

      if (arr.length >= 2) {
        detailID = arr[1];
      }
      if (arr.length >= 3) {
        isForceRedirectNewPage = true;
        // 已经获取到用户id如果不是新人
        if (!app.globalData.isNew && app.globalData.userID > 0) {
          isForceRedirectNewPage = false;
        }
      }
      that.setData({
        fid: arr[0],
        detailID: detailID,
        detailFlag: true,
      });
    }

    console.log(that.data.fid);
    console.log(that.data.detailID);
    if (that.data.detailID == 0 || that.data.detailID == undefined ) {
      if (isForceRedirectNewPage) {
        app.redirect('topic/active');
        return;
      }
      app.login(that.data.fid);
      console.log(app.globalData.userID)
    } else {
      if (isForceRedirectNewPage) {
        // that.setData({
        //   activeFlag: true,
        // });
        app.redirect('topic/active');
        return;
      }
      if (that.data.detailFlag) {
        that.setData({
          detailFlag: false,
        });
        app.redirect('goods/detail', 'id=' + that.data.detailID + '&scene=' + that.data.fid + '_' + that.data.detailID);
        return;
      };
    };

    this.initData();
    // }
  },

  initData: function() {

    if (this.data.isDataInit) return;

    let that = this;
    //初始化
    that.setHotGoodsData(that.data.currentID);
    this.setCategoryData();
    // that.setSlideData();
    that.setNewGoodsData();
    that.setTopicData(that.data.currentID, that.data.th_type, that.data.size, that.data.page);
    // if (this.data.hiddenLoading) {
    //   that.setsWiperHight();

    that.setData({
      isDataInit: true,
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("#### home -> show ####");
    this.initData();
    //用户授权登录
    var that = this;
    //现在开始设置taskTimer
    // if (!that.taskTimer) {
    //   that.setData({
    //     taskTimer: setInterval(function () {
    //       that.task()
    //     }, that.data.timeNumber)
    //   })
    // };
    // that.setsWiperHight();
    const res = wx.getSystemInfoSync();
    that.setData({
      aheight: res.windowHeight
    })
  },

  //下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      hiddenLoading: false
    });
    // this.setCategoryData();
    // this.setSlideData();
    if (this.data.swiper_index == 0) {
      this.setNewGoodsData();
    }
    this.setTopicData(this.data.currentID, this.data.th_type, this.data.size, this.data.page);
    this.setHotGoodsData(this.data.currentID);
    wx.stopPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.page <= that.data.last_page) {
      that.setData({
        page: that.data.page + 1
      })
      this.setTopicData(that.data.currentID, this.data.th_type, that.data.size, that.data.page);
    }

    // that.setsWiperHight();
    console.log("底部");
  },
  lower : function(){
    var that = this;
    if (that.data.page <= that.data.last_page) {
      that.setData({
        page: that.data.page + 1
      })
      this.setTopicData(that.data.currentID, this.data.th_type, that.data.size, that.data.page);
    }

    // that.setsWiperHight();
    console.log("底部");
  },
  //初始化分类
  setCategoryData: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['pid'] = 0;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/goods_category/all',
      data: {
        pid: paraArr['pid'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res);
        that.setData({
          catList: res.data,
          // banner: res.data.pic
        });
      }
    })
  },

  // 初始化幻灯片
  setSlideData: function() {
    // var that = this;
    // var paraArr = new Array();
    // paraArr['size'] = "5";
    // paraArr['stype'] = "3";
    // var sign = app.signature(paraArr);
    // wx.request({
    //   url: rootDocment + '/api_ads',
    //   data: {
    //     size: paraArr['size'],
    //     stype: paraArr['stype'],
    //     sign: sign
    //   },
    //   method: 'GET',
    //   header: {},
    //   success: function (res) {
    //     that.setData({
    //       imgUrls: res.data.data
    //     });
    //   }
    // })
  },

  //初始化新人专享
  setNewGoodsData: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = "6";
    paraArr['index'] = "1";
    
    var sign = app.signature(paraArr);
    var get_id = setInterval(function() {
      var is_null = that.data.user_id;
      if (is_null != "") {
        clearInterval(get_id);
      }
      wx.getStorage({
        key: 'user_id',
        success: function(res) {
          console.log(res.data)
          that.data.user_id = res.data;
          wx.request({
            // url: rootDocment + '/api/com_get/getFlashGoods',
            url: rootDocment + '/api/com_get/getNewGoodsList',
            data: {
              size: paraArr['size'],
              index: paraArr['index'],
              sign: sign,
              user_id: that.data.user_id,
            },
            method: 'GET',
            header: {},
            success: function(res) {
              that.setData({
                newGoodsList: res.data.new_goods_list.data,
                new_people: res.data.is_new
              });
            }
          })
        },
        fail: function(res) {
          console.log(res)
        }
      })
    }, 100)
  },

  //初始化专题
  setTopicData: function(id, type, size, page) {
    var that = this;
    if (id == 0) {
      var paraArr = new Array();
      paraArr['size'] = size;
      paraArr['stype'] = type;
      paraArr['page'] = page;
      paraArr['id'] = id;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api_topic',
        data: {
          cid: paraArr['id'],
          stype: paraArr['stype'],
          size: paraArr['size'],
          page: paraArr['page'],
          sign: sign
        },
        method: 'GET',
        header: {},
        success: function(res) {
          console.log(res.data)
          that.setCountDown(res.data.data);
          if (that.data.page <= res.data.last_page) {
            for (let i = 0; i < res.data.data.length; i++) {
              that.data.new_list.push(res.data.data[i]);
            }
          }
          let arr = that.data.new_list;
          arr.forEach((item, index) => {
            item.b_date = item.b_date.slice(5, 16).replace(/-/, ".");
          });
          that.setData({
            topicList: arr,
            last_page: res.data.last_page,
            current_page:res.data.current_page,
            hiddenLoading: true
          });
          // that.setsWiperHight();
        }
      })
    } else {
      var cArr = new Array();
      cArr['size'] = size;
      cArr['stype'] = type;
      cArr['page'] = page;
      cArr['id'] = id;
      var sign_c = app.signature(cArr);
      wx.request({
        url: rootDocment + '/api_topic',
        data: {
          cid: cArr['id'],
          size: cArr['size'],
          sign: sign_c,
          stype: cArr['stype'],
          page: cArr['page']
        },
        method: 'GET',
        header: {},
        success: function(res) {
          that.setCountDown(res.data.data);
          if (that.data.page <= res.data.last_page) {
            for (let i = 0; i < res.data.data.length; i++) {
              that.data.new_list.push(res.data.data[i]);
            }
          }
          let arr = that.data.new_list;
          arr.forEach((item, index) => {
            item.b_date = item.b_date.slice(5, 16).replace(/-/, ".");
          });
          that.setData({
            topicList: arr,
            last_page: res.data.last_page,
            hiddenLoading: true
          });
        }
      })
    }

    // that.setCountDown();
  },

  //初始化限时抢购
  setHotGoodsData: function(id) {
    var that = this;
    var paraArr = new Array();
    paraArr['size'] = 3;
    paraArr['cat_id'] = id;
    var sign = app.signature(paraArr);
    if (id == 0) {
      wx.request({
        // url: rootDocment + '/api/com_get/getFlashGoods',
        url: rootDocment + '/api/com_get/getLimitedGoodsList',
        data: {
          size: paraArr['size'],
          sign: sign,
          xianshi: "1"
        },
        method: 'GET',
        header: {},
        success: function(res) {
          console.log(res);
          let hotGoodsList = new Array();
          var i = 0;
          for (var arr in res.data.flash_goods_list.data) {
            if (i < 3) {
              hotGoodsList.push(res.data.flash_goods_list.data[arr]);
            }
            i++;
          }

          that.setData({
            hotGoodsList: hotGoodsList,
            hiddenLoading: true,
            e_date: res.data.e_date
          });
        }
      })
    } else {

      wx.request({
        // url: rootDocment + '/api/com_get/getFlashGoods',
        url: rootDocment + '/api/com_get/getLimitedGoodsList',
        data: {
          cat_id: paraArr['cat_id'],
          size: paraArr['size'],
          sign: sign,
          xianshi: "1"
        },
        method: 'GET',
        header: {},
        success: function(res) {
          let hotGoodsList = new Array();
          var i = 0;
          for (var arr in res.data.flash_goods_list.data) {
            if (i < 3) {
              hotGoodsList.push(res.data.flash_goods_list.data[arr]);
            }
            i++;
          }
          console.log(res);
          that.setData({
            hotGoodsList: hotGoodsList
          });
        }
      })
    }

    var GetSessionid = setInterval(function() {
      // let that = this;
      var sessionid = that.data.e_date;
      if (sessionid != "") {
        that.getXianShi();
        if (!(typeof(GetSessionid) == "undefined")) {
          clearInterval(GetSessionid);
        }
      }
    }, 100)

  },
  getXianShi: function() {
    var that = this;
    var time = 1000;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    var t_tamp = that.data.e_date;
    var mss = 0;
    var xianShi = that.data.xianShi;

    t_tamp = t_tamp.substring(0, 19);
    t_tamp = t_tamp.replace(/-/g, '/');
    t_tamp = parseInt(new Date(t_tamp).getTime()); //结束时间戳
    mss = t_tamp - n_tamp;

    let formatTime = that.getFormat(mss);
    xianShi['countDD'] = `${formatTime.dd}`;
    xianShi['countHH'] = `${formatTime.hh}`;
    xianShi['countMM'] = `${formatTime.mm}`;
    xianShi['countSS'] = `${formatTime.ss}`;
    that.setData({
      xianShi: xianShi
    });

    setTimeout(that.getXianShi, time);
  },
  //点击幻灯片
  showSlide: function(e) {
    var url = e.currentTarget.dataset.url;
    if (!url || url == '#') return;
    if (url.indexOf("https://") != -1) {
      wx.navigateTo({
        url: '/pages/topic/trust?url=' + url,
      })
    } else {
      console.log("sssss")
    }
    console.log(url);
    // app.redirect(url);
  },

  //点击导航
  goCategory: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    if (that.data.is_dj) {
      that.setData({
        is_dj: false
      })
    } else {
      that.setData({
        is_dj: true
      })
    }
    that.setData({
      current: index,
      currentID: id,
      page: 1,
      new_list: [],
      swiper_index: index,
      hiddenLoading: false
    })
    wx.pageScrollTo({
      scrollTop: 0
    })
    that.setHotGoodsData(id);
    that.setTopicData(that.data.currentID, that.data.th_type, that.data.size, that.data.page);
    // that.setsWiperHight();
    // app.redirect('category/index?id=' + id + "&index=" + index + "&e_date=" + that.data.e_date);
  },
  dropDownNav: function() {
    var that = this;
    that.setData({
      is_xl: !that.data.is_xl
    })

  },
  // 获取滚动条当前位置
  onPageScroll: function(e) {
    var that = this;
    if (e.scrollTop > 100) {
      that.setData({
        hiddenTop: false
      });
    } else {
      that.setData({
        hiddenTop: true
      });
    }
  },
  getScroll:function(e){
    var that = this;
    if (e.detail.scrollTop > 100) {
      that.setData({
        hiddenTop: false
      });
    } else {
      that.setData({
        hiddenTop: true
      });
    }
  },
  // tab切换
  tabSwitch: function(e) {
    var that = this;
    if (e.currentTarget.dataset.type == that.data.th_type) {
      return;
    }
    that.setData({
      tabSelect: !that.data.tabSelect,
      th_type: e.currentTarget.dataset.type,
      page: 1,
      new_list: [],
      hiddenLoading: false
    });
    that.setTopicData(that.data.currentID, that.data.th_type, that.data.size, that.data.page);

  },

  //回到顶部
  goTop: function(e) { // 一键回到顶部
    var that = this;
    that.setData({
      scroll_top: 0
    })
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  // 倒计时
  setCountDown: function (topicList) {
    let time = 1000;
    var that = this;
    var t_edate = '';
    var t_tamp = 0;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    // var topicList = that.data.topicList;
    for (var i = 0; i < topicList.length; i++) {
      t_edate = topicList[i]['e_date'];
      t_edate = t_edate.substring(0, 19);
      t_edate = t_edate.replace(/-/g, '/');
      t_tamp = parseInt(new Date(t_edate).getTime()); //结束时间戳
      let num = 0;
      if (num == 0) {
        if (n_tamp > t_tamp) {
          topicList.splice(i, 1); //移除了
        } else {
          let formatTime = that.getFormat(t_tamp - n_tamp);
          topicList[i]['countDD'] = `${formatTime.dd}`;
          topicList[i]['countHH'] = `${formatTime.hh}`;
          topicList[i]['countMM'] = `${formatTime.mm}`;
          topicList[i]['countSS'] = `${formatTime.ss}`;
        }
        num++;
      }
      if (n_tamp > t_tamp) {
        topicList.splice(i, 1); //移除了
      } else if (t_tamp - n_tamp > 3 * 24 * 3600 * 1000) {
        //如果现在是3天外，那么不需要修改
        //这种情况就不用管
      } else {
        let formatTime = that.getFormat(t_tamp - n_tamp);
        topicList[i]['countDD'] = `${formatTime.dd}`;
        topicList[i]['countHH'] = `${formatTime.hh}`;
        topicList[i]['countMM'] = `${formatTime.mm}`;
        topicList[i]['countSS'] = `${formatTime.ss}`;
      }
    }
    // that.setData({
    //   topicList: topicList
    // });
    // clearTimeout(that.setCountDown);
    // setTimeout(that.setCountDown, time);
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

  //去搜索
  toSearch: function() {
    app.redirect('search/index');
  },

  kaishouTips() {
    wx.showToast({
      title: '即将开售，敬请期待',
      icon: 'none',
      duration: 1000
    })
  },

  // 设计页面高度
  setsWiperHight: function() {
    var query = wx.createSelectorQuery();
    var that = this;
    var sum_heigth = 0;
    // var swiper_item = ".swiper-item" + that.data.swiper_index + " ";
    // var select = swiper_item +  ".box-hight";
    // that.setHight(swiper_item);

    var time = setTimeout(function() {
      query.select("#scroll-view-h").boundingClientRect(function(qry) {
        // var h = qry.height;//此处可以成功获取到数据

        that.setData({
          aheight: qry.height
        })

      }).exec();
    }, 500)

  },

  bindtransition: function(e) {},

  bindchange: function(e) {
    var that = this;
    if (that.data.is_dj) {
      var id = e.detail.currentItemId;

      that.setData({
        swiper_index: e.detail.current,
        currentID: id,
        page: 1,
        new_list: []
      })

      that.setTopicData(id, that.data.th_type, that.data.size, that.data.page);
      that.setHotGoodsData(id);

    }
    that.setData({
      is_dj: true,
      hiddenLoading: false
    })
    // that.setsWiperHight();
    wx.pageScrollTo({
      scrollTop: 0
    })
    //阿拉丁埋点
    app.aldstat.sendEvent("首页左右滑动", {});
  },

  // 自定义分享事件
  onShareAppMessage: function (res) {
    let that = this;
    console.log(app.globalData.userID)
    console.log('转发成功')
    return {
      title: '小年鱼品牌折扣商城',
      path: '/pages/index/index?scene=' + app.globalData.userID + '_' + that.data.currentID,
    }
  },
  //定时处理函数
  task: function () {
    var that = this;
    //现在开始手机topicList数组的信息，进行处理
    that.setCountDown();
    console.log(new Date())
  },

  clearTimer: function ()  {
    // clearInterval(this.data.taskTimer);
    // this.setData({
    //   taskTimer: null,
    // })
  }, 
  onHide: function () {
    this.clearTimer();
  },

  onUnload: function() {
    this.clearTimer();
  }



})