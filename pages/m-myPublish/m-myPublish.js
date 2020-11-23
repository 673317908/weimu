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
  data: {
    pageTitle: appName,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isLoginPopup: false,
    system: '',
    floatDisplay: true,
    userpostsList: [],
    topBarItems: [
      // id name selected 选中状态
      { id: '1', name: '话题', selected: false, 'posttype': 'topic' },
      { id: '2', name: '文章', selected: false, 'posttype': 'post' }

    ],
    page: 1,
    postype: '',
    userId: '',
    pageName: "m-myPublish"
  },

  onLoad: function (option) {
    let self = this;

    Auth.checkSession(app, API, self, 'isLoginLater', util);
    Auth.checkLogin(self);
    var postype = option.postype;
    var args = {};
    args.userId = self.data.userSession.userId;
    args.sessionId = self.data.userSession.sessionId;
    args.pageCount = pageCount;

    args.postype = postype;
    args.page = 1;
    args.listName = 'userpostsList';
    args.isCategory = true;
    Adapter.loadArticles(args, self, API);
    var topBarItems = [].concat(self.data.topBarItems.map(function (item) {
      if (item.posttype == postype) {
        item.selected = true;
      }
      return item;
    })
    );
    self.setData({ topBarItems: topBarItems, postype: postype });

    var curLoginUserId = self.data.userSession.userId;
    var curLoginSessionId = self.data.userSession.sessionId;

    args.curLoginUserId = curLoginUserId;
    args.curLoginSessionId = curLoginSessionId;
    Auth.getUserInfo(args, API).then(res => {
      self.setData({ userInfo: res.memberUserInfo });
    });
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.id;
    var postype = this.data.postype;
    var poststatus = e.currentTarget.dataset.poststatus;
    if (poststatus == "pending") {
      Adapter.toast('审核中的文章不能查看', 3000);
      return;

    }
    var url = '../detail/detail?id=' + id;
    if (postype == "topic") {
      url = '../socialdetail/socialdetail?id=' + id;
    }
    wx.navigateTo({
      url: url
    })
  },

  followAuthor: function (e) {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var flag = e.currentTarget.dataset.follow;
    var authorid = e.currentTarget.dataset.authorid;
    var listType = e.currentTarget.dataset.listtype;
    if (!sessionId || !userId) {
      self.setData({ isLoginPopup: true });
      return;
    }

    var args = {};
    args.userId = userId;
    args.sessionId = sessionId;
    args.id = authorid
    args.flag = flag;
    args.listType = listType;
    Adapter.userFollow(API, self, args)

  },

  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var postype = e.currentTarget.dataset.postype;
    self.setData({ userpostsList: [] });
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    var args = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;

    args.userId = userId;
    args.sessionId = sessionId;
    args.pageCount = pageCount;
    args.postype = postype;
    args.isCategory = true;
    args.listName = 'userpostsList';
    args.page = 1;

    Adapter.loadArticles(args, self, API);
    self.setData({
      topBarItems: topBarItems,
      page: args.page,
      postype: postype

    })
  },

  onReachBottom: function () {
    var args = {};
    var self = this;
    args.sessionId = self.data.userSession.sessionId;
    args.userId = self.data.userSession.userId;
    args.pageCount = pageCount;
    args.postype = self.data.postype;
    args.isCategory = true;
    args.listName = 'userpostsList';
    args.page = self.data.page + 1;
    Adapter.loadArticles(args, self, API);
  },
  onPullDownRefresh: function () {
    this.setData({ userpostsList: [] });
    var args = {};
    var self = this;
    //args.userId = self.data.userInfo.id;
    args.sessionId = self.data.userSession.sessionId;
    args.userId = self.data.userSession.userId;
    args.pageCount = pageCount;
    args.postype = self.data.postype;
    args.isCategory = true;
    args.listName = 'userpostsList';
    args.page = 1;
    Adapter.loadArticles(args, self, API);
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {
    var userId = this.data.userSession.userId;
    return {
      title: this.data.userInfo.user_nicename + ' 的个人主页',
      path: '/pages/author/author?userid=' + userId + '&postype=topic',
      //imageUrl: this.data.detail.content_first_image,
    }
  },

  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  postsub: function (e) {
    var self = this;
    var extid = e.currentTarget.id;
    var subscribetype = '';
    var postType = e.currentTarget.dataset.posttype;
    if (postType == "post") {
      subscribetype = 'postCommentSubscribe';
    }
    else if (postType == "topic") {

      subscribetype = 'topicCommentSubscribe';

    }
    var subscribemessagesid = e.currentTarget.dataset.subid;
    Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid);


  },
})

