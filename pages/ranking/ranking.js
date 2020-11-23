/*
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require("../../utils/api.js");
const Auth = require("../../utils/auth.js");
const Adapter = require("../../utils/adapter.js");
const util = require("../../utils/util.js");
const NC = require("../../utils/notificationcenter.js");
import config from "../../utils/config.js";
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10

const options = {
  data: {
    shareTitle: "排行",
    pageTitle: "排行",
    ranking: [],
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    page: 1,
    pageCount: 10,
    isLastPage: false,
    rankingType: ""
  },

  onLoad: function(option) {
    let self = this;
    var rankingType = option.rankingType ? option.rankingType : "integral";
    self.setData({
      rankingType: rankingType
    });
    Auth.setUserMemberInfoData(self);
    if (rankingType == "integral") {
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: "积分排行"
      });
      self.setData({ shareTitle: "积分排行" });
      API.integralRanking().then(res => {
        self.setData({
          ranking: self.data.ranking.concat(
            res.map(function(item) {
              return item;
            })
          )
        });
      });
    }

    if (rankingType == "follow") {
      wx.setNavigationBarTitle({
        title: "粉丝排行"
      });
      self.setData({ shareTitle: "粉丝排行" });
      API.followRanking().then(res => {
        self.setData({
          ranking: self.data.ranking.concat(
            res.map(function(item) {
              return item;
            })
          )
        });
      });
    }

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    return {
      title: appName + '-' + this.data.shareTitle,
      query: {
        rankingType: this.data.rankingType
      }
    }
  },

  onShareAppMessage: function() {
    return {
      title: appName + '-' + this.data.shareTitle,
      query: {
        rankingType: this.data.rankingType
      },
      path: '/pages/ranking/ranking'
    }
  }
}

Page(options)
