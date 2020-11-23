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
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10


Page({
  data: {
    title: '文章列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName: '',
    categoriesImage: "",
    showerror: "none",
    isCategoryPage: "none",
    isSearchPage: "none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey: "",
    isShow: false
  },

  onLoad: function(options) {
    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage','shareTimeline']
    })
  },

  // 自定义分享朋友圈
  onShareTimeline:function() { 
    return {
      title: appName + '-随机文章'
    }
  },

  // 分享
  onShareAppMessage: function() {
    var title = appName + '的随机文章'
    var path = "pages/rand/rand"
    return {
      title,
      path
    }
  },

  onShow: function() {
    wx.setStorageSync('openLinkCount', 0)
  },

  onReady: function() {
    this.fetchPostsData();
  },

  onPullDownRefresh: function() {
    this.fetchPostsData()
  },

  onHide: function() {
    this.data.isShow = false
  },

  //获取文章列表数据
  fetchPostsData() {
    var self = this;
    self.setData({
      articlesList: []
    });
    API.getRandPosts().then(res => {
      self.setData({
        showallDisplay: "block",
        floatDisplay: "block",
        articlesList: self.data.articlesList.concat(res.map(function(item) {
          var strdate = item.date
          if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
            item.post_thumbnail_image = '../../images/uploads/default_image.jpg';
          }
          item.post_date = util.cutstr(strdate, 10, 1);
          return item;
        })),

      });
      wx.stopPullDownRefresh();
    })

  },

  // 刷新
  refresh() {
    this.fetchPostsData()
  },

  // 跳转
  redictDetail(e) {
    let url = '../detail/detail?id=' + e.currentTarget.id
    wx.navigateTo({
      url
    })
  }
})