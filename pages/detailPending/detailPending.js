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
var WxParse = require('../../vendor/wxParse/wxParse.js');

Page({
  data: {
    title: '内容',
    pageData: {},
    pagesList: {},
    hidden: false,
    wxParseData: [],
    userInfo: {},
    readLogs: [],
    userSession:{}
  },
  onLoad: function (options) {
    var self=this;   
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    self.fetchData(options);
   
  },
  fetchData: function (options) {   
        let args = {};
        let self =  this;
        args.id =options.id;
        args.postType = options.posttype;
        args.userId=self.data.userSession.userId;
        args.sessionId=self.data.userSession.sessionId;  
        Adapter.loadDetailPending(args, self, WxParse, API,util);
        
  }
})
