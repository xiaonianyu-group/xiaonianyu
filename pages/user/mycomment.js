// pages/user/mycomment.js

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
    isComment: 0,
    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setGoodsData(options.id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
  },

  //初始化商品详情
  setGoodsData: function (oid) {
    var that = this;
    var paraArr = new Array();
    paraArr['order_id'] = oid;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getCommentGoods',
      data: { order_id:oid , sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          goodsList: res.data,
          isComment: res.data[0].is_comment,
          hiddenLoading: true
        });
      }
    })
  },
  /**
   * 提交评论
   */
  formSubmit: function (e) {
    var that = this;
    var info = e.detail.value;
    var info_str = '';
    for (var key in info) {
      if (info[key].replace('|','') == ''){
        wx.showToast({
          title: '评论不能为空',
          icon: 'none'
        })
        return false;
      }
      info_str = info_str + info[key].replace('|', '') + "|"
　　}
    //拼接其他信息
    var order_id='';
    var goods_id = '';
    var spec_item = '';
    var goods = that.data.goodsList;
    for (var key in goods) {
      order_id = goods[key]['order_id'];
      goods_id = goods_id + goods[key]['goods_id'] + '|';
      spec_item = spec_item + goods[key]['spec_item'] + '|';
    }
    //添加评论
    wx.request({
      url: rootDocment + '/api/com_get/addComment',
      data: { order_id: order_id, goods_id: goods_id, spec_item: spec_item, m_info: info_str, user_id: app.globalData.userID },
      method: 'POST',
      header: {},
      success: function (res) {
        wx.navigateBack({
          delta: 1
        })
      }
    })

  }

})