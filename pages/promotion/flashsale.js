// pages/promotion/flashsale.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentItem: '',
    hiddenLoading: false,
    curCat: [],
    goodsList: [],
    perPage: 50,
    curPage: 1,
    scrollHeight: 0,
    allowScroll: true,
    topNum: 0,
    hiddenTop: true,
    loadingComplete: false,
    curType: 0, //筛选类型
    order: 'sequence',
    orderType: 'desc',
    xianShi: {
      "countHH": "00",
      "countMM": "00",
      "countSS": "00"
    },
    e_date: "",
    is_cf: 0,
    is_curType: true,
    is_lod: false,
    stype: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //初始化
    var that = this;
    console.log(options)
    that.setData({
      e_date: options.e_date,
      // stype: options.stype
    });
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight - 45
        });
      }
    });
    this.setGoodsListData(options.cat_id);
    this.setCategoryData(options.cat_id);

  },

  //下拉刷新
  onPullDownRefresh: function() {
    var that = this;
    this.setGoodsListData(that.data.currentItem);
    this.setCategoryData(that.data.currentItem);
    wx.stopPullDownRefresh();
  },

  //滚动到底部触发事件  
  showScrollLower: function() {
    var that = this;
    if (that.data.allowScroll) {
      that.setData({
        allowScroll: false
      });
      that.setGoodsListData(that.data.currentItem);
    }
  },

  // 获取滚动条当前位置
  scrolltoupper: function(e) {
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

  //回到顶部
  goTop: function() { // 一键回到顶部
    this.setData({
      topNum: 0
    });
  },

  //初始化当前分类
  setCategoryData: function(id) {
    var that = this;
    if (id == '') {
      wx.setNavigationBarTitle({
        title: '限时抢购 - 全部',
      })
    } else {
      var paraArr = new Array();
      paraArr['id'] = id;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api_goods_category',
        data: {
          id: paraArr['id'],
          sign: sign
        },
        method: 'GET',
        header: {},
        success: function(res) {
          console.log(res)
          that.setData({
            curCat: res.data
          });
          wx.setNavigationBarTitle({
            title: '限时抢购 - ' + res.data[0]['wap_title'],
          })
        }
      })
    }
    that.getXianShi();
  },

  //初始商品列表
  setGoodsListData: function(id) {
    var that = this;
    if (!that.data.loadingComplete) {
      var paraArr = new Array();
      paraArr['cat_id'] = id;
      paraArr['size'] = that.data.perPage;
      paraArr['page'] = that.data.curPage;
      paraArr['order'] = that.data.order;
      paraArr['order_type'] = that.data.orderType;
      var sign = app.signature(paraArr);
      wx.request({
        // url: rootDocment + '/api/com_get/getFlashGoods',
        url: rootDocment + '/api/com_get/getLimitedGoodsList',
        data: {
          cat_id: id,
          size: paraArr['size'],
          page: paraArr['page'],
          order: paraArr['order'],
          order_type: paraArr['order_type'],
          sign: sign,
          xianshi: 1
        },
        method: 'GET',
        header: {},
        success: function(res) {
          that.setData({
            currentItem: id,
            hiddenLoading: true
          });

          if (res.data.flash_goods_list.data) { //如果有数据
            var list = that.data.goodsList;

            // for (var i = 0; i < res.data.data.length; i++) {
            //   list.push(res.data.data[i]);
            // }
            var i = 0;
            for (var arr in res.data.flash_goods_list.data) {
              if (i < that.data.perPage) {
                list.push(res.data.flash_goods_list.data[arr]);
              }
              i++;
            }
            that.setData({
              goodsList: list
            });

            if (res.data.flash_goods_list.data.length == that.data.perPage) {
              that.setData({
                curPage: that.data.curPage + 1,
                allowScroll: true
              });
            } else {
              that.setData({
                loadingComplete: true
              });
            }
            if (that.data.hiddenLoading == false) {
              that.setData({
                is_lod: false
              })
            }
            if (res.data.flash_goods_list.data.length < 1) {
              that.setData({
                is_lod: true
              })
            }
          } else {
            that.setData({
              loadingComplete: true
            });
          }

        }
      })
    }

  },

  //筛选
  screenGoods: function(e) {

    var that = this;
    var m_type = e.currentTarget.dataset.type;
    if (e.currentTarget.dataset.type == 1) {
      that.setData({
        is_curType: !that.data.is_curType
      })
    } else {
      that.setData({
        is_curType: true
      })
    }
    if (m_type == that.data.is_cf && that.data.is_cf != 1) {
      return;
    }

    var m_order = 'id';
    var m_orderType = 'desc';
    if (m_type > 0) {
      if (that.data.orderType == 'desc') {
        m_orderType = 'asc'
      }
    }
    if (m_type == 1) m_order = 'price';
    if (m_type == 2) m_order = 'sales';

    that.setData({
      curType: m_type,
      order: m_order,
      orderType: m_orderType,
      curPage: 1,
      goodsList: [],
      hiddenLoading: false,
      loadingComplete: false
    });
    that.setData({
      is_cf: e.currentTarget.dataset.cf
    })
    that.setGoodsListData(that.data.currentItem);
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
    // console.log(that.data.xianShi)
    setTimeout(that.getXianShi, time);
  },

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
  }

})