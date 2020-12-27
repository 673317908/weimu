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
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10

Page({

  data: {
    userInfo: {},
    readLogs: [],
    userSession: {},
    articlesList: [],
    navigationBarTitle: '' // 页面标题  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.setData({
      userInfo: wx.getStorageSync('userInfo'),
      userSession: wx.getStorageSync('userSession')
    });
    Auth.setUserMemberInfoData(self);
    self.fetchPostsData();
    Auth.checkLogin(self);
  },

  // 跳转
  goto(e) {
    var id = e.detail.currentTarget.id;
    var url = '../wppage/wppage?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  onShareAppMessage: function () {
    var title = appName + "دىكى بەتلەر";
    var path = "pages/wppagelist/wppagelist";
    return {
      title,
      path
    }
  },
  fetchPostsData: function () {
    self = this;
    var data = {};
    data.pageCount = 100;
    data.page = 1;
    API.getPages(data).then(res => {
      self.setData({
        articlesList: self.data.articlesList.concat(res)
      })
    })
  }
})