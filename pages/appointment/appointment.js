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

const options = {
  data: {
    shareTitle: appName + '-预约留言',
    pageTitle: '预约留言',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isLoginPopup: false,
    pubDisabled: false,
    fields:[]
    
  },

  //点击发布触发
  publishArticle:function (e) {
    var that = this;    
    var userId=that.data.userSession.userId;
    var sessionId =that.data.userSession.sessionId;

     if (!that.data.userSession.sessionId) {

        that.setData({ isLoginPopup: true });
        return;
            
    }
    

    var fields = this.data.fields;
    var content  =e.detail.value.content; 
    var _detail=e.detail.value;

    var  _formFields = {};

    Object.keys(_detail).forEach(function(key){
     if(key =='content')
     {
        delete _detail[key];
       
     }
    });

    var formFields=JSON.stringify(_detail);
    
    var title ="留言";  
    
    var data={
        content:content,
        title:title,
        category:'message',
        userid:userId,        
        sessionid:sessionId,
        
        formFields:formFields
      };

      wx.showModal({
        title: '留言',
        content: '是否提交留言？',
        showCancel: true,
        cancelColor: '#296fd0',
        confirmColor: '#296fd0',
        confirmText: '提交',
        success: function (res) {
            if (res.confirm) {
              that.setData({pubDisabled: true});
              API.publishForm(data).then(res => {
                 if (res.success) {
                  wx.showToast({
                    title: res.message,
                    icon: "none",          
                    duration: 2000,
                    success:function()
                    {
                      setTimeout(function () {
                          wx.navigateBack({
                              delta: 1
                            })
                      }, 3000);
                                     
                    }
                  })}
                  else
                  {
                    wx.showToast({
                            title: res.message,
                            icon: "none",
                            duration: 1e3,
                            success: function () {

                            }
                        })
                  }
              })
                
            }
        }
    })



  },    

  onLoad: function (option) {
    var self = this;
    Auth.checkSession(app, API, self, 'isLoginNow', util);
    // Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    var args ={};
    args.category='message';
    args.displayType='form'
    Adapter.getFormField(args,self,API);
  },
  onShow: function () {
    let self = this;
    Auth.setUserMemberInfoData(self);
    wx.setStorageSync('openLinkCount', 0);
  },
  onReady: function () {
    var self = this;
    wx.setNavigationBarTitle({ title: this.data.pageTitle });
    
  },
  onPullDownRefresh: function () {

    this.setData({isPull: true});

    if (this.data.userSession.sessionId) {
      Auth.checkGetMemberUserInfo(this.data.userSession, this, API)
    }

  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  redictSetting: function () {
    wx.navigateTo({ url: '../settings/settings' })
  },
  redictPage: function (e) {
    var mytype = e.currentTarget.dataset.mytype;
    if(mytype =="logout")
    {
       Auth.logout(this);
        wx.reLaunch({
          url: '../index/index'
        })
    }
    else if (mytype == "about") {
      var url = '../webview/webview?url=https://' + config.getDomain + '/about';
        wx.navigateTo({
          url: url
        })
      } 
    else{
        if (!this.data.userSession.sessionId) {
          this.setData({ isLoginPopup: true });
        }
        else {      
          if (mytype == "myorders") {
              wx.navigateTo({ url: '../myorder/myorder' });
          } 
          else if(mytype == "mysignin")
          {
            var data={};
             data.userId=this.data.userSession.userId;
             data.sessionId=this.data.userSession.sessionId;
            API.signin(data).then(res=>{
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 2000
              });
            })
          }          
          else {
            wx.navigateTo({ url: '../readlog/readlog?mytype=' + mytype });
          }

        }
    }
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/myself/myself',
      //imageUrl: this.data.detail.content_first_image,
    }
  },
}

Page(options)

