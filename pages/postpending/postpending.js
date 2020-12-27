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
const pageCount = 10

Page({

  data: {
    userInfo: {},
    readLogs: [],
    userSession:{},
    articlesList: [] 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    var self=this;
    var detailposttype="";
    var posttype= options.posttype; 

    if(posttype=="post")
    {
      detailposttype='postPending';
      wx.setNavigationBarTitle({ title: 'تەستىقلىنىۋاتقان ماقالە' });
    }
    else if(posttype="topic")
    {
      detailposttype='topicPending';
      wx.setNavigationBarTitle({ title: 'تەستىقلىنىۋاتقان قوناقلىق' });
    }

    self.setData({      
      detailposttype:detailposttype,
      posttype:posttype
  });
  Auth.setUserMemberInfoData(self);   
  self.fetchPostsData(posttype);
  Auth.checkLogin(self);

    
  },
  

  // 跳转至查看文章详情
  redictDetail: function (e) {    
    var id = e.currentTarget.id;
    var posttype = e.currentTarget.dataset.posttype?e.currentTarget.dataset.posttype:"postpending";    
    var url ="";
    url = '../detailPending/detailPending?id=' + id+'&posttype='+posttype;     
    wx.navigateTo({
      url: url
    })
  }, 
  
  
  fetchPostsData: function (posttype) {
    self = this;      
     var count =0;
       if (posttype == 'post')
       {
          self.setData({
              articlesList: []
          });
          var data={};
          data.userId=self.data.userSession.userId;
          data.sessionId =self.data.userSession.sessionId;              
          API.getPostPending(data).then(res => { 
          if(res.code)
          {
            
            return;

          }
          self.setData({
              articlesList: self.data.articlesList.concat(res.map(function (item) {
                      count++;
                      item["id"] = item.id;                      
                      item["date"] = item.date;
                      var titleRendered ={"rendered":item.title.rendered};
                      item["title"] = titleRendered;
                      item["pageviews"] = item.pageviews;
                      item["like_count"] = item.like_count;
                      item["post_large_image"] = item.post_large_image;
                      item["post_medium_image"] = item.post_medium_image;
                      return item;
                  }))
              })          
            });
      } 
      else if (posttype == 'topic') {
          self.setData({
            articlesList: []
          });
          var data={};
          data.userId=self.data.userSession.userId;
          data.sessionId =self.data.userSession.sessionId;              
          API.getTopicPending(data).then(res => {
            if(res.code)
            {              
              return;  
            }
          self.setData({
              // articlesList: self.data.articlesList.concat(res.map(function (item) {
              //         count++;
              //         item["id"] = item.id;                      
              //         item["date"] = item.date;
              //         var titleRendered ={"rendered":item.title};
              //         item["title"] = titleRendered;
              //         item["pageviews"] = item.pageviews;
              //         item["like_count"] = item.like_count;
              //         item["post_large_image"] = item.post_large_image;
              //         item["post_medium_image"] = item.post_medium_image;
              //         return item;
              //     }))
              articlesList:res
              })
            });
      }      
  },

  approvePost:function(e)
  {
    var self= this;
    var id = e.currentTarget.id;
    var data={};
    var userId=self.data.userSession.userId;
    var sessionId =self.data.userSession.sessionId;
    if(!sessionId || !userId)
    {
        Adapter.toast('تىزىملىتىپ كىرىڭ',3000);
        return;
    }
    data.id=id;
    data.userid=userId;
    data.sessionid=sessionId;
    var posttype= self.data.posttype;
    if(posttype=="post")
    {
        API.approvePostById(data).then(res => {
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
            
            self.fetchPostsData(posttype);
            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 3000
            });  
          }
    
        })
    }
    else
    {

      API.approveTopicById(data).then(res => {
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
          
          self.fetchPostsData(posttype);
          wx.showToast({
            title: res.message,
            mask: false,
            icon: "none",
            duration: 3000
          });  
        }
  
      })

    }
    
  },
  deletePost:function(e)
  {
    var self= this;
    var id = e.currentTarget.id;
    var data={};
    var userId=self.data.userSession.userId;
    var sessionId =self.data.userSession.sessionId;
    var deletetype='approveStatus';
    if(!sessionId || !userId)
    {
        Adapter.toast('تىزىملىتىپ كىرىڭ',3000);
        return;
    }
    data.id=id;
    data.userid=userId;
    data.sessionid=sessionId;
    data.deletetype=deletetype;
    var posttype= self.data.posttype;
    
    wx.lin.showDialog({
      type:"confirm",     
      title:"ماۋزۇ",
      showTitle:false,
      confirmText:"ماقۇل" ,
      confirmColor:"#f60" ,
      content:"ئۆچۈرەمسىز؟",          
      success: (res) => {
        if (res.confirm) {

          if(posttype=="post")
          {

            API.deletePostById(data).then(res => {
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
                
                self.fetchPostsData(posttype);
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

            API.deleteTopicById(data).then(res => {
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
                
                self.fetchPostsData(posttype);
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

   

  }
})