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
    messages: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isShowDialog: false, // 查看回复提示框
    replyContent: ''
  },

  onLoad: function (option) {
    let self = this;
    Auth.setUserMemberInfoData(self);
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    API.getMymesage(data).then(res => {
      // 要判断一下，接口不正规，没返回状态码，成功就直接扔过来数据了
      if (res.length) {
        self.setData({
          messages: res
        })
      }
    });
  },
  // 查看回复
  getReplyContent(e) {
    let id = e.target.dataset.id
    let replyContent = ''
    this.data.messages.filter(item => {
      if (item.ID === id) {
        replyContent = item.excerpt + '(' + item.updatedate + ')'
      }
    })

    this.setData({
      isShowDialog: true,
      replyContent: replyContent
    })
  },

  // 去预约
  toAppointment: function () {
    var url = '/pages/appointment/appointment';
    wx.navigateTo({
      url: url
    })
  },
  onPullDownRefresh: function () {}
}

Page(options)

