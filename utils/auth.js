/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */


const Auth = {}
Auth.wxLogin = function () {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        let args = {};
        args.js_code = res.code;
        resolve(args);
      },
      fail: function (err) {
        reject(err);
      }
    });
  })
}

Auth.wxGetUserInfo = function () {
  return new Promise(function (resolve, reject) {
    wx.getUserInfo({
      success: function (res) {
        resolve(res);
      },
      fail: function (err) {
        resolve(err);
      }
    });
  });
}

Auth.userLogin = function (args, api) {
  return new Promise(function (resolve, reject) {
    api.userLogin(args).then(res => {
      if (res.raw_session) {
        resolve(res.raw_session);

      } else {
        if (res.data.message) {
          reject(res.data.message);
        } else if (res.message) {
          reject(res.message);
        }
      }
    })
  })
}


Auth.scopeUserInfo = function () {
  return new Promise(function (resolve, reject) {
    let args = {};
    wx.getSetting({
      success: function success(res) {
        var authSetting = res.authSetting;
        if (!('scope.userInfo' in authSetting)) {
          args.scopeUserInfo = 'none';
        } else {
          if (authSetting['scope.userInfo'] === false) {
            args.scopeUserInfo = '0';
          } else {
            args.scopeUserInfo = '1';
          }
        }
        resolve(args.scopeUserInfo);
      },
      fail: function (err) {
        reject(err);
      }
    })
  })
}

Auth.agreeGetUser = function (e, api, wxLoginInfo, authFlag) {
  return new Promise(function (resolve, reject) {
    let args = {};
    args.js_code = wxLoginInfo.js_code;
    if (authFlag == '0' && e.detail.errMsg == 'getUserInfo:fail auth deny') {
      args.errcode = e.detail.errMsg;
      args.userInfo = {
        isLogin: false
      }
      args.userSession = "";
      resolve(args);
      return;
    }
    var userInfoDetail = {};
    if (authFlag == '0') //未授权过,通过按钮授权
    {
      userInfoDetail = e.detail;
    } else if (authFlag == '1') //已经授权过，直接通过wx.getUserInfo获取
    {
      userInfoDetail = e;
    }
    if (userInfoDetail && userInfoDetail.userInfo) {
      args.iv = userInfoDetail.iv;
      args.encryptedData = userInfoDetail.encryptedData;
      let userInfo = userInfoDetail.userInfo;
      userInfo.isLogin = true;
      args.userInfo = userInfo;
      Auth.userLogin(args, api).then(userSession => {
        args.userSession = userSession;
        args.errcode = "";
        resolve(args);
      }).catch(function (error) {
        reject(error);
      })
    } else {
      args.errcode = "error";
      args.userInfo = {
        isLogin: false
      };
      args.userSession = "";
      resolve(args);
    }
  })
}

Auth.getMemberUserInfo = function (args, api) {
  return new Promise(function (resolve, reject) {
    let weixinUsreInfo = {};
    api.getMemberUserInfo(args).then(res => {
      resolve(res);
    })
  })

}

Auth.getUserInfo = function (args, api) {
  return new Promise(function (resolve, reject) {
    api.getUserInfo(args).then(res => {
      resolve(res);
    })
  })

}

Auth.checkLogin = function (appPage) {
  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  wx.checkSession({
    success: function () {
      if (!wxLoginInfo.js_code) {
        Auth.wxLogin().then(res => {
          appPage.setData({
            wxLoginInfo: res
          });
          wx.setStorageSync('wxLoginInfo', res);
        })
      }
    },
    fail: function () {
      Auth.wxLogin().then(res => {
        appPage.setData({
          wxLoginInfo: res
        });
        wx.setStorageSync('wxLoginInfo', res);
      })
    }
  })


}

Auth.checkSession = function (app, api, appPage, flag, util) {
  let userSession = wx.getStorageSync('userSession');
  if (!userSession.sessionId) {
    if ('isLoginNow' == flag) {
      var userInfo = {
        avatarUrl: "../../images/gravatar.png",
        nickName: "كىرىش",
        isLogin: false
      }
      appPage.setData({
        isLoginPopup: true,
        userInfo: userInfo
      });
    }
  } else {
    if (util.checkSessionExpire(userSession.sessionExpire)) {
      var data = {};
      data.userId = userSession.userId;
      data.sessionId = userSession.sessionId;
      api.updateSession(data).then(res => {
        if (res.raw_session) {
          wx.setStorageSync('userSession', res.raw_session);
          Auth.setUserMemberInfoData(appPage);
        } else if (res.code == 'user_parameter_error') {
          Auth.logout(appPage);
          wx.reLaunch({
            url: '../index/index'
          })

        }
      })
    } else {
      Auth.setUserMemberInfoData(appPage);
    }
  }

}


Auth.checkGetMumber = function (app, appPage, api) {

  let memberUserInfo = wx.getStorageSync('memberUserInfo');
  let userSession = wx.getStorageSync('userSession');
  if (userSession.sessionId && !memberUserInfo.membername) {
    Auth.getMemberUserInfo(userSession, api).then(res => {
      if (res.memberUserInfo) {
        appPage.setData({
          memberUserInfo: res.memberUserInfo
        });
        wx.setStorageSync('memberUserInfo', res.memberUserInfo);
      }
    })
  }
}

