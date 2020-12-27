/*
 *
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
const NC = require("../../utils/notificationcenter.js");
import config from "../../utils/config.js";
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10
Page({
  data: {
    tagsList: [],
    isPull: false,
    page: 1,
    isLastPage: false,
    isLoading: false,
    shareTitle: appName,
    pageTitle: appName + " ئاۋات خەتكۈچ"
  },

  onLoad: function(options) {
    var args = {};
    var self = this;
    args.pageCount = pageCount;
    args.page = 1;

    Adapter.loadTags(args, self, API);
    wx.setNavigationBarTitle({
      title: "ئاۋات خەتكۈچ"
    });

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    return {
      title: this.data.pageTitle
    }
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: this.data.shareTitle,
      path: "/pages/postags/postags"
    };
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    var args = {};
    var self = this;
    self.setData({ isPull: true, tagsList: [] });
    args.pageCount = pageCount;
    args.page = 1;
    Adapter.loadTags(args, self, API);
  },

  // 上拉加载
  onReachBottom: function() {
    let args = {};
    if (!this.data.isLastPage) {
      args.page = this.data.page + 1;
      args.pageCount = pageCount;
      Adapter.loadTags(args, this, API);
    }
  },

  // 跳转
  redictTaglist(e) {
    var id = e.currentTarget.id;
    var name = e.currentTarget.dataset.name;
    var count = e.currentTarget.dataset.count;
    var url = "../list/list?tag=" + id + "&tagname=" + name + "&tagPostsCount=" + count;
    wx.navigateTo({
      url
    })
  }
});
