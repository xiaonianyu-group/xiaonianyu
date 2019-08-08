// pages/user/returns.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: [],
    type_index: 0,
    type_array: ['我要退货退款','我要退款(无需退货)'],
    reason_index: 0,
    reason_array: ['多拍、错拍、不想要', '不喜欢、效果不好', '货物与描述不符', '质量问题', '卖价发错货', '假冒品牌', '其他'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setDetailData(options.id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
  },

  //初始化详情
  setDetailData: function (id) {
    var that = this;
    var paraArr = new Array();
    paraArr['id'] = id;
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getReturnGoods',
      data: { id: paraArr['id'], user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        that.setData({
          detail: res.data
        });
      }
    })
  },

  //切换类型
  typeChange: function (e) {
    var that = this;
    var index = e.detail.value;
    that.setData({
      type_index: index
    })
    console.log(index);

  },

  //切换原因
  reasonChange: function (e) {
    var that = this;
    var index = e.detail.value;
    that.setData({
      reason_index: index
    })
    console.log(index);
  },

  // 提交
  formSubmit: function (e) {
    var that = this;
    var data = e.detail.value;
    var form_id = e.detail.formId;
    var m_type = that.data.type_index + 1;
    var m_reason = that.data.reason_array[that.data.reason_index];
    console.log(m_type);
    wx.request({
      url: rootDocment + '/api/com_get/setReturnGoods',
      data: { id: that.data.detail['id'], type: m_type, reason: m_reason, info: data['m_info'], form_id: form_id},
      method: 'POST',
      header: {},
      success: function (res) {
        if (res.data.code==1001){

        }
        console.log(res.data);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})