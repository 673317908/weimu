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
    userInfo: {},
    readLogs: [],
    userSession: {},
    articlesList: [],
    commentsReplays:[],
    navigationBarTitle: '', // 页面标题
    mytype: '',
    page: 1,
    isLoading:false,
    isLastPage:false,
    pageName:"readlog"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    self.setData({
      userInfo: wx.getStorageSync('userInfo'),
      userSession: wx.getStorageSync('userSession')
    });
    Auth.setUserMemberInfoData(self);
    var mytype = options.mytype;
    self.fetchPostsData(mytype);
    Auth.checkLogin(self);
    this.setData({
      mytype: mytype
    });
  },

  onReady: function() {
    var self = this;
    // 动态设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.navigationBarTitle
    })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var mytype=this.data.mytype;
    self.setData({
      page: 1,
      isLastPage: false
    })
    this.fetchPostsData(mytype);
   
  },

  // 跳转至查看文章详情
  redictDetail: function(e) {
    var id = e.currentTarget.id;
    var posttype = e.currentTarget.dataset.posttype ? e.currentTarget.dataset.posttype : "post";
    var url = "";
    if (posttype == "post") {
      url = '../detail/detail?id=' + id;
    } else if (posttype == "topic" || posttype == "reply" ) {
      url = '../socialdetail/socialdetail?id=' + id;
    }
    wx.navigateTo({
      url: url
    })
  },

  postsub: function (e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return;
      
    }
    else {
    var posttype = e.currentTarget.dataset.posttype
    var extid=e.currentTarget.id;
    var subscribetype = '';
    if(posttype=="post")
    {
      subscribetype="postReplaySubscribe"
    }
    else if(posttype=="reply"){
      subscribetype="topicReplaySubscribe"
    }
    var subscribemessagesid = e.currentTarget.dataset.subid;
    Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid,extid,util);
    }
      
  },

  onShareAppMessage: function() {
    var title = '分享小程序：' + appName + '，快来看看吧！'
    var path = 'pages/index/index'
    return {
      title: title,
      path: path
    }
  }, 

  // 上拉加载
  onReachBottom: function () {
    var self=this;
    var mytype=self.data.mytype;
    var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      data.limit=pageCount;
      var page =self.data.page + 1
      data.page=page;
      self.setData({page:page})
    if(mytype=="mycomments")
    {      
      self.getMycommentsReplays(data);

    }
    else if(mytype=="mylikes")
    {
      self.getMylikes(data);
      
    }
    else if(mytype=="mypraises")
    {
      self.getMyPraises(data)
    }       


  },

  fetchPostsData: function(mytype) {
    self = this;
    var count = 0;
    if (mytype == 'myreads') {
      self.setData({
        articlesList: (wx.getStorageSync('readLogs') || []).map(function(log) {
          count++;
          return log;
        }),
        navigationBarTitle: '我的浏览'
      });
      wx.stopPullDownRefresh()
      if (count == 0) {
        self.setData({
          shownodata: 'block',
          navigationBarTitle: '我的浏览'
        });
      }


    } else if (mytype == 'mycomments') {
      self.setData({
        articlesList: [],
        navigationBarTitle: '我的评论'
      });

      var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      data.limit=pageCount;
      data.page=self.data.page;
      self.getMycommentsReplays(data);

    } 
    else if (mytype == 'mylikes') {      

      self.setData({
        articlesList: [],
        navigationBarTitle: '我的点赞'
      });
      var data = {};
      
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      data.limit=pageCount;
      data.page=self.data.page;
      self.getMylikes(data);

    } else if (mytype == 'mypraises') {
      self.setData({
        articlesList: [],
        navigationBarTitle: '我的鼓励'
      });
      var data = {};      
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      data.limit=pageCount;
      data.page=self.data.page;
      self.getMyPraises(data);
    }


  },
  getMyPraises:function(data)
  {
    var self= this;
    self.setData({isLoading: true})
    var isLastPage = self.data.isLastPage;
    API.getMyPraises(data).then(res => {
      if (res.length < pageCount) {
        isLastPage=true;     
        
      }
      self.setData({
        articlesList: self.data.articlesList.concat(res.map(function(item) {
          //count++;
          item["id"] = item.id;
          item["date"] = item.date;
          var titleRendered = {
            "rendered": item.title.rendered
          };
          item["title"] = titleRendered;
          item["pageviews"] = item.pageviews;
          item["like_count"] = item.like_count;
          item["post_large_image"] = item.post_large_image;
          item["post_medium_image"] = item.post_medium_image;
          return item;
        })),
        isLoading:false,
        isLastPage:isLastPage

      })
    }).catch(err => {
      self.setData({
        isLoading: false         
      })
    
    })
    wx.stopPullDownRefresh();
  },
  getMylikes:function(data)
  {
    var self= this;
    var isLastPage = self.data.isLastPage; 

    self.setData({isLoading: true})
    API.getMyLikes(data).then(res => {
      if (res.length < pageCount) {
        isLastPage=true;
      }
      self.setData({
        articlesList: self.data.articlesList.concat(res.map(function(item) {
          //count++;
          item["id"] = item.id;
          item["date"] = item.date;
          var titleRendered = {
            "rendered": item.title.rendered
          };
          item["title"] = titleRendered;
          item["pageviews"] = item.pageviews;
          item["like_count"] = item.like_count;
          item["post_large_image"] = item.post_large_image;
          item["post_medium_image"] = item.post_medium_image;
          return item;
        })),
        isLoading:false,
        isLastPage:isLastPage
      })
    }).catch(err => {
      self.setData({
        isLoading: false         
      })
    
    })
    wx.stopPullDownRefresh()
  },
  getMycommentsReplays:function(data)
  {
   
      var self= this;
      var isLastPage = self.data.isLastPage;
      self.setData({isLoading: true})
      API.getMyCommentsReplays(data).then(res => {        
        if (res.comments.length < pageCount) {
          isLastPage=true;
        }
        var commentsReplays =[].concat(self.data.commentsReplays, res.comments);
        self.setData({commentsReplays:commentsReplays,isLastPage:isLastPage,isLoading:false});
      }).catch(err => {
        self.setData({
          isLoading: false         
        })
        wx.stopPullDownRefresh()
      })
  }
})