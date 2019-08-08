// pages/order/cart.js

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
    allSelect: false,
    cartList: [],
    total: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.setCartData();
    wx.stopPullDownRefresh();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //用户授权登录
    app.login();
    var that = this;
    that.setCartData();
  },

  //获取购物车列表
  setCartData: function () {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_cart',
      data: { user_id: paraArr['user_id'], sign: sign },
      method: 'GET',
      header: {},
      success: function (res) {
        console.log(res.data);
        that.setData({
          cartList: res.data,
          hiddenLoading: true
        });
        that.countTotal();
      }
    })
  },

  //选择商品
  selectItem: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    that.data.cartList[index].is_select = !that.data.cartList[index].is_select;
    that.setData({
      cartList: that.data.cartList
    });
    that.countTotal();
  },

  //全选
  allSelect: function () {
    var that = this;
    if (that.data.allSelect){//反选
      for (var i = 0; i < that.data.cartList.length; i++) {
        that.data.cartList[i].is_select = false;
      }
    }
    else {//全选
      for (var i = 0; i < that.data.cartList.length; i++) {
        that.data.cartList[i].is_select = true;
      }
    }
    that.setData({
      cartList: that.data.cartList
    });
    that.countTotal();
  },

  //计算价格
  countTotal: function () {
    var that = this;
    var m_total = 0;
    var m_flag = true;
    for (var i = 0; i < that.data.cartList.length; i++) {
      if (that.data.cartList[i].is_select) {
        m_total = m_total + that.data.cartList[i].yprice * that.data.cartList[i].amount
      }
      else {
        m_flag=false;
      }
    }
    that.setData({
      total: m_total.toFixed(2),
      allSelect: m_flag
    });
  },

  //添加数量
  addAmount: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    if (that.data.cartList[index].amount < that.data.cartList[index].stock){
      that.data.cartList[index].amount = that.data.cartList[index].amount+1
    }
    that.setData({
      cartList: that.data.cartList
    });
    that.countTotal();
  },
  //减少数量
  delAmount: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    if (that.data.cartList[index].amount > 1) {
      that.data.cartList[index].amount = that.data.cartList[index].amount - 1
    }
    that.setData({
      cartList: that.data.cartList
    });
    that.countTotal();
  },
  //输入数量
  bindKeyInput: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    var amount = Math.round(e.detail.value);
    if (!isNaN(amount) && amount > 0) {
      if (amount > that.data.cartList[index].stock) {
        that.data.cartList[index].amount = that.data.cartList[index].stock;
      }
      else {
        that.data.cartList[index].amount = amount;
      }
    }
    else {
      that.data.cartList[index].amount = 1;
    }
    that.setData({
      cartList: that.data.cartList
    });
    that.countTotal();
  },

  //删除商品
  delCart: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var paraArr = new Array();
    paraArr['id'] = id;
    var sign = app.signature(paraArr);
    wx.showModal({
      title: '提示',
      content: '确认要删除吗?',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: rootDocment + '/api_cart/' + id,
            data: {sign: sign},
            method: 'DELETE',
            header: {},
            success: function (res) {
              that.setCartData();
            }
          })
        }
      }
    })
  },

  //下单
  buyNow: function () {
    var that = this;
    var myCart = new Array();
    var j=0;
    if (that.data.total>0){//去下单
      for (var i = 0; i < that.data.cartList.length; i++) {
        if(that.data.cartList[i].is_select){
          myCart[j] = that.data.cartList[i];
          j=j+1;
        }
      }
      wx.setStorageSync('myCart', myCart);
      app.redirect('order/index', 'total=' + that.data.total);
      //阿拉丁埋点
      app.aldstat.sendEvent("购物车下单", {});
    }
    else {
      wx.showModal({
        title: '提示',
        content: '还没有选择商品哦',
        showCancel: false
      })
    }
  },


  /**
   * 显示删除按钮
   */
  showDeleteButton: function (e) {
    let productIndex = e.currentTarget.dataset.productindex
    this.setXmove(productIndex, -65)
  },

  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function (e) {
    let productIndex = e.currentTarget.dataset.productindex
    this.setXmove(productIndex, 0)
  },

  /**
   * 设置movable-view位移
   */
  setXmove: function (productIndex, xmove) {
    let cartList = this.data.cartList
    cartList[productIndex].xmove = xmove
    this.setData({
      cartList: cartList
    })
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e) {
    if (e.detail.source === 'friction') {
      if (e.detail.x < -30) {
        this.showDeleteButton(e)
      } else {
        this.hideDeleteButton(e)
      }
    } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
      this.hideDeleteButton(e)
    }
  },

  /**
   * 处理touchstart事件
   */
  handleTouchStart(e) {
    this.startX = e.touches[0].pageX
  },

  /**
   * 处理touchend事件
   */
  handleTouchEnd(e) {
    if (e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
      this.showDeleteButton(e)
    } else if (e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pageX - this.startX < 30) {
      this.showDeleteButton(e)
    } else {
      this.hideDeleteButton(e)
    }
  },

})