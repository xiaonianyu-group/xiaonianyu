// pages/goods/list.js

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
    currentBrand: '',
    hiddenLoading: false,
    curCat:[],
    goodsList: [],
    perPage: 20,
    curPage: 1,
    scrollHeight: 0,
    allowScroll: true,
    topNum: 0,
    hiddenTop:true,
    loadingComplete: false,
    curType: 0,  //筛选类型
    order: 'id',
    orderType: 'desc'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    var that = this;
    wx.getSystemInfo({
      success:function(res) {
          that.setData({
              scrollHeight:res.windowHeight-45
          });
      }
    });
    var brand_id = '';
    if (options.brand_id != undefined) brand_id = options.brand_id;
    this.setGoodsListData(options.id, brand_id);
    this.setCategoryData(options.id, brand_id);
  },

  //下拉刷新
  onPullDownRefresh: function () {
    var that = this;
    this.setGoodsListData(that.data.currentItem, that.data.currentBrand);
    this.setCategoryData(that.data.currentItem, that.data.currentBrand);
    wx.stopPullDownRefresh();
  },

  //滚动到底部触发事件  
  showScrollLower: function () {
    var that = this;
    if (that.data.allowScroll){
      that.setData({
        allowScroll: false
      });
      that.setGoodsListData(that.data.currentItem, that.data.currentBrand);
    }
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

  //回到顶部
  goTop: function () {  // 一键回到顶部
    this.setData({
      topNum: 0
    });
  },

  //初始化当前分类
  setCategoryData: function (id,brand_id) {
    var that = this;
    var paraArr = new Array();
    var m_title = '';

    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { id: paraArr['id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        m_title = res.data[0]['wap_title'];
        that.setData({
          curCat: res.data
        });
        wx.setNavigationBarTitle({
          title: m_title,
        })
        if (brand_id != '') {
          wx.request({
            url: rootDocment + '/api/com_get/getBrandInfo',
            data: { id: brand_id },
            method: 'GET',
            header: {},
            success: function (res) {
              m_title = m_title + ' - ' + res.data['title'];
              wx.setNavigationBarTitle({
                title: m_title,
              })
            }
          })
        }
      }
    })

  },

  //初始商品列表
  setGoodsListData: function (id,brand_id) {
    var that = this;
    if (!that.data.loadingComplete){
      var paraArr = new Array();
      paraArr['sort'] = id;
      paraArr['size'] = that.data.perPage;
      paraArr['page'] = that.data.curPage;
      paraArr['order'] = that.data.order;
      paraArr['order_type'] = that.data.orderType;
      paraArr['brand_id'] = brand_id;
      var sign = app.signature(paraArr);
      wx.request({
        url: rootDocment + '/api_goods',
        data: { sort: id, brand_id: paraArr['brand_id'], size: paraArr['size'], page: paraArr['page'], order: paraArr['order'], order_type: paraArr['order_type'], sign: sign },
        method: 'GET',
        header: {},
        success: function (res) {
          that.setData({
            currentItem: id,
            currentBrand: brand_id,
            hiddenLoading: true
          });
          console.log(res.data.data)
          if (res.data.data.length > 0){ //如果有数据
            var list = that.data.goodsList;
            for (var i = 0; i < res.data.data.length; i++) {
              list.push(res.data.data[i]);
            }
            that.setData({
              goodsList: list
            });
            if (res.data.data.length == that.data.perPage) {
              that.setData({
                curPage: that.data.curPage + 1,
                allowScroll: true
              });
            }
            else {
              that.setData({
                loadingComplete: true
              });
            }
          }
          else {
            that.setData({
              loadingComplete: true
            });
          }

        }
      })
    }
  },

  //筛选
  screenGoods: function (e) {
    var that = this;
    var m_type = e.currentTarget.dataset.type;
    var m_order = 'id';
    var m_orderType = 'desc';
    if (m_type > 0){
      if (that.data.orderType == 'desc'){
        m_orderType = 'asc'
      }
    }
    if (m_type == 1) m_order = 'price';
    if (m_type == 2) m_order = 'sales';
    console.log(m_orderType);
    that.setData({
      curType: m_type,
      order: m_order,
      orderType: m_orderType,
      curPage: 1,
      goodsList: [],
      hiddenLoading: false,
      loadingComplete: false
    });
    that.setGoodsListData(that.data.currentItem, that.data.currentBrand);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

})