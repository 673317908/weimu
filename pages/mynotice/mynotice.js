const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')

import config from '../../utils/config.js'
const app = getApp()
const pageCount = 10


Page({
  // 初始数据
  data: {
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    
    messagetype: "",
    messages: [],

    page: { // 分页
      index: 1,
      size: 8
    },
    showDeleteDialog: false,
    curDeleteParams: {}
  },

  // 页面加载
  onLoad: function(options) {
    let type = options.messagetype

    // 页面标题
    this.setPageTitle(type)

    Auth.checkSession(app, API, this, 'isLoginNow', util)
    Auth.checkLogin(this)
    this.setData({
      messagetype: type
    })
    this.getListData()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    let page = this.data.page
    page.index = 1

    this.setData({
      messages: [],
      page
    })

    this.getListData()
  },

  // 上拉加载
  onReachBottom: function() {
    this.data.page.index++
    this.getListData()
  },

  // 获取数据
  getListData(index = this.data.page.index) {
    let d = this.data

    if (d.userSession.sessionId) {
      let args = {
        userId: d.userSession.userId,
        sessionId: d.userSession.sessionId,
        messagetype: d.messagetype,      
        per_page: this.data.page.size,
        page: index
      }

      API.getMyMessages(args).then(res => {
        let list = this.data.messages

        if (res.messages.length) {
          list.push(...res.messages);

          this.setData({
            messages: list
          })

        }

        

        wx.stopPullDownRefresh()
      })
    }
  },

  // 设置页面标题
  setPageTitle(type) {
    let title = ''

    if (type === 'system') {
      title = 'سىستىما ئۇچۇرى'
    } else if (type === 'comment') {
      title = 'ئىنكاس ئۇچۇرى'
    } else if (type === 'like') {
      title = 'ياقۇترغانلىق ئۇچۇرى'
    } else if (type === 'follow') {
      title = 'ئەگەشكەنلىك ئۇچۇرى'
    }

    wx.setNavigationBarTitle({
      title: title
    })
  },

  // 跳转详情
  redictDetail(e) {
    var messagetype = e.currentTarget.dataset.messagetype
    var posttype = e.currentTarget.dataset.posttype
    var objectid = e.currentTarget.dataset.objectid
    var fromid = e.currentTarget.dataset.fromid
    var url = ""

    if (messagetype == "follow") {
      url = "../author/author?userid=" + fromid + "&postype=post"
    } else {
      if (posttype == "post") {
        url = '../detail/detail?id=' + objectid
      } else if (posttype == "topic") {
        url = '../socialdetail/socialdetail?id=' + objectid
      }
    }

    wx.navigateTo({
      url: url
    })
  },

  // 左滑删除
  slideButtonTap(e) {
    let id = e.currentTarget.dataset.id
    this.deleteMessage(id)
  },

  // 删除消息
  deleteMessage(id) {
    let self = this

    let userId = self.data.userSession.userId
    let sessionId = self.data.userSession.sessionId

    if (!sessionId || !userId) {
      Adapter.toast('تىزىملىتىپ كىرىڭ', 3000)
      return
    }

    let data = {
      id: id,
      userid: userId,
      sessionid: sessionId
    }

    this.setData({
      showDeleteDialog: true,
      curDeleteParams: data
    })
  },

  // 确认删除
  tapDialogButton(e) {
    // 确认
    if (e.detail.index === 1) {
      API.deleteMessageById(this.data.curDeleteParams).then(res => {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 3000
        })

        // 刷新列表
        this.setData({
          messages: []
        })
        this.getListData(1)
      })
    }

    this.setData({
      showDeleteDialog: false
    })
  }
})