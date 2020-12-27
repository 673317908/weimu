/*
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const util = require('../../utils/util.js');
const Adapter = require('../../utils/adapter.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const pageCount = 10

const options = {
  data: {
    shareTitle: app.globalData.appName + ' بارلىق تۈرلەر',
    categoriesList: [],
    cateSubList: [],
    activeIndex: 0,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    subscribemessagesid:"",
    categorySubscribeCount:0,
    pageName:"cate",
    isLoginPopup: false,  
    system: '',
    banner: {}
  },

  onLoad: function () {
    // 设置页面标题
    wx.setNavigationBarTitle({ title: 'تۈرلەر' })
    var self = this
    Auth.checkSession(app, API, self, 'isLoginLater', util)
    var args = {}
    args.pageCount = pageCount
    args.isTree = true
    args.cateType = 'topic'
    args.userId = self.data.userSession.userId
    args.sessionId = self.data.userSession.sessionId
    Adapter.loadCategories(args, self, API, false)

    wx.getSystemInfo({
      success: function (t) {
        let system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'
        self.setData({
          system,
          platform: t.platform
        })
      }
    })

    Auth.checkLogin(self)

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline']
    })

    this.getCustomBanner()
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {  
    return {
      title: this.data.shareTitle    
    }
  },

  // 页面分享
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/cate/cate'
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self= this;
    Auth.checkLogin(self)
    self.setData({
      categoriesList: []
    })
    var args = {};
    args.pageCount = pageCount;
    args.isTree = true;
    args.cateType='topic';
    args.userId=self.data.userSession.userId
    args.sessionId=self.data.userSession.sessionId
    Adapter.loadCategories(args, self, API, false)
  },

  // 获取自定义banner
  getCustomBanner() {
    const http = API.getConfig()

    http.then(res => {
      const data = res.settings
      let banner = data.expand.cat_list_nav

      this.setData({
        banner
      })
    })
  },

  // 跳转
  toDetail(e) {
    let { type, appid, url, path } = e.currentTarget.dataset

    if (type === 'apppage') { // 小程序页面         
      wx.navigateTo({
        url: path
      })
    }
    if (type === 'webpage') { // web-view页面
      url = '../webview/webview?url=' + url
      wx.navigateTo({
        url
      })
    }
    if (type === 'miniapp') { // 其他小程序
      wx.navigateToMiniProgram({
        appId: appid,
        path
      })
    }
  },

  // 左边分类菜单切换
  switchCate(e) {
    let index = e.currentTarget.dataset.index;
    let cateChildren = this.data.categoriesList[index];
    // 判断如果只有一级分类，右侧就直接显示出一级分类信息
    if (cateChildren.children.length === 0) {
      cateChildren = [cateChildren]
    } else {
      cateChildren = this.data.categoriesList[index].children
    };
    this.setData({
      activeIndex: index,
      cateSubList: cateChildren
    })
  },

  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.item;
    let url = '../list/list?categoryIds=' + id;
    wx.navigateTo({
      url: url
    });
  },

  postsub(e) {
    let self = this
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util)
      return
    } else {
      let extid = e.currentTarget.dataset.id
      let subscribetype = 'categorySubscribe'
      let subscribemessagesid = e.currentTarget.dataset.subid
      Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid, util)
    }  
  },
  
  agreeGetUser: function (e) {
    Auth.checkAgreeGetUser(e, app, this, API, '0')
  },

  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    })
  },

  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    })
  },
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }
}

Page(options)
