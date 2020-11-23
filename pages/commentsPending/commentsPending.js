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
import config from '../../utils/config.js'
var pageCount = 10
const app = getApp()
const appName = app.globalData.appName

Page({
    data: {
        title: '最新评论列表',
        showerror: "none",
        showallDisplay: "block",
        readLogs: [],
        commentsList:[],
        userInfo: {},
        userSession: {},
        wxLoginInfo: {},
        memberUserInfo: {},
        isLoading:false

    },

    onShareAppMessage: function () {
      var title = appName + "的最新评论";
      var path = "pages/comments/comments";
      return {
        title,
        path
      }
    },
    
    onLoad: function (options) {
        var self = this;
        var posttype=options.posttype;
        self.setData({posttype:posttype});
        Auth.setUserMemberInfoData(self);
        Auth.checkLogin(self);
        self.fetchCommentsData(posttype);
    },
    //获取文章列表数据
    fetchCommentsData: function (posttype) {
        var self = this;
        self.setData({
            commentsList: []
        });        
        var data={};
        var userId=self.data.userSession.userId;
        var sessionId =self.data.userSession.sessionId;
        if(!sessionId || !userId)
        {
            Adapter.toast('请先授权登录',3000);
            return;
        }
        data.userid=userId;
        data.sessionid=sessionId;
        data.posttype=posttype;
        wx.setNavigationBarTitle({ title: '待审核的评论或回复' });
        Adapter.loadCommentsPending(data,self,API,posttype);
    },
    // 跳转至查看文章详情
    redictDetail: function (e) {
        var id = e.currentTarget.dataset.postid;
        var url = '../detail/detail?id=' + id;
        wx.navigateTo({
            url: url
        })
    },
    approveComment:function(e)
    {
        var id = e.currentTarget.dataset.id;
        var self= this;   
        var data={};
        var userId=self.data.userSession.userId;
        var sessionId =self.data.userSession.sessionId;

        var postid=e.currentTarget.dataset.postid;
        var author=e.currentTarget.dataset.author;
        var title=e.currentTarget.dataset.title;
        if(!sessionId || !userId)
        {
            Adapter.toast('请先授权登录',3000);
            return;
        }
        data.id=id;
        data.userid=userId;
        data.sessionid=sessionId;
        var posttype = e.currentTarget.dataset.posttype;
        

        if(posttype=="post")
        {
            API.approveCommentById(data).then(res => {
                if(res.code=='error')
                {
                        wx.showToast({
                        title: res.message,
                        mask: false,
                        icon: "none",
                        duration: 3000
                    });                 
                }
                else{
                    var posttype=self.data.posttype;
                    self.fetchCommentsData(posttype);
                    wx.showToast({
                    title: res.message,
                    mask: false,
                    icon: "none",
                    duration: 2000,
                    success:function(){
                         
                        }

                    
                    });  
                }
        
            })

        }
        else{
            API.approveReplyById(data).then(res => {
                if(res.code=='error')
                {
                        wx.showToast({
                        title: res.message,
                        mask: false,
                        icon: "none",
                        duration: 3000
                    });                 
                }
                else{
                    var posttype=self.data.posttype;
                    self.fetchCommentsData(posttype);
                    wx.showToast({
                    title: res.message,
                    mask: false,
                    icon: "none",
                    duration: 2000,
                    success:function()
                    {                       
                        
                    }
                    });  
                }
        
            })

        }
        

    },
    deleteComment:function(e){

        var self= this; 
        var id = e.currentTarget.dataset.id;         
        var data={};
        var userId=self.data.userSession.userId;
        var sessionId =self.data.userSession.sessionId;
        var posttype = self.data.posttype;
        var topicId=e.currentTarget.dataset.postid;
        if(!sessionId || !userId)
        {
            Adapter.toast('请先授权登录',3000);
            return;
        }
        data.id=id;
        data.userid=userId;
        data.sessionid=sessionId; 
        data.deletetype='approveStatus';
        wx.lin.showDialog({
            type:"confirm",     
            title:"标题",
            showTitle:false,
            confirmText:"确认" ,
            confirmColor:"#f60" ,
            content:"确认删除？",          
            success: (res) => {
              if (res.confirm) {

               
                if(posttype=="post")
                {

                    API.deleteCommentById(data).then(res => {
                        if(res.code=='error')
                        {
                                wx.showToast({
                                title: res.message,
                                mask: false,
                                icon: "none",
                                duration: 3000
                            });                 
                        }
                        else{
                            var posttype=self.data.posttype;
                            self.fetchCommentsData(posttype);
                            wx.showToast({
                            title: res.message,
                            mask: false,
                            icon: "none",
                            duration: 3000
                            });  
                        }
                
                        }) 

                }
                else if(posttype=="topic")
                {

                    
                    data.topicId=topicId;
                    API.deleteReplyById(data).then(res => {
                        if(res.code=='error')
                        {
                                wx.showToast({
                                title: res.message,
                                mask: false,
                                icon: "none",
                                duration: 3000
                            });                 
                        }
                        else{
                          
                            self.fetchCommentsData(posttype);
                            wx.showToast({
                            title: res.message,
                            mask: false,
                            icon: "none",
                            duration: 3000
                            });  
                        }
                
                        }) 

                }

                                       
                
              } else if (res.cancel) {               
                  
              }
            }
          })       

    },
    onPullDownRefresh: function () {
        var self = this;
        this.setData({
            commentsList: []
        });
        self.setData({
            showallDisplay: "none",
            showerror: "none",

        });
        self.fetchCommentsData();
        //消除下刷新出现空白矩形的问题。
        wx.stopPullDownRefresh();

    }
})



