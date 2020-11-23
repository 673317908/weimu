/*
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
const util = require('../../utils/util.js')
const WxParse = require('../../vendor/wxParse/wxParse.js')
const Adapter = require('../../utils/adapter.js')
const auth = require('../../utils/auth.js')
import config from '../../utils/config.js'
const app = getApp();
const appName = app.globalData.appName

Page({
  data: {
    title: '关于',
    pageData: {},
    pagesList: {},
    display: 'none',
    wxParseData: [],
    praiseList: [],
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    downloadFileDomain: app.globalData.downloadDomain,
    businessDomain: app.globalData.businessDomain
  },

  onLoad: function(options) {
    var args = {};
    var self = this;
    args.postType = 'about';
    Adapter.loadPagesDetail(args, self, API, WxParse);

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })   
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: '关于“' + appName + '”官方小程序',
      path: 'pages/about/about'
    }
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {  
    return {
      title: '关于“' + appName + '”小程序'     
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    var self = this
    self.setData({
      display: 'none',
      pageData: {},
      wxParseData: {}
    })

    //消除下刷新出现空白矩形的问题。
    args = {}
    args.postType = 'about'
    args.pageCount = pageCount
    Adapter.loadPagesDetail(args, self, API)
    wx.stopPullDownRefresh()
  },

  // 拨打电话
  phoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.pageDetail.raw_tel
    })
  },

  // 打开地图
  openMap() {
    var self = this
    wx.getLocation({
      type: 'gcj02',
      success(res) {
        const latitude = parseFloat(self.data.pageDetail.raw_latitude)
        const longitude = parseFloat(self.data.pageDetail.raw_longitude)
        wx.openLocation({
          latitude,
          longitude,
          scale: 17
        })
      }
    })
  },

  // a标签跳转和复制链接
  wxParseTagATap(e) {
    let self = this
    let href = e.currentTarget.dataset.src
    let domain = config.getDomain
    let appid = e.currentTarget.dataset.appid
    let redirectype = e.currentTarget.dataset.redirectype
    let path = e.currentTarget.dataset.path

    // 判断a标签src里是不是插入的文档链接
    let isDoc = /\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/.test(href)

    if (isDoc) {
      this.openLinkDoc(e)
      return
    }

    if(redirectype) {
      if (redirectype == 'apppage') { //跳转到小程序内部页面         
        wx.navigateTo({
          url: path
        })
      } else if (redirectype == 'webpage') //跳转到web-view内嵌的页面
      {
        href = '../webview/webview?url=' + href;
        wx.navigateTo({
          url: href
        })
      }
      else if (redirectype == 'miniapp') //跳转其他小程序
       {
        wx.navigateToMiniProgram({
          appId: appid,
          path: path
        })
      }
      return;
    }

    var enterpriseMinapp = self.data.pageDetail.enterpriseMinapp;
   
    // 可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {

      var n=0;
      for (var i = 0; i < self.data.businessDomain.length; i++) {
  
        if (href.indexOf(self.data.businessDomain[i].domain) != -1) {
          n++;
          break;
        }
      }

      if(n>0)
      {
        var url = ''
        if (enterpriseMinapp == "1") {
          url = '../webview/webview';
          wx.navigateTo({
            url: url + '?url=' + href
          })
        }
        else {
          self.copyLink(href);
        }
      }
      else
      {
        self.copyLink(href);

      }
      
    } else {
      var slug = util.GetUrlFileName(href, domain)
      if(slug=="")
      {
          
          if (enterpriseMinapp == "1") {
            url = '../webview/webview';
            wx.navigateTo({
              url: url + '?url=' + href
            })
          }
          else {
            self.copyLink(href);
          }
        return;

      }
      if (slug == 'index') {
        wx.switchTab({
          url: '../index/index'
        })
      } else {
        API.getPostBySlug(slug).then(res => {
          if (res.length && res.length > 0) {
            var postId = res[0].id
            var openLinkCount = wx.getStorageSync('openLinkCount') || 0
            if (openLinkCount > 4) {
              wx.redirectTo({
                url: '../detail/detail?id=' + postId
              })
            } else {
              wx.navigateTo({
                url: '../detail/detail?id=' + postId
              })
              openLinkCount++
              wx.setStorageSync('openLinkCount', openLinkCount)
            }
          } else {
            var minAppType = config.getMinAppType
            var url = '../webview/webview'
            if (minAppType == "0") {
              url = '../webview/webview'
              wx.navigateTo({
                url: url + '?url=' + href
              })
            } else {
              Adapter.copyLink(href, "链接已复制")
            }
          }
        })
      }
    }
  },

  // 打开文档
  openLinkDoc(e) {
    let self = this
    let url
    let fileType

    // 如果是a标签href中插入的文档
    let src = e.currentTarget.dataset.src
    var n=0;
    for (var i = 0; i < self.data.downloadFileDomain.length; i++) {

      if (src.indexOf(self.data.downloadFileDomain[i].domain) != -1) {
        n++;
        break;
      }
    }

    if(n==0)
    {
      self.copyLink(src);
      return;
    }

    let docType
    let isDoc = /\.(doc|docx|xls|xlsx|ppt|pptx|pdf)$/.test(src)

    if (src && isDoc){
      url = src
      fileType = /doc|docx|xls|xlsx|ppt|pptx|pdf$/.exec(src)[0]
    } else {
      url = e.currentTarget.dataset.filelink
      fileType = e.currentTarget.dataset.filetype
    }

    wx.downloadFile({
      url: url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          fieldType: fileType
        })
      }
    })
  },

})