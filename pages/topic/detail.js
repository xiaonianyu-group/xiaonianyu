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
    hiddenLoading: false,
    detail: [],
    imgUrls: [],
    goodsList: [],
    // 新增
    currentWay: 'sequence',//默认综合排序
    wayType: 'desc',//默认降序
    is_sj: true,
    currentID: '',
    currentTabsIndex: 0,
    type: "zh",
    hiddenTop: true, //显示回到顶部图标
    currentPage: 1,//默认分页1
    last_page: 0,
    allGoods:0,//商品总数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setGoodsData(options.id);
    console.log(options.id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setGoodsData(that.data.currentID);
    wx.stopPullDownRefresh();
  },

  //初始化专题商品
  setGoodsData: function (id) {
    var that = this;
    let order = that.data.currentWay;
    let order_type = that.data.wayType;
    let page = that.data.currentPage;
    var paraArr = new Array();
    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/topic/get?id=' + id,
      data: {
        size: 20,
        page,
        order,
        order_type,
      },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        let arr = [...res.data.goods_list.data];
        let list = that.data.goodsList;
        arr.forEach(function (item, index) {
          list.push(item);
        });
        if (that.data.currentPage == 1) {
          that.setData({
            detail: res.data.topic,
            imgUrls: res.data.topic.pic,
          });
        };
        that.setData({
          goodsList: list,
          currentPage: res.data.goods_list.current_page,//当前页
          last_page: res.data.goods_list.last_page,//最后一页
          allGoods: res.data.goods_list.total,//全部商品
          hiddenLoading: true,
          currentID: id,
        });
        that.setCountDown();
      }
    });
  },
  //点击商品
  showGoodsDetial: function (e) {
    var id = e.currentTarget.dataset.id
    if (!id) return;
    app.redirect('goods/detail', 'id=' + id)
  },

  //滚动到底部触发事件  
  showScrollLower: function () {
    var that = this;
    console.log('底部');
    if (that.data.currentPage < that.data.last_page) {
      let currentPage = that.data.currentPage;
      currentPage++;
      console.log(currentPage);
      that.setData({
        currentPage,
      });
      that.setGoodsData(that.data.currentID);
    }
  },

  // 获取滚动条当前位置
  onPageScroll: function (e) {
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
  goTop: function (e) {  // 一键回到顶部
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
  setCountDown: function () {
    let time = 1000;
    var that = this;
    var t_edate = '';
    var t_tamp = 0;
    var n_tamp = parseInt(new Date().getTime());    // 当前时间戳
    var m_detail = that.data.detail;
    if (!m_detail.pic) {
      return;
    }
    t_edate = m_detail['e_date'];
    // console.log(t_edate)
    t_edate = t_edate.substring(0, 19);
    t_edate = t_edate.replace(/-/g, '/');
    t_tamp = parseInt(new Date(t_edate).getTime());
    if (n_tamp > t_tamp) {
      // topicList.splice(i, 1); //移除了
    }
    else {
      let formatTime = that.getFormat(t_tamp - n_tamp);
      m_detail['countDD'] = `${formatTime.dd}`;
      m_detail['countHH'] = `${formatTime.hh}`;
      m_detail['countMM'] = `${formatTime.mm}`;
      m_detail['countSS'] = `${formatTime.ss}`;
      that.setData({
        detail: m_detail
      });
      setTimeout(that.setCountDown, time);
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
    return { ms, ss, mm, hh, dd };
  },

  // 标签切换
  tabsWitch: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var type = e.currentTarget.dataset.type;
    if (type == that.data.type && index != 2) {
      return;
    }
    switch (type) {
      case "zh":
        that.setData({
          currentWay: 'sequence',
          wayType: "desc",
          is_sj: true,
        });
        break;
      case "xl":
        that.setData({
          currentWay: "sales",
          wayType: "desc",
          is_sj: true,
        });
        break;
      case "jg":
        if (that.data.is_sj) {
          that.setData({
            currentWay: "price",
            wayType: "desc",
          });
        }
        else {
          that.setData({
            currentWay: "price",
            wayType: "asc",
          });
        }
        that.setData({
          is_sj: !that.data.is_sj,
        })
        break;
      default:

    }
    that.setData({
      currentPage: 1,
      currentTabsIndex: index,
      goodsList: [],
      type: type,
    });
    that.setGoodsData(that.data.currentID);
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

  }
})