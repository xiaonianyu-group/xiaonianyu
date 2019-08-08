// pages/fenxiao/mycommission.js

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
    commission: 0,
    mini_cash: 0,
    toBeSettled:0,
    profitList: [],
    tabList : [
      {
      name: "今天收益",
      type: "day"
    },
      {
        name: "历史收益",
        type: "history"
      },
      {
        name: "提现记录",
        type: "record"
      },
    ],
    th_type: "day",
    tx_state: "0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
    var that = this;
    that.getData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
    wx.stopPullDownRefresh();
    if (this.data.th_type == "record"){
      this.getRecord();
    }else{
      this.getData();
    }
  },

  /**
   * 获取数据
   */
  getData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    // paraArr['type'] = 'commission';
    paraArr['type'] = that.data.th_type;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/com_get/getPayLog',
      data: { user_id: paraArr['user_id'], type: paraArr['type'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          profitList: res.data.list,
          commission: res.data.enbale_money,
          toBeSettled: res.data.money,
          mini_cash: res.data.mini_cash,
          hiddenLoading: true
        });
      }
    })

  },
  getRecord:function(){
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api/user_pay_log/index',
      data: { user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res);
        that.setData({
          profitList: res.data.list,
          hiddenLoading: true
        });
      }
    })
  },

  /**
   * 提现
   */
  cash: function () {
    // parseFloat(that.data.mini_cash)
    var that = this;
    if (parseFloat(that.data.commission)>0) {
      if (parseFloat(that.data.commission) < parseFloat(that.data.mini_cash)){
          wx.showToast({
            title: '最低提现额为 ' + that.data.mini_cash + ' 元',
            icon: 'none'
          })
        }
        else {
          wx.navigateTo({
            url: '/pages/user/cashWithdrawal?commission=' + that.data.commission,
          })
        }
    }
    else {
      wx.showToast({
        title: '还没有佣金可提现',
        icon: 'none'
      })
    }
  },
  tabSwitch : function(e){
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == that.data.th_type) {
      return;
    }
    that.setData({
      th_type: e.currentTarget.dataset.type,
      profitList : []
    })

    if (type == "record") {
      
      that.getRecord();
    } else {
    
      that.getData();
    }


  }
  

})