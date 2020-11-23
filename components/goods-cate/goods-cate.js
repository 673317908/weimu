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

Component({
  properties: {
    listData: Array
  },

  data: {
    // cateList: [],
    // cateSubList: [],
    activeIndex: 0
  },

  // onLoad: function () {
  //   // 设置页面标题
  //   wx.setNavigationBarTitle({ title: '分类' })
  //   var self = this
  //   Auth.checkSession(app, API, self, 'isLoginLater', util)
  //   var args = {}
  //   args.pageCount = pageCount
  //   args.isTree = true
  //   args.cateType = 'topic'
  //   args.userId = self.data.userSession.userId
  //   args.sessionId = self.data.userSession.sessionId
  //   Adapter.loadCategories(args, self, API, false)

  //   wx.getSystemInfo({
  //     success: function (t) {
  //       let system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'
  //       self.setData({
  //         system,
  //         platform: t.platform
  //       })
  //     }
  //   })

  //   Auth.checkLogin(self)

  //   // 设置系统分享菜单
  //   wx.showShareMenu({
  //           withShareTicket: true,
  //           menus: ['shareAppMessage', 'shareTimeline']
  //   })

  //   this.getCustomBanner()
  // },

  // // 自定义分享朋友圈
  // onShareTimeline: function () {
  //   return {
  //     title: this.data.shareTitle
  //   }
  // },

  // // 页面分享
  // onShareAppMessage: function () {
  //   return {
  //     title: this.data.shareTitle,
  //     path: '/pages/cate/cate'
  //   }
  // },

  // // 下拉刷新
  // onPullDownRefresh: function () {
  //   var self = this;
  //   self.setData({
  //     categoriesList: []
  //   })
  //   var args = {};
  //   args.pageCount = pageCount;
  //   args.isTree = true;
  //   args.cateType = 'topic';
  //   args.userId = self.data.userSession.userId
  //   args.sessionId = self.data.userSession.sessionId
  //   Adapter.loadCategories(args, self, API, false)
  // },

  methods: {
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
    changeCate(e) {
      let activeIndex = e.currentTarget.dataset.index
      this.setData({
        activeIndex
      })
    },

    //跳转
    gotoProductList(e) {
      let id = e.currentTarget.dataset.id;
      let catename=e.currentTarget.dataset.catename;
      let url = '/pages/shop/goods-list/goods-list?id=' + id+'&catename='+catename;
      wx.navigateTo({
        url: url
      });
    }
  }
})