Auth.checkAgreeGetUser = function (e, app, appPage, api, authFlag) {

  let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
  if (wxLoginInfo.js_code) {
    Auth.agreeGetUser(e, api, wxLoginInfo, authFlag).then(res => {
      if (res.errcode == "") {
        appPage.setData({
          userInfo: res.userInfo
        });
        wx.setStorageSync('userInfo', res.userInfo);
        wx.setStorageSync('userSession', res.userSession);
        appPage.setData({
          userSession: res.userSession
        });
        Auth.getMemberUserInfo(res.userSession, api).then(response => {
          if (response.memberUserInfo) {
            appPage.setData({
              memberUserInfo: response.memberUserInfo
            });
            wx.setStorageSync('memberUserInfo', response.memberUserInfo);
            if (appPage.data.pageName == "detail" || appPage.data.pageName == "media-list" || appPage.data.pageName == "social") {
              appPage.onPullDownRefresh();
            }
          }
        })
      } else {
        var userInfo = {
          avatarUrl: "../../images/gravatar.png",
          nickName: "كىرىش",
          isLogin: false
        }
        appPage.setData({
          userInfo: userInfo
        })
      }
      appPage.setData({
        isLoginPopup: false
      });

    })
  } else {
    wx.showToast({
      title: 'كىرىش مەغلۇپ بولدى',
      mask: false,
      duration: 1000
    });

  }
}

Auth.checkGetMemberUserInfo = function (userSession, appPage, api) {

  if (userSession.sessionId) {
    Auth.getMemberUserInfo(userSession, api).then(res => {
      if (res.memberUserInfo) {
        // var date = new Date()
        // var Y = date.getFullYear() + '-'
        // var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
        // var D = date.getDate() < 9 ? '0' + date.getDate() + ' ' : date.getDate() + ' '
        // var h = date.getHours() < 9 ? '0' + date.getHours() + ':' : date.getHours() + ':'
        // var m = date.getMinutes() < 9 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':'
        // var s = date.getSeconds() < 9 ? '0' + date.getSeconds() : date.getSeconds()
        // var time = Y + M + D + h + m + s
        var startDate = Date.parse(new Date());
        var endDate = Date.parse(res.memberUserInfo.memberenddate);
        var days =
          parseInt((endDate - startDate) / (1 * 24 * 60 * 60 * 1000));
        res.memberUserInfo.days = days == 0 ? days + 1 : days
        appPage.setData({
          memberUserInfo: res.memberUserInfo
        });
        wx.setStorageSync('memberUserInfo', res.memberUserInfo);
        // if(appPage.data.pageName=='myself')
        // {
        //     wx.showToast({
        //         title: '用户信息已更新',
        //         icon: "none",
        //         duration: 1000
        //       });
        // }



      } else {
        if (appPage.data.pageName == 'myself') {
          wx.showToast({
            title: res.message,
            icon: "none",
            duration: 3000
          });
        }

      }
      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }

    })
  }
}
Auth.setUserMemberInfoData = function (appPage) {
  appPage.setData({
    listStyle: wx.getStorageSync('listStyle')
  });
  if (!appPage.data.userSession.sessionId) {
    let curUserInfo = wx.getStorageSync('userInfo')
    if (!curUserInfo.avatarUrl || !curUserInfo.nickName) {
      curUserInfo = {
        avatarUrl: "../../images/gravatar.png",
        nickName: "كىرىش",
        isLogin: false
      }
    }
    appPage.setData({
      userInfo: curUserInfo,
      userSession: wx.getStorageSync('userSession'),
      wxLoginInfo: wx.getStorageSync('wxLoginInfo'),
      memberUserInfo: wx.getStorageSync('memberUserInfo')
    })
  }
}

Auth.logout = function (appPage) {
  appPage.setData({
    userSession: {},
    memberUserInfo: {},
    userInfo: {
      avatarUrl: "../../images/gravatar.png",
      nickName: "كىرىش",
      isLogin: false
    },
    wxLoginInfo: {}
  })
  wx.removeStorageSync('userInfo');
  wx.removeStorageSync('userSession');
  wx.removeStorageSync('memberUserInfo');
  wx.removeStorageSync('wxLoginInfo');
}

Auth.getPhoneMumber = function (appPage, api, iv, encryptedData) {
  return new Promise(function (resolve, reject) {
    Auth.wxLogin().then(res => {
      appPage.setData({
        wxLoginInfo: res
      });
      wx.setStorageSync('wxLoginInfo', res);
      let args = {};
      let data = {};
      args.js_code = res.js_code;
      args.iv = iv;
      args.encryptedData = encryptedData;
      api.getPhoneMumber(args).then(res => {
        if (res.code != 'error') {

          data.phoneinfo = res.phoneinfo;
          data.errcode = "";
          data.message = res.message;
          resolve(data);
        } else {
          data.errcode = "error";
          data.phoneNumber = "";
          data.message = res.message;
          resolve(data);
        }
      })
    })






  })
}
module.exports = Auth