import config from '../../utils/config.js'

const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')
const pageCount = 10
const app = getApp()
const appName = app.globalData.appName
let rewardedVideoAd = null




Page({
  // 初始数据
  data: {
    shareTitle: appName,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    settings: {},
    isLoginPopup: false,
    system: '',
    enterpriseMinapp: '',
    task: {
      signined: false,
      shareapped: false,
      openAdVideoed: false
    },
    taskError: false
  },

  // 页面加载
  onLoad: function() {
    let self = this
    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'
        self.setData({
          system: system,
          platform: t.platform
        })
      }
    })

    Auth.setUserMemberInfoData(self)
    Auth.checkLogin(self)
    self.getMytaskStatus()
    self.getSetting()
  },

  // 分享
  onShareAppMessage: function(e) {
    var self = this
    var data = {}
    if (e.from === 'button') {
      data.userId = this.data.userSession.userId
      data.sessionId = this.data.userSession.sessionId
      var task = self.data.task
      API.shareApp(data).then(res => {
        if (res.code == 'error') {
          task.canShareApp = res.data.canShareApp
          wx.showToast({
            title: res.message,
            mask: false,
            icon: "none",
            duration: 2000
          })
        } else {
          var raw_user_shareapp = res.raw_user_shareapp
          task.canShareApp = res.canShareApp
          task.shareappedCount = raw_user_shareapp
          self.setData({
            task: task
          })

          if (self.data.userSession.sessionId) {
            Auth.checkGetMemberUserInfo(self.data.userSession, self, API)
          }
          wx.showToast({
            title: res.message,
            mask: false,
            icon: "none",
            duration: 4000
          })
        }
      })
    }

    var imageUrl= this.data.settings.raw_default_share_image;
    return {
      title: this.data.shareTitle,
      path: '/pages/index/index',
      imageUrl: imageUrl
    }
  },

  // 积分设置
  getSetting() {
    var self = this
    API.getSettings().then(res => {
      self.setData({
        settings: res.settings
      })
    })
  },

  // 任务状态
  getMytaskStatus() {
    var data = {}
    var self = this
    data.userId = this.data.userSession.userId
    data.sessionId = this.data.userSession.sessionId

    API.myTask(data).then(res => {
      if (res.code) {
        self.setData({
          taskError: true
        })
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 2000
        })
      } else {
        self.setData({
          task: res.task
        })
        self.loadInterstitialAd(self.data.task.excitationAdId)
        if (self.data.userSession.sessionId) {
          Auth.checkGetMemberUserInfo(self.data.userSession, self, API)
        }
      }
    })
  },

  // 签到
  signin() {
    var self = this
    var data = {}
    data.userId = this.data.userSession.userId
    data.sessionId = this.data.userSession.sessionId

    API.signin(data).then(res => {
      if (res.code == 'error') {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 2000
        })
      } else {
        var task = self.data.task
        task.signined = true
        self.setData({
          task: task
        })

        if (self.data.userSession.sessionId) {
          Auth.checkGetMemberUserInfo(self.data.userSession, self, API)
        }

        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 4000
        })
      }
    })
  },

  // 激励视频
  openAdVideo() {
    var platform = this.data.platform
    if (platform == 'devtools') {
      Adapter.toast("开发工具无法显示激励视频", 2000)
    } else {
      rewardedVideoAd.show().catch(() => {
        rewardedVideoAd.load().then(() => rewardedVideoAd.show()).catch(err => {
          Adapter.toast("ئىلانغا ئېرىشىش مەغلۇب بولدى", 2000)
        })
      })
    }
  },

  // 加载广告
  loadInterstitialAd(excitationAdId) {
    var self = this
    var data = {}
    data.userId = this.data.userSession.userId
    data.sessionId = this.data.userSession.sessionId
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: excitationAdId
      })

      rewardedVideoAd.onLoad(() => {
        // console.log('广告加载成功')
      })
      rewardedVideoAd.onError((err) => {
        // console.log('广告加载：' + err)
      })
      rewardedVideoAd.onClose((res) => {
        var task = self.data.task;
        if (res && res.isEnded) {
          API.openAdVideo(data).then(res => {
            if (res.code == 'error') {
              task.canOpenAdVideo = res.data.canOpenAdVideo;
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 2000
              })
            } else {
              task.openAdVideoedCount = res.raw_user_openAdVideo;
              task.canOpenAdVideo = res.canOpenAdVideo;
              self.setData({
                task: task
              })

              if (self.data.userSession.sessionId) {
                Auth.checkGetMemberUserInfo(self.data.userSession, self, API)
              }

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 4000
              })
            }
          })
        } else {
          Adapter.toast("ئىلاننى تولۇق كۆرۈپ بولمىدىڭىز", 3000)
        }
      })
    }
  },

  // 去积分等级说明页
  toIntegralDes() {
    wx.navigateTo({
      url: `../myinfo/myinfo?integral=${this.data.memberUserInfo.integral}`
    })
  },
  getPhoneNumber(e){

    Adapter.getPhoneNumber(e,this,API,Auth);

 }
})