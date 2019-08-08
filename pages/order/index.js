// pages/order/index.js

// 请注意常量的命名必须是Page
const Page = require('../../utils/ald-stat.js').Page;

var app = getApp();
var rootDocment = app.globalData.postUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    send_index: 0,
    send_array: ['快递'],
    goods: [],
    goods_id: [],
    goods_spec: [],
    goods_price: [],
    goods_amount: [],
    order_price: 0,
    pay_price: 0,
    send_price: 0,
    tsend_price: 0,
    rebate_price: 0,
    m_jf: 0,
    m_tc: 0,
    discount_price: 0,
    coupon_index: 0,
    coupon_txtarray: ['不使用优惠券'],
    coupon_idarray: [0],
    coupon_pricearray: [0],
    coupon_id: 0,
    coupon_price: 0,
    exchange_price: 0,
    exchange_jf: 0,
    link_name: '',
    link_tel: '',
    link_addr: '',
    pickup_name: '',
    pickup_tel: '',
    pickup_addr: '',
    pay_type: 1, // 微信支付
    pay_total: 99999, //预防出错
    order_type: 1, //
    coupon_enable:0,//可使用优惠卷的个数默认为零
    packet_index: '',//默认不选择红包
    loading:true,//切换请稍后按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log('详情页onlaod');
    that.setPickUpData();
    if (typeof(options.goods_id) != "undefined") {
      //直接购买
      that.setGoodsData(options.goods_id, options.spec_key, options.amount);
    } else {
      //购物车提交
      var total = options.total;
      var myGoods = wx.getStorageSync('myCart') || []
      that.setData({
        goods: myGoods
      });
      that.setOrderPrice();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    console.log('详情页onshow');
    that.payPrice();
    //用户授权登录
    app.login();
    this.getAddress();
  },

  //获取自提点信息
  setPickUpData: function() {
    var that = this;
    wx.request({
      url: rootDocment + '/api/com_get/getPickUp',
      data: {},
      method: 'GET',
      header: {},
      success: function(res) {
        if (res.data.is_pickup == '1') {
          that.data.send_array[1] = '自提';
          that.setData({
            send_array: that.data.send_array,
            pickup_name: res.data.pickup_name,
            pickup_tel: res.data.pickup_tel,
            pickup_addr: res.data.pickup_addr
          });
        }
      }
    })
  },

  //直接购买获取单个商品信息(商品ID,规格key,数量)
  setGoodsData: function(p0, p1, p2) {
    var that = this;
    console.log(p0, p1, p2);
    wx.request({
      url: rootDocment + '/api/com_get/getOrderGoods',
      data: {
        goods_id: p0,
        spec_key: p1,
        amount: p2
      },
      method: 'GET',
      header: {},
      success: function(res) {
        that.data.goods[0] = res.data;
        that.setData({
          goods: that.data.goods
        });
        that.setOrderPrice();
      }
    })
  },

  //获取订单商品订单价，运费，优惠，实付价等信息
  setOrderPrice: function() {
    var that = this;
    var goods_id = new Array();
    var goods_spec = new Array();
    var goods_price = new Array();
    var goods_amount = new Array();
    var goodsList = that.data.goods;
    for (var i = 0; i < goodsList.length; i++) {
      goods_id[i] = goodsList[i].goods_id;
      goods_spec[i] = goodsList[i].spec_key_name;
      goods_price[i] = goodsList[i].yprice;
      goods_amount[i] = goodsList[i].amount;
    }

    wx.request({
      url: rootDocment + '/api/com_get/getBuyInfo',
      data: {
        goods_id: goods_id.join(","),
        goods_price: goods_price.join(","),
        goods_amount: goods_amount.join(","),
        user_id: app.globalData.userID
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res.data);
        that.setData({
          goods_id: goods_id,
          goods_spec: goods_spec,
          goods_price: goods_price,
          goods_amount: goods_amount,
          order_price: res.data.order_price,
          send_price: res.data.send_price,
          tsend_price: res.data.send_price,
          rebate_price: res.data.rebate_price,
          m_jf: res.data.m_jf,
          m_tc: res.data.m_tc
        });
        that.setCouponData();
        that.payPrice();
      }
    })
  },

  //获取优惠券
  setCouponData: function() {
    var that = this;
    wx.request({
      url: rootDocment + '/api/com_get/getCoupon',
      data: {
        price: that.data.order_price,
        user_id: app.globalData.userID,
        active_id:1,
      },
      method: 'GET',
      header: {},
      success: function(res) {
        console.log(res);
        for (var i in res.data.coupon_list) {
          console.log(res.data.coupon_list[i]);
          that.data.coupon_txtarray[parseInt(i) + 1] = res.data.coupon_list[i]['title'];
          that.data.coupon_idarray[parseInt(i) + 1] = res.data.coupon_list[i]['id'];
          that.data.coupon_pricearray[parseInt(i) + 1] = res.data.coupon_list[i]['yh_price'];
        }
        that.setData({
          coupon_enable: res.data.enable,
          coupon_txtarray: that.data.coupon_txtarray,
          coupon_idarray: that.data.coupon_idarray,
          coupon_pricearray: that.data.coupon_pricearray,
        });

      }
    })
  },

  //切换快递方式
  sendChange: function(e) {
    var that = this;
    var send_price = that.data.tsend_price;
    if (e.detail.value == 1) { //自提
      send_price = 0
    }
    that.setData({
      send_index: e.detail.value,
      send_price: send_price
    })
    that.payPrice();
  },

  //切换优惠券
  couponChange: function(e) {
    var that = this;
    // var index = e.detail.value;
    let i = e.currentTarget.dataset.index;
    let yh_price = e.currentTarget.dataset.yh_price;
    console.log(i,yh_price)
    let arr = [];
    that.data.couponList.forEach((item,index) => {
      item.is_use = 0;
      if(i == index) {
        item.is_use = 1;
      }
      arr.push(item);
    });
    that.setData({
      couponList:arr,
      coupon_index: index,
      coupon_id: that.data.coupon_idarray[index],
      coupon_price: that.data.coupon_pricearray[index],
      coupon_price: yh_price,
    })
    that.payPrice();
    that.closePacketList();
  },


  //计算应付价格
  payPrice: function() {
    var that = this;
    var pay_price = parseFloat(that.data.order_price) + parseFloat(that.data.send_price) - parseFloat(that.data.rebate_price) - parseFloat(that.data.discount_price) - parseFloat(that.data.coupon_price) - parseFloat(that.data.exchange_price); //应付款=订单价+运费-会员折扣-订单折扣-优惠券抵扣-积分兑换
    that.setData({
      pay_price: pay_price.toFixed(2)
    })
  },

  //我的地址
  goMyAddress: function() {
    app.redirect('user/myaddress', '');
  },

  /**
   * 获取默认地址
   */
  getAddress: function() {
    var that = this;
    var paraArr = new Array();
    paraArr['user_id'] = app.globalData.userID;
    paraArr['index'] = 1;
    var sign = app.signature(paraArr);
    wx.request({
      url: rootDocment + '/api_address',
      data: {
        user_id: paraArr['user_id'],
        index: paraArr['index'],
        sign: sign
      },
      method: 'GET',
      header: {},
      success: function(res) {
        if (res.data.length > 0) {
          that.setData({
            link_name: res.data[0]['name'],
            link_tel: res.data[0]['tel'],
            link_addr: res.data[0]['province'] + res.data[0]['city'] + res.data[0]['county'] + res.data[0]['address']
          });
        }
      }
    })
  },

  /**
   * 提交订单
   */
  submitOrder: function(e) {
    var that = this; 
    // 切换等待按钮
    that.setData({
      loading: false,
    }); 
    //切换回支付按钮
    that.noLoading();  
    var data = e.detail.value;
    var formID = e.detail.formId;
    if (data.send_type == 0 && data.link_name == '') {
      wx.showModal({
        title: '提示',
        content: '请选择收货地址!'
      })
    } else {
      if (that.data.pay_price > 0) {
        var goods_id = that.data.goods_id.join(",");
        var goods_spec = that.data.goods_spec.join(",");
        var goods_price = that.data.goods_price.join(",");
        var goods_amount = that.data.goods_amount.join(",");
        var gdt_vid = wx.getStorageSync('gdt_vid') || '';
        var gdt_vid = app.globalData.gdt_vid || '';
        wx.request({
          url: rootDocment + '/api_order',
          data: {
            send_type: that.data.send_index, //快递方式
            m_name: that.data.link_name, //收货人姓名
            m_tel: that.data.link_tel, //收货人电话
            m_addr: that.data.link_addr, //收货人地址
            m_total: that.data.order_price, //订单价
            m_rebate: that.data.rebate_price, //会员折扣
            m_discount: that.data.discount_price, //订单优惠
            m_send: that.data.send_price, //运费
            m_coupon: that.data.coupon_id, //优惠券编号
            coupon_price: that.data.coupon_price, //优惠券优惠金额
            m_exchange: that.data.exchange_price, //积分抵扣金额
            exchange_jf: that.data.exchange_jf, //积分抵扣使用积分
            m_pay: that.data.pay_price, //实付款
            m_jf: that.data.m_jf, //订单赠送积分
            m_tc: that.data.m_tc, //订单提成
            goods_id: goods_id, //商品ids
            spec_item: goods_spec, //商品规格s
            price: goods_price, //商品价格s
            amount: goods_amount, //购买数量s
            m_info: data.m_info, //订单备注
            m_formID: formID, //用于小程序回复消息
            user_id: app.globalData.userID, //用户userid
            gdt_vid: gdt_vid,//广告投放
          },
          method: 'POST',
          header: {},
          success: function(res) {
            console.log(res.data);
            if (res.data.code == 1001) {
              // app.gourl('order/pay', 'sn=' + res.data.data.sn);
              that.payNow(res.data.data.sn);
              //阿拉丁埋点
              app.aldstat.sendEvent("微信支付-生成订单成功", {});
            } else {
              wx.showModal({
                title: '提示',
                content: res.data.msg
              })
            }
          }
        })
      }

    }
  },
  //立即支付
  payNow: function(order_sn) {
    var that = this;
    console.log(that.data.order_sn)
    if (that.data.pay_type == 1) { //微信支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/wx_pay',
        data: {
          order_no: order_sn,
          open_id: app.globalData.openID,
          total: that.data.pay_price || that.data.pay_total,
          uid: app.globalData.userID,
          order_type: that.data.order_type
        },
        method: 'GET',
        header: {},
        success: function(res) {
          console.log(res.data);
          console.log(res.data.timeStamp);
          console.log(res.data.nonceStr);
          console.log(res.data.package);
          console.log(res.data.paySign);
          //更新订单formID
          if (that.data.order_type == 1) {
            var form_id = res.data.package.replace('prepay_id=', '');
            wx.request({
              url: rootDocment + '/api/com_get/updateFormID',
              data: {
                sn: order_sn,
                prepay_id: form_id
              },
              method: 'GET',
              header: {},
              success: function(res) {}
            })
          }

          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function(res) {
              if (that.data.order_type == 1) {
                console.log('成功！')
                //阿拉丁埋点
                app.aldstat.sendEvent("微信支付成功", {});
                app.gourl('user/myorderdetail', 'order_sn=' + order_sn + '0001' + '&id=' + app.globalData.userID);
              } else {
                console.log('……！')
                app.gotaburl('user/index');
              }
            },
            'fail': function(res) {
              console.log('失败！')
              app.redirect('user/myorderdetail', 'order_sn=' + order_sn + '&id=' + app.globalData.userID);
              console.log(res);
            }
          })

        }
      })
    } else { //余额支付
      wx.request({
        url: rootDocment + '/api/miniapp_pay/balance_pay',
        data: {
          sn: order_sn,
          user_id: app.globalData.userID
        },
        method: 'POST',
        header: {},
        success: function(res) {
          if (res.data.code == '1001') {
            app.redirect('user/myorder', 'type=');
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        }
      })
    }
  },
  // 切换回支付按钮
  noLoading:function() {
    let that = this;
    let num = 0;
    let timer = setInterval(function () {
      console.log(num);
      num++;
      if (num >= 2) {
        that.setData({
          loading: true,
        });
        clearInterval(timer);
      }
    }, 1000);
  }
})