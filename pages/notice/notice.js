const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'

const app = getApp()
const pageCount = 10


Page({
  // 初始数据
  data: {
    pageTitle: 'ئۇچۇرلىرىم',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isLoginPopup: false,
    allUnReadCount:0,
    isLoginPopup: false,
    alloftypeMessageList:[],
    pageName: "notice",
  },

  // 页面加载
  onLoad: function (options) {

    var self = this;
    wx.setNavigationBarTitle({
      title: self.data.pageTitle
    })
    
    Auth.checkSession(app, API, self, 'isLoginNow', util);
    Auth.checkLogin(self);
    this.getAllOfTypeUnReadCount();
    
  },

  // 页面显示
  onShow: function () {
    this.getAllUnReadCount();
    this.getAllOfTypeUnReadCount()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.getAllUnReadCount()
    this.getAllOfTypeUnReadCount()
  },

  //获取所有未读消息的数量
  getAllUnReadCount() {
    var args = {};
    var self = this;
    setTimeout(function () {
      var data = {};
      if (self.data.userSession.sessionId) {
        data.userId = self.data.userSession.userId;
        data.sessionId = self.data.userSession.sessionId;
        data.messagetype = "all";
        Adapter.getMessageCount(self, data, API);
      }
    }, 500);
  },

  //按分类获取未读消息的数量
  async getAllOfTypeUnReadCount() {
    var args = {};
    var self = this;
    if (this.data.userSession.sessionId) {
      args.userId = self.data.userSession.userId;
      args.sessionId = self.data.userSession.sessionId;
      args.messagetype = "alloftype";
      await Adapter.getMessageCount(self, args, API)
      wx.stopPullDownRefresh()
    }
  },

  // 去消息列表
  toNotice(e) {
    var messagetype = e.currentTarget.dataset.messagetype
    var url = "../mynotice/mynotice?messagetype="+messagetype
    wx.navigateTo({
      url: url
    })
  },

  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },

  // 用户授权
  agreeGetUser(e) {
    Auth.checkAgreeGetUser(e, app, this, API, '0')
  }
})