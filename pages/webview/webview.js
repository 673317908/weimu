/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */


import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
const app = getApp()
const appName = app.globalData.appName



Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: null,
    title: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    if (options.url != null) {
      var url = decodeURIComponent(options.url);
      if (url.indexOf('*') != -1) {
        url = url.replace("*", "?");
      }
      self.setData({
        url: url
      });      
    }
    else {
      self.setData({
        url: 'https://' + config.getDomain
      });
    }

  },
  onShareAppMessage: function (options) {
    var self = this;
    var url = options.webViewUrl;
    var _url =self.data.url;
    if(_url.indexOf("mp.weixin.qq.com") !=-1)
    {
      url=_url;
    }
    if (url.indexOf("?") != -1) {
      url = url.replace("?", "*");
    }
    url = 'pages/webview/webview?url=' + url;
    return {
      title: '"'+appName + '"的文章' + self.data.title,
      path: url
    }
  }
})