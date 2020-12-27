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
const pageCount = 10

const options = {
  data: {
    orders: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    zanImageUrl: '',
    tempZanImageSrc: '',
    zanImage: '',
  },

  onLoad: function (option) {
    let self = this;
    Auth.setUserMemberInfoData(self);
    
    let data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    
    let raw_praise_word = '鼓励'
    API.getMyzanImage(data).then(res => {
      if (res.code) { // 未上传二维码
        raw_praise_word = res.data.raw_praise_word || '鼓励';
        self.setData({
          raw_praise_word
        })
      } else {
        raw_praise_word = res.raw_praise_word || '鼓励';
        self.setData({
          zanImageUrl: res.zanImageUrl,
          zanImage: res.zanImageUrl,
          raw_praise_word
        })
      }

      wx.setNavigationBarTitle({
        title: 'مىنىڭ ' + raw_praise_word + ' چىپار كودىم'
      })
    })
  },

  selectImage: function () {
    let self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', , 'camera'],
      success: (res) => {
        var tempFiles = res.tempFiles;
        var tempFileSize = Math.ceil((tempFiles[0].size) / 1024);
        var tempFilePath = tempFiles[0].path;
        if (tempFileSize > 2048) {
          Adapter.toast('رەسىم 2 مىگابايىتتىن يۇقۇرى بولمىسۇن', 3000);

        }
        else {
          self.setData({ tempZanImageSrc: tempFilePath, zanImageUrl: '', zanImage: tempFilePath })

        }
      }
    })
  },

  upLoadZanIamge: function () {
    var self = this
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var tempZanImageSrc = self.data.tempZanImageSrc;

    var data = {};
    var formData = {
      'sessionid': sessionId,
      'userid': userId,
      'fileName': "",
      "imagestype": "zanimage"
    };

    data.imgfile = tempZanImageSrc;
    data.formData = formData;
    wx.showLoading({
      title: "رەسىم چىقىرىلىۋاتىدۇ...",
      mask: true
    });
    API.uploadFile(data).then(res => {
      var res = JSON.parse(res.trim());
      if (res.code == 'error') {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 3000
        });
      }
      else {
        self.setData({
          tempZanImageSrc: '',
          zanImageUrl: res.imageurl,
          zanImage: res.imageurl
        })

      }
      wx.hideLoading();

    }).catch(err => {
      wx.showToast({ icon: 'none', title: err.errMsg || 'چىقىرىش مەغلۇب بولدى...' });
      wx.hideLoading()
    })

  }

}

Page(options)

