/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10

Page({
  // 初始数据
  data: {
    shareTitle: appName + '管理中心',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    Settings:{}
  },

  // 页面加载
  onLoad: function (options) {
    var self=this;
    Auth.checkSession(app, API, self, 'isLoginNow', util);
    Auth.checkLogin(self);
    Adapter.getSettings(self,API);
  },

  updateLive(){
    var args ={};
    var self=this;
    args.userId=self.data.userSession.userId;
    args.sessionId=self.data.userSession.sessionId;
    API.updateLive(args).then(res=>{
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 3000
      }); 
    })
  },

  changeSettings:function(e) {
    var args = {};
    var self = this;
    var setting = e.target.id;
    var settingvalue = e.detail.value ? "1" : "0";
    var Settings = self.data.Settings;

    args.userid=self.data.userSession.userId;
    args.sessionid=self.data.userSession.sessionId;
    args.setting=setting;
    args.settingvalue=settingvalue
    API.changeSettings(args).then(res=>{
      if(!res.success) {
        Settings.setting = e.detail.value ? "0" : "1";
        self.setData({Settings:Settings});
      }
      wx.showToast({
        title: res.message,
        mask: false,
        icon: "none",
        duration: 3000
      })
    })
  },

  // 初次渲染完成
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '管理中心'
    })
  }
})