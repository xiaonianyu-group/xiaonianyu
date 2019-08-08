// pages/goods/detail.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var WxParse = require('../../utils/wxParse/wxParse.js');
var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rootUrl: rootDocment,
    hiddenLoading: false,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    hasSpec: 0,
    detail: [],
    showDialog: false,
    showShare: false,
    showPic: false,
    showCoupon: false,
    showService: false,
    spec_price: [],
    spec_list: [],
    amount: 1,
    price: 0,
    stock: 0,
    spec_key: '',
    spec_item: '',
    current_spec: [],
    cartNum: 0,
    currentID: '',
    fid: 0,
    sharePic: '',
    couponList: [],
    hiddenTop: true,
    new_user: 0,
    determine: "",
    is_des: false,
    is_limited_time: true,
    e_date: "",
    xianShi: {
      "countHH": "00",
      "countMM": "00",
      "countSS": "00"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //初始化
    if (options.id) {
      this.setDetailData(options.id);
    }
    if (options.scene)  {
      var scene = decodeURIComponent(options.scene).split("_");
      this.setDetailData(scene[1]);
      that.setData({
        fid: scene[0]
      });
    }
    this.getUserInfo();
    this.setCartData();
    // this.getCouponList();
    //阿拉丁埋点
    app.aldstat.sendEvent("进入商品详情页", {});
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //用户授权登录
    var that = this;
    app.login(that.data.fid);
    that.getUserInfo();
  },

  //下拉刷新
  onPullDownRefresh: function() {
    var that = this;
    this.setDetailData(that.data.currentID);
    this.setCartData();
    // this.getCouponList();
    that.getUserInfo();
    wx.stopPullDownRefresh();
  },

  //获取当前用户信息
  getUserInfo: function() {
    var that = this;
    var m_uid = app.globalData.userID;
    var paraArr = new Array();
    paraArr['id'] = m_uid;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_user/' + m_uid,
      data: {
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data)
        that.setData({
          new_user: res.data.is_new
        });
      }
    })
  },

  //获取优惠券
  getCouponList: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['state'] = 2;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_coupon',
      data: {
        state: paraArr['state'],
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        that.setData({
          couponList: res.data
        });
      }
    })
  },

  //领取优惠券
  hitCoupon: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var cList = that.data.couponList;
    var paraArr = new Array();
    paraArr['m_id'] = id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_coupon',
      data: {
        m_id: id,
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'POST',
      header: {},
      success: function(res) {
        if (res.data.code == 1001) {
          wx.showToast({
            title: '领取成功'
          })
          cList[index]['has'] = '1';
          that.setData({
            couponList: cList
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //初始化详情
  setDetailData: function(id) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods/' + id,
      data: {
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data);
        WxParse.wxParse('article', 'html', res.data.info, that, 5);
        var m_price = res.data.price;
        if (res.data.is_promotion == 1) {//是否做活动
          m_price = res.data.promotion_price
        }
        that.setData({
          detail: res.data,
          hiddenLoading: true,
          imgUrls: res.data.slide.split(","),
          hasSpec: res.data.spec_count,
          spec_price: res.data.getspec,
          spec_list: res.data.spec_list,//颜色，尺码
          price: m_price,
          stock: res.data.stock,
          currentID: id,
          e_date: res.data.e_date
        });
        console.log(that.data.e_date)
        //初始化规格
        that.selectSpec();
        // 添加倒计时监听

      }
    })
    var GetSessionid = setInterval(function() {
      var sessionid = that.data.e_date;
      if (sessionid != "") {
        that.getXianShi();
        if (!(typeof(GetSessionid) == "undefined")) {
          clearInterval(GetSessionid);
        }
      }
    }, 100);
  },
  getXianShi: function() {
    var that = this;
    var time = 1000;
    var n_tamp = parseInt(new Date().getTime()); // 当前时间戳
    var t_tamp = that.data.e_date;
    var mss = 0;
    var xianShi = that.data.xianShi;
    console.log()
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
  //选择规格
  toggleDialog: function() {
    var that = this;
    that.setData({
      showDialog: !that.data.showDialog
    });
  },
  footCart: function() {
    var that = this;
    that.toggleDialog();
    that.setData({
      determine: "addCart"
    });
    //阿拉丁埋点
    app.aldstat.sendEvent("加入购物车", {});
  },
  footBuy: function() {
    var that = this;
    that.toggleDialog();
    that.setData({
      determine: "buyNow"
    });
    //阿拉丁埋点
    app.aldstat.sendEvent("立即购买", {});
  },
  //切换规格
  selectSpec: function(e) {
    var that = this;


    //如果有规格
    if (that.data.spec_price.length != 0) {

      var spec_list = that.data.spec_list; //颜色和尺码另存为俩列表
      var spec_price = that.data.spec_price; //不同的规格的商品详情列表

      var item_arr = new Array();
      var current_arr = {};
      console.log(typeof(e) == "undefined")
      console.log(typeof (e))
      if (typeof(e) == "undefined") { //初始化
        for (var item in spec_list) {
          item_arr.push(spec_list[item][0]['item_id']); //push第一个
          current_arr[item] = spec_list[item][0]['item_id']; //复制第一个到对象
          console.log(spec_list[item][0]['item_id'])
        }
        //获取默认选中规格key
        console.log(item_arr)
        var spec_key = item_arr.sort(function(a, b) {
          return a - b
        }).join('_'); //47_230
        for (var item in spec_price) {
          //console.log(item, spec_price, spec_price[item], that.data.detail.is_promotion) //key,Array,object,num
          if (spec_price[item]['key'] == spec_key) { //47_230
            var m_price = spec_price[item]['price']; //47_230
            if (that.data.detail.is_promotion == 1) {//是否做活动
              console.log(spec_price[item]) //object
              m_price = spec_price[item]['promotion_price'];//价格
            }
            
            that.setData({
              price: m_price, //价格
              stock: spec_price[item]['stock'], //库存
              spec_key: spec_key, //47_230
              spec_item: spec_price[item]['key_name'], //规格
              current_spec: current_arr //颜色：47 尺码：230
            });
            break;
          }
        }
      } else {

        var current_spec = that.data.current_spec;
        for (var item in spec_list) {//尺码，颜色
          console.log(item);
          if (item == e.currentTarget.dataset.spec) {
            item_arr.push(e.currentTarget.dataset.id);
            current_arr[item] = e.currentTarget.dataset.id;
          } else {
            item_arr.push(current_spec[item]);
            current_arr[item] = current_spec[item];
          }
        }
        //获取新选中规格key
        var spec_key = item_arr.sort(function(a, b) {
          return a - b
        }).join('_');
        for (var item in spec_price) {
          if (spec_price[item]['key'] == spec_key) {
            var m_price = spec_price[item]['price'];
            if (that.data.detail.is_promotion == 1) {//是否做活动
              m_price = spec_price[item]['promotion_price'];//做活动给活动价
            }
            // if (spec_price[item]['stock'] == 0){
            //   that.setData({
            //     stock: spec_price[item]['stock']
            //   });
            //   console.log("没有库存")
            //   return;
            // }
            that.setData({
              price: m_price,
              stock: spec_price[item]['stock'],
              spec_key: spec_key,
              spec_item: spec_price[item]['key_name'],
              current_spec: current_arr
            });
            break;
          }
        }
      }
    }
  },
  //添加数量
  addAmount: function() {
    var that = this;
    var new_amount = that.data.amount + 1;
    if (new_amount < that.data.stock) {
      that.setData({
        amount: new_amount
      });
    }
  },
  //减少数量
  delAmount: function() {
    var that = this;
    var new_amount = that.data.amount - 1;
    if (new_amount > 0) {
      that.setData({
        amount: new_amount
      });
    }
  },
  //输入数量
  bindKeyInput: function(e) {
    var that = this;
    var amount = Math.round(e.detail.value);
    if (!isNaN(amount) && amount > 0) {
      if (amount > that.data.stock) {
        that.setData({
          amount: that.data.stock
        });
        return that.data.stock;
      } else {
        that.setData({
          amount: amount
        });
        return amount;
      }
    } else {
      that.setData({
        amount: 1
      });
      return 1;
    }
  },

  //现在购买
  buyNow: function() {
    var that = this;
    app.redirect('order/index', 'goods_id=' + that.data.detail['id'] + '&spec_key=' + that.data.spec_key + '&amount=' + that.data.amount);
    //阿拉丁埋点
    app.aldstat.sendEvent("点击立即购买-规格-确定", {});
  },

  //加入购物车
  addCart: function() {
    var that = this;
    if (that.data.stock == 0){
      wx.showToast({
        icon:"none",
        title: '该规格没有库存',
        duration: 1500
      });
      //阿拉丁埋点
      app.aldstat.sendEvent("点击加入购物车-规格-确定", {});
      return;
    }
    var paraArr = new Array();
    paraArr['goods_id'] = that.data.detail['id'];
    paraArr['spec_key'] = that.data.spec_key;
    paraArr['amount'] = that.data.amount;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_cart',
      data: {
        goods_id: paraArr['goods_id'],
        spec_key: paraArr['spec_key'],
        key_name: that.data.spec_item,
        amount: paraArr['amount'],
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'POST',
      header: {},
      success: function(res) {
        console.log(res.data);
        that.setData({
          showDialog: false
        });
        if (res.data.code == '1001') {
          that.setCartData();
          wx.showToast({
            title: '添加成功',
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //获取购物车列表
  setCartData: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_cart',
      data: {
        user_id: paraArr['user_id'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        that.setData({
          cartNum: res.data.length
        });
      }
    })
  },
  //分享
  toggleCoupon: function() {
    var that = this;
    that.setData({
      showCoupon: !that.data.showCoupon
    });
  },
  toggleService: function() {
    var that = this;
    that.setData({
      showService: !that.data.showService
    });
  },
  //分享
  toggleShare: function() {
    var that = this;
    that.setData({
      showShare: !that.data.showShare
    });
  },
  //获取分享图
  getPic: function() {
    var that = this;
    if (that.data.showPic) {
      that.setData({
        showPic: !that.data.showPic
      });
    } else {
      that.setData({
        showShare: 0,
        hiddenLoading: false
      });
      var m_page = 'pages/goods/detail';
      var m_scene = app.globalData.userID + '_' + that.data.currentID;
      var paraArr = new Array();
      paraArr['page'] = m_page;
      paraArr['scene'] = m_scene;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api/get_qrcode',
        data: {
          page: m_page,
          scene: m_scene,
          sign: sign
        },
        method: 'GET',
        header: {},
        success: function(res) {
          console.log(res.data.msg);
          if (res.data.success == true) {
            that.setData({
              showPic: !that.data.showPic,
              sharePic: res.data.msg,
              hiddenLoading: true
            });
          }
        }
      })
    }
  },
  //保存分享图片
  savePic: function() {
    var that = this;
    wx.downloadFile({
      url: that.data.rootUrl + that.data.sharePic,
      success: function(res) {
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
      },
      fail: function(res) {
        console.log(res)
      }
    })

  },

  // 偏远地区不支持发货说明
  regionDes: function() {
    var that = this;
    that.setData({
      is_des: !that.data.is_des
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

  //回到顶部
  goTop: function(e) { // 一键回到顶部
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

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
  // 自定义分享事件
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: that.data.detail.title,
      // path: '/pages/index/index?pageId=' + that.data.currentID,
      path: '/pages/index/index?scene=' + app.globalData.userID + '_' + that.data.currentID,
      success: function (res) {
        // 转发成功
        
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
})
