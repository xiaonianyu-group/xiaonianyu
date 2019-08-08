//index.js
// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;
var app = getApp();
//获取应用实例
Page({
  data: {
  },
  onLoad: function (opt) {
    //阿拉丁埋点
    app.aldstat.sendEvent("进入授权页", {});
  },
  //微信授权登录
  onGotUserInfo: function (e) {
    wx.navigateBack();
  },
  //拒绝
  goBack: function (e) {
    wx.navigateBack();
  },

})
