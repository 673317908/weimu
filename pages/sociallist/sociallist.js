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
const util = require('../../utils/util.js');
const Adapter = require('../../utils/adapter.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10
const backgroundAudioManager = wx.getBackgroundAudioManager()

Page({
  // 初始数据
  data: {
    isArticlesList: true,
    isSearch: false,
    isTag: false,
    tagname: '',
    isCategory: false,
    forumId: "",
    searchKey: "",
    topicsList: [],
    categoryImage: "",
    isLastPage: false,
    isPull: false,
    page: 1,
    shareTitle: '',
    pageTitle: '',
    tag: '',
    // listStyle: app.globalData.listStyle,
    category: [],
    categoryImage: "",
    showAddbtn: false,

    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    topicListAdsuccess: true,
    topiclistAdId: "",
    topiclistAd: "",
    topiclistAdEvery: 0,

    isPlaying: 0,
    dataId: 0,
    pageName: "sociallist",
    isPostSuccess: false,
    banner: {}
  },

  // 页面加载
  onLoad: function (options) {
    let args = {}
    var self = this
    backgroundAudioManager.onEnded(function () {
      self.setData({
        isPlaying: 0
      })
    })
    wx.showShareMenu({
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline']
    })
    Auth.checkSession(app, API, self, 'isLoginLater', util);
    Auth.checkLogin(self);

    
    args.page = this.data.page;
    args.pageCount = pageCount;
    if (options.searchKey && options.searchKey != '') {
      args.isSearch = true;
      args.isCategory = false;
      args.searchKey = options.searchKey;
      args.istag = false;
      this.setData({
        searchKey: options.searchKey,
        isSearch: true,
        isCategory: false,
        istag: false,
        pageTitle: "动态搜索",
        shareTitle: getApp().globalData.appName + "-动态搜索"
      });
    }
    if (options.forumId && options.forumId != '') {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.forumId = options.forumId;
      this.setData({
        isSearch: false,
        isCategory: true,
        isTag: false,
        forumId: options.forumId,
        pageTitle: "动态圈子",
        shareTitle: "动态圈子"
      });
    }

    if (options.tag && options.tag != '') {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = options.tag;
      this.setData({
        isSearch: false,
        isCategory: false,
        isTag: true,
        tag: options.tag,
        tagname: options.tagname,
        pageTitle: "#" + options.tagname,
        shareTitle: options.tagname + "标签的话题"
      });
      //this.loadArticles(args,);
    }
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    args.userId = userId;
    args.sessionId = sessionId;
    Adapter.loadBBTopics(args, this, API);
    this.getCustomBanner()
  },

  followAuthor: function (e) {
    var self = this;

    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var flag = e.currentTarget.dataset.follow;
    var authorid = e.currentTarget.dataset.authorid
    var listType = e.currentTarget.dataset.listtype;
    if (!sessionId || !userId) {
      self.setData({
        isLoginPopup: true
      });
      return;
    }

    var args = {};
    args.userId = userId;
    args.sessionId = sessionId;
    args.id = authorid
    args.flag = flag;
    args.listType = listType;
    Adapter.userFollow(API, self, args)

  },
  postLike: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    if (!self.data.userSession.sessionId) {

      self.setData({
        isLoginPopup: true
      });

    } else {
      Adapter.postLike(id, self, app, API, "topicList");

    }
  },

  deleteTopic: function (e) {
    var self = this;
    var id = e.currentTarget.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var deletetype = 'publishStatus';
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.deletetype = deletetype;
    var posttype = 'topic'
    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认删除？",
      success: (res) => {
        if (res.confirm) {
          API.deleteTopicById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            } else {

              self.setData({
                page: 1,
                isLastPage: false
              });

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
              self.onPullDownRefresh();
            }

          })

        } 
      }
    })
  },

  sendPost: function () { // 跳转
    var self = this
    if (!self.data.userSession.sessionId) {

      self.setData({
        isLoginPopup: true
      });

    } else {

      var publishTopicUserRight = self.data.publishTopicUserRight;
      var min_posttopic_user_memberName = self.data.min_posttopic_user_memberName;
      if (publishTopicUserRight == "0") {

        wx.lin.showDialog({
          type: "confirm",
          title: "标题",
          showTitle: false,
          confirmText: "确认",
          confirmColor: "#f60",
          content: "权限不足,需"+min_posttopic_user_memberName+"及以上等级方可发表回复。是否去赚积分提高等级?",
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../earnIntegral/earnIntegral'
              });
            }
  
            
          }
        })


       // Adapter.toast("权限不足,需" + min_posttopic_user_memberName + "及以上等级方可发表回复。", 5000)
        return;
      }


      var forumId = self.data.forumId == 0 ? self.data.default_forum_id : self.data.forumId;
      var raw_default_videoposter_image = self.data.raw_default_videoposter_image;
      //   this.setData({
      //     displayPostimage: true,
      //     displayInputContent: false

      //   })
      var url = '../../pages/postopic/postopic?forumid=' + forumId + '&videoposter=' + raw_default_videoposter_image;
      wx.navigateTo({
        url: url
      })
    }
  },

  openmap: function (e) {
    var self = this;
    var lat = Number(e.currentTarget.dataset.lat);
    var lng = Number(e.currentTarget.dataset.lng);
    var address = e.currentTarget.dataset.address;
    
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 10,
      name: address,
    })

  },

  onShow: function () {
    // this.setData({
    //   listStyle: wx.getStorageSync('listStyle')
    // });
    let self = this
    Auth.setUserMemberInfoData(self)
    // Auth.checkLogin(this)
    if (self.data.isPostSuccess) {
      self.onPullDownRefresh();
      self.setData({
        isPostSuccess: false
      })
    }

  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.category.name || this.data.pageTitle
    });
  },

  onUnload: function () {
    // this.removeArticleChange();
    // 如果是动态搜索，要向上返回2层
    // if (this.data.isSearch) {
    //   wx.navigateBack({
    //     delta: 2
    //   })
    // }
  },

  onPullDownRefresh: function () {
    Auth.checkLogin(this);
    this.setData({
      isPull: true,
      isError: false,
      isArticlesList: false,
      topicsList: []
    })
    let args = {};
    args.page = 1;
    args.pageCount = pageCount;
    if (this.data.isSearch) {
      args.isSearch = true;
      args.isCategory = false;
      args.isTag = false;
      args.searchKey = this.data.searchKey;
    }
    if (this.data.isCategory) {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.forumId = this.data.forumId;
    }
    if (this.data.isTag) {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = this.data.tag;
    }
    var sessionId = this.data.userSession.sessionId;
    var userId = this.data.userSession.userId;
    args.userId = userId;
    args.sessionId = sessionId;

    if (this.data.isSearch && !this.data.searchKey) {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      });
      wx.stopPullDownRefresh()
      return
    }

    Adapter.loadBBTopics(args, this, API);
  },
  onReachBottom: function () {
    let args = {};
    var self = this;
    args.pageCount = pageCount;
    if (!this.data.isLastPage) {
      args.page = this.data.page + 1;
      if (this.data.isSearch) {
        args.isSearch = true;
        args.isCategory = false;
        args.isTag = false;
        args.searchKey = this.data.searchKey;
      }
      if (this.data.isCategory) {
        args.isSearch = false;
        args.isCategory = true;
        args.isTag = false;
        args.forumId = this.data.forumId;
      }
      if (this.data.isTag) {
        args.isSearch = false;
        args.isCategory = false;
        args.isTag = true
        args.tag = this.data.tag;
      }
      this.setData({
        page: args.page
      });
      var sessionId = self.data.userSession.sessionId;
      var userId = self.data.userSession.userId;
      args.userId = userId;
      args.sessionId = sessionId;
      Adapter.loadBBTopics(args, this, API);
    }
  },

  // 跳转至查看动态详情
  TopicDetail: function (e) {
    var sid = e.currentTarget.id,
      url = '../socialdetail/socialdetail?id=' + sid;
    wx.navigateTo({
      url: url
    })
  },
  onShareAppMessage: function () {
    var path = '/pages/sociallist/sociallist';

    var shareTitle = this.data.shareTitle;


    if (this.data.isSearch) {
      path += "?searchKey=" + this.data.searchKey;
      shareTitle+=":"+this.data.searchKey;

    }
    if (this.data.isCategory) {
      path += "?forumId=" + this.data.forumId;
      shareTitle = this.data.category.name + "类的话题";

    }
    if (this.data.isTag) {
      shareTitle = this.data.tagname + "标签的话题";
      path += "?tag=" + this.data.tag + "&tagname=" + this.data.tagname;

    }

    return {
      title: shareTitle,
      path: path
    }
  },

  // 跳转至查看文章详情
  redictDetail: function (e) {
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },

  formSubmit: function (e) {
    var url = '../sociallist/sociallist'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?searchKey=' + key;
      wx.redirectTo({
        url: url,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      });


    }
  },

  // 获取自定义banner
  getCustomBanner() {
    const http = API.getConfig()

    http.then(res => {
      const data = res.settings
      let banner = data.expand.topic_list_nav

      this.setData({
        banner
      })
    })
  },
  // 跳转
  toDetail(e) {
    let { type, appid, url, path } = e.currentTarget.dataset

    if (type === 'apppage') { // 小程序页面         
      wx.navigateTo({
        url: path
      })
    }
    if (type === 'webpage') { // web-view页面
      url = '../webview/webview?url=' + url
      wx.navigateTo({
        url
      })
    }
    if (type === 'miniapp') { // 其他小程序
      wx.navigateToMiniProgram({
        appId: appid,
        path
      })
    }
  },

  // 跳转全屏视频
  toFullVideo(e) {
    let src = e.currentTarget.dataset.src
    let url = `../full-video/full-video?src=${src}`
    wx.navigateTo({
      url
    })
  },

  //获取分类列表
  LoadCategory: function (args) {
    API.getBBForumsById(args).then(res => {
      var catImage = "";
      if (typeof (res.category_thumbnail_image) == "undefined" || res.category_thumbnail_image == "") {
        catImage = "../../images/uploads/default_image.jpg";
      } else {
        catImage = res.category_thumbnail_image;
      }
      this.setData({
        category: res,
        categoryImage: catImage
      });
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: res.name || res.title
      })
    })
  },

  //--------------------------------------
  removeArticleChange: function () {
    //NC.removeNotification("articleChange", this)
  },
  previewImage: function (e) {
    var imgallsrc = e.currentTarget.dataset.imgallsrc;
    var imgsrc = e.currentTarget.dataset.imgsrc;
    wx.previewImage({
      current: imgsrc,
      urls: imgallsrc,
    });
  },
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  zanAuthor: function (e) {
    var zanimage = e.currentTarget.dataset.zanimage;
    wx.previewImage({
      current: zanimage,
      urls: [zanimage]
    });
  },

  playRemoteAudio: function (e) {
    var self = this;
    var audioUrl = e.currentTarget.dataset.audiourl;
    var dataId = e.currentTarget.dataset.id;
    backgroundAudioManager.src = audioUrl;
    backgroundAudioManager.title = "录音";
    self.setData({
      isPlaying: 1,
      dataId: dataId
    })

  },
  stopRemoteAudio: function (e) {
    backgroundAudioManager.stop();
    var dataId = e.currentTarget.dataset.id;
    this.setData({
      isPlaying: 0,
      dataId: dataId
    })
  },
  open_link_doc: function (e) {
    var self = this;
    var url = e.currentTarget.dataset.filelink;
    var fileType = e.currentTarget.dataset.filetype;

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

  postsub: function (e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return;

    } else {
      var extid = e.currentTarget.dataset.id;
      var subscribetype = 'categorySubscribe';
      var subscribemessagesid = e.currentTarget.dataset.subid;
      Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid, util);
    }

  },

  // 输入框失去焦点
  handleBlur(e) {
    let val = e.detail.value
    this.setData({
      searchKey: val,
    })
  },
  
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  },  
  // 发送订阅消息
  sendSubscribeMessage(e) {
    var self = this
    var id = e.currentTarget.id
    var author = e.currentTarget.dataset.author
    var title = e.currentTarget.dataset.title
    var data = {}

    var userId = self.data.userSession.userId
    var sessionId = self.data.userSession.sessionId

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000)
      return
    }

    wx.lin.showDialog({
      type: "confirm",
      title: "发送新内容订阅消息",
      showTitle: true,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认发送？",
      success: (res) => {
        if (res.confirm) {
          var res = Adapter.sendSubscribeMessage(self, id, author, title, 'topic', API).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              })
            } else {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              })
            }
          })
        }
      }
    })
  },

})