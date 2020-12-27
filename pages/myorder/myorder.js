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
const pageCount = 10

const options = {
  data: {
    shareTitle: 'ئالغانلىرىم',
    pageTitle: appName + 'ئالغانلىرىم',
    orders: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {}
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.dataset.extid;
    var ordertype =e.currentTarget.dataset.ordertype;
    var  url = '../detail/detail?id=' + id;  
    if(ordertype=="catsubscribe" || ordertype=="catsubscribeIntegral" )
    {
      url = '../list/list?categoryIds=' + id; 
    }   
     wx.navigateTo({
       url: url
     })
 },

  onLoad: function (option) {
    let self = this;
    Auth.setUserMemberInfoData(self);
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    API.getMyOrders(data).then(res => {
      if (!res.code) {
        self.setData({
          orders: self.data.orders.concat(res.map(function (item) {

            // 格式化订单类型文字
            if (item.ordertype == 'postpraise') {
              item.ordertypename = "تارتۇقلاش"
            } else if (item.ordertype == 'postsubscribe') {
              item.ordertypename = "ھەقلىق ماقالە"
            } else if (item.ordertype == 'catsubscribe') {
              item.ordertypename = "ھەقلىق توپلام"
            } else if (item.ordertype == 'catsubscribeIntegral') {
              item.ordertypename = "جۇغلانمىلىق توپلام"
            } else if (item.ordertype == 'postpayment') {
              item.ordertypename = "ھەقلىق ماقالە"
            } else if (item.ordertype == 'postIntegral') {
              item.ordertypename = "جۇغلانمىلىق ماقالە"
            }

            return item;
          }))
        })
      }
      else {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 2000
        });
      }
    });
  },
  onPullDownRefresh: function () {
  }
}
//-------------------------------------------------
Page(options)

