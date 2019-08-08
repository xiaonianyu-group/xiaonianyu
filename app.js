//app.js
// 请注意常量的命名必须是App
const App = require('./utils/ald-stat.js').App;

var utilMd5 = require('utils/md5.js');
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    ////////////////////////////////////////////////////////////////////////
    // var logs = wx.getStorageSync('logs') || []
    // console.log = (function (oriLogFunc) {
    //   return function (str) {
    //     if (true) {// 需要打印 此处改为 true
    //       oriLogFunc.call(console, str);
    //       logs.unshift(Date.now()+":::"+JSON.stringify(str))
    //       wx.setStorageSync('logs', logs);
    //     }
    //   }
    // })(console.log);
    //////////////////////////////////////////////////////////////////////////
  },

  //授权登录
  login: function (cb, detailID) {
    console.log(1111)
    var that = this;
    var fid = this.globalData.fxID; //分销人ID
    //调用登录接口
    let userIdx = wx.getStorageSync('user_id');
    let sessionIDx = wx.getStorageSync('sessionID');
    let isFx = wx.getStorageSync('is_fx');
    let isNew = wx.getStorageSync('is_new');
    let wxUserInfo = wx.getStorageSync("wx_user_info");

    wxUserInfo = wxUserInfo ? JSON.parse(wxUserInfo) : null;

    console.log(userIdx, sessionIDx);

    if (this.globalData.userInfo && this.globalData.userID && this.globalData.openID) {
      
      typeof cb == "function" && cb(this.globalData.userInfo);
      return;
    }
    if (wxUserInfo && userIdx && sessionIDx) {
      that.globalData.openID = sessionIDx;
      that.globalData.userID = userIdx;
      that.globalData.isFX = isFx;
      that.globalData.isNew = isNew;
      that.globalData.userInfo = wxUserInfo;
      
      typeof cb == "function" && cb(this.globalData.userInfo);
      // if (!this.globalData.userID) {
      //   this.getUserInfoById();
      // }
    } else {
      
      if (cb != "" && typeof cb != "function") {
        fid = cb;
      };
      console.log('空空空')
      wx.login({
        success: function (res) {
          var code = res.code;
          if (code) {
            wx.request({
              url: that.globalData.postUrl + '/api/Logic/WxLogin',
              data: {
                code: code,
                fid: fid
              },
              method: 'GET',
              header: {},
              success: function (res) {
                console.log(res)
                if (res.data.success) {
                  wx.setStorageSync('sessionID', res.data.session_id);
                  wx.setStorageSync('user_id', res.data.user_id);
                  wx.setStorageSync('is_fx', res.data.is_fx);
                  that.globalData.openID = res.data.session_id
                  that.globalData.userID = res.data.user_id
                  that.globalData.isNew = res.data.is_new == 0 ? false : true;
                  console.log(that.globalData.isNew);
                  wx.setStorageSync('is_new', that.globalData.isNew);
                  console.log(res.data.user_id);
                  that.globalData.isFX = res.data.is_fx;
                  // if (that.globalData.userInfo) {
                  //   console.log('存在globao');
                  //   typeof cb == "function" && cb(that.globalData.userInfo);
                  // } else {
                  console.log('存在globaoglobaoglobaoglobao');
                    that.getUserInfoById(cb);
                  // }

                  // typeof cb == "function" && cb(that.globalData.userInfo);
                }
              }
            })
          } else {
            console.log("没有code的情况")
          }
        }
      })
    }
  },
  getUserInfoById: function (cb) {
    var that = this;
    //现在判断有没有获取过用户信息，如果获取过，那么就不用管了
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function (res) {
              console.log(res);
              //发起网络请求
              wx.request({
                url: that.globalData.postUrl + '/api/logic/updateuserinfo',
                data: {
                  user_id: that.globalData.userID,
                  nickname: res.userInfo.nickName,
                  avatar: res.userInfo.avatarUrl,
                },
                method: 'GET',
                header: {},
                success: function (res) {
                  console.log(res);
                }
              })
              that.globalData.userInfo = res.userInfo

              wx.setStorageSync("wx_uesr_info", JSON.stringify(res.userInfo));

              console.log('bbbbbbbbbbbbbbbbbb');
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function (res) {
              //没有授权
              console.log('cccccccccccccccccccccccc');
              that.redirect('authorize/index');
            }
          });
        } else {
          //没有授权的情况
          console.log('ddddddddddddddddddd');
          that.redirect('authorize/index');
        }
      }
    })
  },


  /**
   * 签名
   * @param data        提交的数据
   * @returns {string}
   */
  signature: function (data) {
    var n = null,
      d = {},
      str = '',
      s = ''
    n = Object.keys(data).sort()
    for (var i in n) {
      d[n[i]] = data[n[i]]
    }
    for (var k in d) {
      if (d[k] === '') continue
      if (str != '') str += '&'
      str += k + '=' + encodeURI(d[k])
    }
    str += '&key=' + this.globalData.signKey;
    s = utilMd5.hexMD5(str).toUpperCase() // 这儿是进行MD5加密并转大写
    return s;
  },

  //跳转到不是底部菜单的页面(保存之前页面)
  redirect: function (url, param) {
    wx.navigateTo({
      url: '/pages/' + url + '?' + param
    })
  },
  //跳转到不是底部菜单的页面(关闭之前页面),切换小类要用
  gourl: function (url, param) {
    wx.redirectTo({
      url: '/pages/' + url + '?' + param
    })
  },
  //跳转到底部菜单的页面
  gotaburl: function (url) {
    wx.switchTab({
      url: '/pages/' + url
    })
  },

  globalData: {
    userInfo: null,
    openID: '',
    userID: '',
    isFX: '',
    fxID: 0,
    isNew: false,
    signKey: 'myjrc',
    gdt_vid:'',
    //wx9f9be71165fe140a
     postUrl: "https://sapi.xiaonianyu.com"
    //wxbeeab951f2e8a66f
    // postUrl: "https://saptest.xiaonianyu.com"
  },
})


// 此小程序有定时器的地方有：   (!)代表有问题
//1.订单列表页 2.订单详情页 3.首页专题部分和显示抢购部分(!) 4.新人页面抢红包的列表(!暂时没启动) 5.我的红包页面(!!暂时没启动) 6.使用红包页(!!暂时没启动) 7.限时抢购页(!) 8.专题列表页(!)