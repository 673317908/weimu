/*
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require("../../utils/api.js");
const Auth = require("../../utils/auth.js");
const Adapter = require("../../utils/adapter.js");
const util = require("../../utils/util.js");
import config from "../../utils/config.js";
var pageCount = 10
const app = getApp()
const appName = app.globalData.appName

Page({
  data: {
    title: "最新评论列表",
    showerror: "none",
    showallDisplay: "block",
    readLogs: [],
    commentsList: [],
    pageTitle: appName
  },

  onLoad: function(options) {
    var self = this
    self.fetchCommentsData()

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    let title = appName + '的最新评论'
    return {
      title
    }
  },

  onShareAppMessage: function() {
    let title = appName + '的最新评论'
    let path = 'pages/comments/comments'
    return {
      title,
      path
    }
  },

  onPullDownRefresh: function() {
    var self = this
    this.setData({
      commentsList: []
    })
    self.setData({
      showallDisplay: "none",
      showerror: "none"
    })
    self.fetchCommentsData()
    wx.stopPullDownRefresh()
  },

  //获取文章列表数据
  fetchCommentsData() {
    let self = this

    let args = {}
    args.limit = 30
    args.page = 1
    args.flag = "newcomment"
    Adapter.loadComments(args, this, API)
  },

  // 跳转至查看文章详情
  redictDetail(e) {
    let id = e.currentTarget.dataset.postid
    let posttype = e.currentTarget.dataset.posttype
    let url = ''
    if (posttype == 'post') {
      url += '../detail/detail?id=' + id
    } else if (posttype == 'reply') {
      url += '../socialdetail/socialdetail?id=' + id
    }

    wx.navigateTo({
        url
    })
  }
})
