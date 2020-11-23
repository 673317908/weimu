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
  /**
   * 页面的初始数据
   */
  data: {
    authorList:[],  
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    shareTitle: appName + '-作者列表',
    pageTitle: '作者列表',
    authorType:'myFollow',
    myFollowPage:1,
    followmePage:1,
    isLastPage:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this;
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    var authorType=options.authorType;    
    self.setData({authorType:authorType});
    if(authorType=='myFollow')
    {
      self.getMyFollowAuthors();
      wx.setNavigationBarTitle({
        title: "我的关注"
      });
    }
    else if(authorType =='followme'){
      self.getFollowmeAuthors();
      wx.setNavigationBarTitle({
        title: "我的粉丝"
      });
    }
  },

  redictAuthorDetail:function(e)
  {
    var authorId = e.currentTarget.id;
    var url = '../author/author?userid=' + authorId+'&postype=topic';
    wx.navigateTo({
      url: url
    })
  },

  followAuthor: function (e) {
    var self = this;

    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var flag =e.currentTarget.dataset.follow=="true"?true:false;
    var authorid =parseInt(e.currentTarget.dataset.authorid)
    var  listType="authorList"
    if (!sessionId || !userId) {
      self.setData({ isLoginPopup: true });
      return;
    }

    var args = {};
    args.userId = userId;
    args.sessionId = sessionId;
    args.id = authorid
    args.flag = flag;
    args.listType=listType;
    Adapter.userFollow(API, self, args)

  },

  getMyFollowAuthors:function()
  {
     var self= this;
     var data={};
     var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
     data.sessionId=sessionId;
     data.userId=userId;
     data.per_page = pageCount;
     data.page = self.data.myFollowPage;
     API.getMyFollowAuthor(data).then(res=>{
          if(res.myFollowAuthors.length<pageCount)
          {
            self.setData({isLastPage:true})

          }
          var authorList= [].concat(self.data.authorList, res.myFollowAuthors);         
          self.setData({authorList:authorList})
      })
  },

  getFollowmeAuthors:function()
  {
     var self= this;
     var data={};
     var sessionId = self.data.userSession.sessionId;
      var userId = self.data.userSession.userId;
      data.sessionId=sessionId;
      data.userId=userId;
      data.per_page = pageCount;
      data.page = self.data.followmePage;
      API.getFollowmeAuthors(data).then(res=>{
        if(res.followmeAuthors.length<pageCount)
          {
            self.setData({isLastPage:true})

          }          
          var authorList= [].concat(self.data.authorList, res.followmeAuthors); 
          self.setData({authorList:authorList})
        })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var self=this;
    var isLastPage=self.data.isLastPage;
    var authorType=self.data.authorType;    
    if(authorType =='myFollow' && !isLastPage)
    {
      var myFollowPage= self.data.myFollowPage+1;
      self.setData({myFollowPage:myFollowPage})
      self.getMyFollowAuthors();
      
    }
    else if(authorType =='followme'  && !isLastPage){
      var followmePage= self.data.followmePage+1;
      self.setData({followmePage:followmePage})
      self.getFollowmeAuthors()
    }
  }
})