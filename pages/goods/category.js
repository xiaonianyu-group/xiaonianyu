// pages/goods/category.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 100,
    hiddenLoading:false,
    currentItem:'',
    catList1: [],
    catList2: [],
    brandList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.setCategoryData();
    //获取设备窗口信息
    var me = this;
    wx.getSystemInfo({
      success: function (res) {
        me.setData({
          windowHeight: res.windowHeight
        })
      }
    })
  },

  //初始化分类
  setCategoryData: function () {
    var that = this;

    var paraArr = new Array();
    paraArr['pid'] = 0;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_goods_category',
      data: { pid: paraArr['pid'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res)
        that.setData({
          catList1: res.data,
          currentItem: res.data[0].id
        });
        that.setBrandList(res.data[0].id);
        that.setChildCategoryData(res.data[0].id);
      }
    })
    
  },

  //初始化品牌
  setBrandList: function (id) {
    var that = this;
    wx.request({
      url: rootDocment + '/api/com_get/getBrandList',
      data: { cat_id: id },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          brandList: res.data,
          currentItem: id,
          hiddenLoading: true
        });
      }
    })
  },

  //初始化子类
  setChildCategoryData: function (id) {
    var that = this;
    var cache_cat = wx.getStorageSync('cat'+id);
    if (cache_cat == "") {  //如果没有缓存
        var paraArr = new Array();
        paraArr['pid'] = id;
        var sign = app.signature(paraArr);
        wx.request({
          url: rootDocment + '/api_goods_category',
          data: { pid: paraArr['pid'], sign: sign},
          method: 'GET',
          header: {},
          success: function (res) {
            that.setData({
              catList2: res.data
            });
            wx.setStorageSync('cat'+id, res.data);
          }
        })
    }
    else {
      that.setData({
        catList2: cache_cat
      });
    }
    that.setData({
      currentItem: id,
      hiddenLoading: true
    });
  },

  //切换大类
  toggleCategory: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    if (!id) return;
    //that.setChildCategoryData(id);
    that.setBrandList(id);
  },

  //点击小类
  goGoodsList: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id
    if (!id) return;
    app.redirect('goods/list', 'id=' + id)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})