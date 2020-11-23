/*
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


Page({
  data: {
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isLoginPopup: false,
    system: '',
    floatDisplay: true,
    userpostsList: [],
    topBarItems: [
      { id: '1', name: '话题', selected: false, posttype: 'topic' },
      { id: '2', name: '文章', selected: false, posttype: 'post'}          
    ],    
    page: 1,
    postype: '',
    userId: ''
  },

  onLoad: function (option) {
    let self = this
    let userId= option.userid
    let postype = option.postype || 'topic'

    let args = {}
    args.pageCount = pageCount
    args.userId = userId
    args.postype = postype
    args.page = 1
    args.sessionId = ''
    args.listName = 'userpostsList'
    args.isCategory = true

    Auth.setUserMemberInfoData(self)
    Auth.checkLogin(self)
    self.setData({userId: userId})
    Adapter.loadArticles(args, self, API)

    let topBarItems = [].concat(self.data.topBarItems.map(function (item){
        item.selected = item.posttype == postype
        return item
      })
    )

    self.setData({topBarItems: topBarItems, postype: postype}) 
    let curLoginUserId = self.data.userSession.userId
    let curLoginSessionId = self.data.userSession.sessionId

    args.curLoginUserId = curLoginUserId
    args.curLoginSessionId = curLoginSessionId
    Auth.getUserInfo(args, API).then(res => {
       self.setData({userInfo: res.memberUserInfo})
    })

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage','shareTimeline']
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {   
    return {
      title: this.data.userInfo.user_nicename + ' 的个人主页',
      query: {
        userid: this.data.userId,
        postype: 'topic'
      },  
      imageUrl: this.data.userInfo.avatarurl
    }
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: this.data.userInfo.user_nicename + ' 的个人主页',
      path: `/pages/author/author?userid=${this.data.userId}&postype=topic`
    }
  },

  // 上拉加载
  onReachBottom: function () {
    let args = {}
    let self = this
    args.userId = self.data.userInfo.id
    args.pageCount = pageCount
    args.postype = self.data.postype
    args.sessionId = ''
    args.isCategory = true
    args.listName = 'userpostsList'
    args.page = self.data.page + 1
    Adapter.loadArticles(args, self, API)
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self = this
    Auth.checkLogin(self)
    this.setData({
      userpostsList: []
    })

    let args = {}
    args.userId = self.data.userInfo.id
    args.pageCount = pageCount
    args.postype = self.data.postype
    args.isCategory = true
    args.sessionId = ''
    args.listName = 'userpostsList'
    args.page = 1
    Adapter.loadArticles(args, self, API)
    wx.stopPullDownRefresh()
  },

  // 切换tab
  onTapTag(e) {
    let self = this
    let tab = e.currentTarget.id
    let postype = e.currentTarget.dataset.postype
    self.setData ({
      userpostsList: []
    })

    let topBarItems = self.data.topBarItems
    for (let i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true
      } else {
        topBarItems[i].selected = false
      }
    }

    let args = {}
    args.userId = self.data.userId
    args.pageCount = pageCount
    args.postype = postype
    args.isCategory = true
    args.listName = 'userpostsList'
    args.page = 1
    args.sessionId = ''

    Adapter.loadArticles(args, self, API)
    self.setData({
      topBarItems: topBarItems,
      page:args.page,
      postype:postype
    })    
  },

  // 跳转文章详情
  redictDetail(e) {
    let id = e.currentTarget.id
    let postype = this.data.postype
    let url = '../detail/detail?id=' + id
    if (postype == 'topic') {
      url = '../socialdetail/socialdetail?id=' + id
    }

    wx.navigateTo({
      url
    })
  },

  // 关注
  followAuthor(e) {
    let self = this
    let sessionId = self.data.userSession.sessionId
    let userId = self.data.userSession.userId
    let flag = e.currentTarget.dataset.follow
    let authorid = e.currentTarget.dataset.authorid
    let listType = e.currentTarget.dataset.listtype

    if (!sessionId || !userId) {
      self.setData({
        isLoginPopup: true
      })
      return
    }

    let args = {}
    args.userId = userId
    args.sessionId = sessionId
    args.id = authorid
    args.flag = flag
    args.listType = listType
    Adapter.userFollow(API, self, args)
  },

  agreeGetUser(e) {
    Auth.checkAgreeGetUser(e, app, this, API, '0')
  },

  closeLoginPopup() {
    this.setData({ isLoginPopup: false })
  },

  openLoginPopup() {
    this.setData({ isLoginPopup: true })
  },
  
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }
})

