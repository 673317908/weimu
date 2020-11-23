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

var app = getApp();
Page({
  data: {    
    praiseMoney: [
      6, 8, 18, 66, 88,188
    ],   
    postId:'',
    total_fee:'',
    userInfo:{},
    userSession:{},
    wxLoginInfo:{},
    memberUserInfo:{}
  },

  /**
   * 进入页面
   */
  onLoad: function (options) { 

    var self=this;    
    var postId = options.postid;
    var toUserId =options.touserid;
    var posttype=options.posttype;
    Auth.setUserMemberInfoData(self);
    
    API.getSettings().then(res=>{

      var settingsPraisemoney = res.settings.praisemoney;
      let appDes = res.settings.websitedec
      let appLogo = res.settings.appLogo
      var praiseMoney = settingsPraisemoney.split(",");
      if(praiseMoney.length>0)
      {
        //self.setData({praiseMoney:praiseMoney})
      }
      else
      {
        praiseMoney= [6, 8, 18, 66, 88,188];
        // self.setData({praiseMoney:praiseMoney});

      }
       

        self.setData({     
          postId: postId,
          toUserId:toUserId,
          posttype:posttype ,
          appDes:appDes,
          appLogo:appLogo,
          praiseMoney:praiseMoney
    
        });

    })

    
    

  },
  cancel:function()
  {
    wx.navigateBack({
      delta: 1
    })
  },

  // // 动态设置页面信息
  // setPageInfo() {
  //   let app = getApp()
  //   let appDes = app.globalData.appDes
  //   let appLogo=app.globalData.appLogo
    

  //   this.setData({
  //     appDes,
  //     appLogo
  //   })
  // },

  /**
   * 选中鼓励金额
   */
  selectItem: function (event) {
    var totalfee = event.currentTarget.dataset.item;    
    var self = this;    
    
    self.setData({     
      totalfee: totalfee   
        });

    Adapter.postPayment(self,app,API);

    
  }
})
