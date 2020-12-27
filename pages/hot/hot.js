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
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10


Page({
  data: {
    title: 'ئاۋات ماقالىلەر',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName:'',
    categoriesImage:"",
    showerror:"none",
    isCategoryPage:"none",
    isSearchPage:"none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey:"",
    topBarItems: [
        // id name selected 选中状态
        { id: '1', name: 'كۆرۈلىشى', selected: true ,'type':'pageviewsthisyear' },        
        { id: '2', name: 'ياقتۇرلىشى', selected: false,'type':'likethisyear'  },
        { id: '3', name: 'ئىنكاس', selected: false,'type':'hotpostthisyear' },
    ],
    tab: '1',
  },

  onShareAppMessage: function () {
    var title =  appName + " ئاۋات ماقالىلەر";
    var path = "pages/hot/hot";
    return {
      title,
      path
    }
  },

  onShow: function () {    
    wx.setStorageSync('openLinkCount', 0);
  },

  onReady:function(){
   this.fetchPostsData("pageviewsthisyear");
  },

  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var tabtype=e.currentTarget.dataset.type;

    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
        topBarItems: topBarItems, 
        tab: tab,
        tabtype:tabtype

    })
    if (tab !== 0) {
      this.fetchPostsData(tabtype);
    } else {
      this.fetchPostsData("pageviewsthisyear");
    }
  },
  
  onLoad: function (options) {
    var self = this;
    wx.setNavigationBarTitle({
      title: 'ئاۋات ماقالىلەر'
    })

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus:['shareAppMessage', 'shareTimeline']
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() { 
    return {
      title: appName + ' ئاۋات ماقالىلەر'
    }
  },

  //获取文章列表数据
  fetchPostsData(tabtype) {
    var self = this;  
    self.setData({
        articlesList: []
    });
     API.getTopHotPosts(tabtype).then(res =>{
        self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                articlesList: self.data.articlesList.concat(res.map(function (item) {
                    var strdate = item.date
                    if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                      item.post_thumbnail_image = '../../images/uploads/default_image.jpg';
                    }
                    item.post_date = util.cutstr(strdate, 10, 1);
                    // 去掉摘要里的换行和空格
                    item.excerpt.rendered = item.excerpt.rendered.replace(/[\r\n]/g, "").replace(/\ +/g,"");
                    return item;
                })),

            });
    })
    
  }, 

  // 跳转至查看文章详情
  redictDetail(e) {
    let url = '../detail/detail?id=' + e.currentTarget.id
    wx.navigateTo({
      url
    })
  }

})



