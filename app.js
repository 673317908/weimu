/* 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
import * as api from 'utils/new/api.js'
import * as util from 'utils/new/util.js'
import config from 'utils/config.js'
const Api = require('./utils/api.js')
const miniShopPlugin = requirePlugin('mini-shop-plugin');

App({
  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);

    this.updateManager()
    this.getConfigData()
    miniShopPlugin.initHomePath('/pages/shop/index/index');
  },

  // 获取配置数据
  getConfigData() {
    const http = Api.getConfig()

    http.then(res => {
      const data = res.settings
      let _d = data.downloadfile_domain
      let _b = data.business_domain

      let appName = data.webname
      let appDes = data.websitedec
      let appLogo = data.appLogo
      // let praiseImg = data.praiseImg
      let downloadDomain = _d.length ? _d.split(',') : []
      let businessDomain = _b.length ? _b.split(',') : []
      let copyright = "©  " + appName + " " + config.getDomain

      let customBanner = {
        home: data.expand.home_list_top_nav,
        cate: data.expand.cat_list_nav,
        cateList: data.expand.cat_posts_list_nav,
        topicList: data.expand.topic_list_nav,
        postDetail: data.expand.post_detail_top_nav,
        topicDetail: data.expand.topic_detail_top_nav
      }

      let info = this.globalData
      this.globalData = {
        ...info,
        appName,
        appLogo,
        appDes,     
        downloadDomain,
        businessDomain,    
        copyright,
        customBanner
      }
    })
  },

  // 小程序更新
  updateManager() {
    if (!wx.canIUse('getUpdateManager')) {
      return false;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: 'يىڭىلاش ئەسكەرىتمىسى',
        content: 'ئەپچە يېڭىلاندى،قايتىدىن قوزغىتىڭ',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: 'يېڭىلاش ئەسكەرىتمىسى',
        content: 'يېڭىلاش مەغلۇپ بولدى',
        showCancel: false
      })
    });
  },
  globalData: {
    userInfo: {},
    userSession: {},
    memberUserInfo: {},
    wxLoginInfo: {},   
    appSetting: {},
    appName: '',
    appDes: '',
    appLogo: '',  
    downloadDomain: [],
    businessDomain: [],  
    copyright: '',
    customBanner: {}
  },

  // 新封装的wx.request
  $api: api,
  $util: util
})