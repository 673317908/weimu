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
const WxParse = require("../../vendor/wxParse/wxParse.js");
import config from "../../utils/config.js";
import { ModalView } from "../../templates/modal-view/modal-view.js";
import Poster from "../../templates/components/wxa-plugin-canvas-poster/poster/poster";
const app = getApp();
const pageCount = 10
let isFocusing = false;
const backgroundAudioManager = wx.getBackgroundAudioManager();

const options = {
  data: {
    parentId: "0",
    shareTitle: "",
    pageTitle: "",
    postId: "",
    topicId: "",

    detail: {},
    commentCounts: 0,

    relatedPostList: [],
    commentsList: [],
    repliesList: [],
    display: false,
    total_replies: 0,

    page: 1,
    isLastPage: false,
    isLoading: false,
    isPull: false,

    toolbarShow: true,
    commentInputDialogShow: false,
    iconBarShow: false,
    menuBackgroup: false,

    focus: false,
    placeholder: "مەزمۇننى يىزىڭ",
    toUserId: "",
    toFormId: "",
    commentdate: "",
    content: "",

    dialog: {
      title: "",
      content: "",
      hidden: true
    },
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    userInfo: {},

    likeIcon: "../../images/entry-like.png",
    downloadFileDomain: '',
    businessDomain: '',
    logo: app.globalData.appLogo,
    domain: config.getDomain,
    vid: "",
    isPlaying: 0,
    // 当前用户的手机系统
    system: "",
    // isIpx: '',
    popupShow: false,
    pageName: "socialdetail",
    forums: [],
    isShowSubscribe: true,

    insertWxPopupShow: false, // 嵌入公众号弹出层
    appID: "",
    pagePath: "",
    banner: {},
    showPopPhone:false
  },

  onLoad: function(option) {
    this.setPageInfo()

    // 页面路径
    this.setData({
      pagePath: `pages/socialdetail/socialdetail?id=${option.id}`
    });

    var self = this;
    Auth.checkSession(app, API, this, "isLoginLater", util);

    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    data.topicId = option.id;
    self.setData({ topicId: option.id });
    Adapter.loadBBTopic(data, self, WxParse, API, util);
    data.page = 1;
    data.per_page = 20;
    Auth.checkLogin(self);
    new ModalView();

    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf("iOS") != -1 ? "iOS" : "Android";
        self.setData({
          system
        });
      }
    });

    backgroundAudioManager.onEnded(() => {
      self.setData({
        isPlaying: 0
      });
    });

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
    this.getCustomBanner()
  },
  onShow: function() {
    let self = this;
    Auth.setUserMemberInfoData(self);
    if (this.data.userSession.sessionId) {
      Auth.checkGetMemberUserInfo(this.data.userSession, this, API);
    }
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    let self = this
    let video = self.data.detail.videoList
    let poster = video.length ? video[0].poster : ''
    let imageUrl = poster ? poster : this.data.detail.post_full_image

    return {
      title: self.data.detail.title,
      query: {
        id: self.data.topicId
      },
      imageUrl
    };
  },

  onShareAppMessage: function() {
    let video = this.data.detail.videoList;
    let poster = video.length ? video[0].poster : "";
    let imageUrl = poster ? poster : this.data.detail.post_full_image;

    return {
      title: this.data.detail.title,
      path: "/pages/socialdetail/socialdetail?id=" + this.data.topicId,
      imageUrl
    };
  },

  // 监听页面滚动
  onPageScroll: function(res) {
    if (res.scrollTop < 50) {
      this.setData({ isShowSubscribe: true });
    } else {
      this.setData({ isShowSubscribe: false });
    }
  },

  // 获取自定义banner
  getCustomBanner() {
    const http = API.getConfig()

    http.then(res => {
      const data = res.settings
      let banner = data.expand.topic_detail_top_nav

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

  open_link_doc: function() {
    var self = this;
    var url = self.data.detail.fileLink;
    var fileType = self.data.detail.fileType;

    wx.downloadFile({
      url: url,
      success: function(res) {
        const filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          fieldType: fileType
        });
      }
    });
  },
  openmap: function(e) {
    var self = this;
    var lat = Number(e.currentTarget.dataset.lat);
    var lng = Number(e.currentTarget.dataset.lng);
    var address = e.currentTarget.dataset.address;
    var lati = Number(self.data.thislatitude);
    var long = Number(self.data.thislongitude);
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 28,
      name: address
    });
  },

  onReady: function() {},

  onPullDownRefresh: function() {

    Auth.checkLogin(this);
    this.setData({
      detail: {},
      commentCounts: 0,

      relatedPostList: [],
      commentsList: [],
      repliesList: [],
      display: false,
      total_replies: 0,

      page: 1,
      isLastPage: false,
      isLoading: false,
      isPull: false,

      toolbarShow: true,
      commentInputDialogShow: false,
      iconBarShow: false,
      menuBackgroup: false,

      focus: false,
      placeholder: "مەزمۇننى يىزىڭ",
      toUserId: "",
      toFormId: "",
      commentdate: "",
      content: ""
    });

    var self = this;
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    data.topicId = self.data.topicId;
    self.setData({ topicId: self.data.topicId });
    Adapter.loadBBTopic(data, self, WxParse, API, util);
    wx.stopPullDownRefresh();
  },
  onReachBottom: function() {
    let args = {};
    args.userId = this.data.userSession.userId;
    args.sessionId = this.data.userSession.sessionId;
    args.topicId = this.data.topicId;
    args.per_page = pageCount;
    args.page = this.data.page;
    if (!this.data.isLastPage) {
      Adapter.loadReplayTopic(args, this, API);
    }
  },

  // 动态设置页面信息
  setPageInfo() {
    let app = getApp()
    let downloadFileDomain = app.globalData.downloadDomain
    let businessDomain = app.globalData.businessDomain

    this.setData({
      downloadFileDomain,
      businessDomain
    })
  },

  fristOpenComment: function() {
    let args = {};
    args.userId = this.data.userSession.userId;
    args.sessionId = this.data.userSession.sessionId;
    args.topicId = this.data.topicId;
    args.per_page = pageCount;
    args.page = 1;
    this.setData({ repliesList: [] });
    Adapter.loadReplayTopic(args, this, API);
  },

  // 跳转至查看文章详情
  redictDetail: function(e) {
    Adapter.redictDetail(e, "post");
  },
  //--------------------------------------
  removeArticleChange: function() {
    //NC.removeNotification("articleChange", this)
  },
  goHome: function() {
    wx.switchTab({
      url: "../index/index"
    });
  },

  //回复这个话题
  replySubmit: function(e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
    } else {
      var name = self.data.userInfo.nickName;
      var sessionId = self.data.userSession.sessionId;
      var userId = self.data.userSession.userId;
      var replycontent = e.detail.value.inputComment;
      var topicID = e.detail.value.inputTopicID;

      var parentId = self.data.parentId;
     
      if (replycontent.length === 0) {
        self.setData({
          "dialog.hidden": false,
          "dialog.title": "ئەسكەرتىش",
          "dialog.content": "ھىچنەرسە كىرگۈزمىدىڭىز"
        });

        return;
      }

      var data = {
        sessionid: sessionId,
        userid: userId,
        content: replycontent,
        parentid: parentId,
        name: name
      };
      Adapter.replyBBTopic(topicID, data, self, WxParse, API);
      // 隐藏评论框
      this.hiddenBar();
    }
  },

  replay: function(e) {
    var self = this;
    if (self.data.detail.enableComment == "0") {
      return;
    }
    var parentId = e.currentTarget.dataset.id;
    var toUserName = e.currentTarget.dataset.name;
    var toUserId = e.currentTarget.dataset.userid;
    var commentdate = e.currentTarget.dataset.commentdate;
    isFocusing = true;
    self.showToolBar("replay");
    self.setData({
      parentId: parentId,
      placeholder: toUserName + "غا ئىنكاس",
      focus: true,
      toUserId: toUserId,
      commentdate: commentdate
    });
  },

  postLike: function() {
    var self = this;
    var id = self.data.detail.id;
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
    } else {
      Adapter.postLike(id, self, app, API, "topicDetail");
    }
  },
  agreeGetUser: function(e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, "0");
  },
  onBindBlur: function(e) {
    var self = this;
    if (!isFocusing) {
      {
        const text = e.detail.value.trim();
        if (text === "") {
          self.setData({
            parentID: "0",
            placeholder: "مەزمۇن يىزىڭ",
            userid: "",
            toFromId: "",
            commentdate: ""
          });
        }
      }
    }
  },
  onBindFocus: function(e) {
    var self = this;
    isFocusing = false;
    if (!self.data.focus) {
      self.setData({ focus: true });
    }
  },
  //显示或隐藏评论输入框
  showToolBar: function(e) {
    var self = this;
    var member = self.data.memberUserInfo.member;
    var _member = 10;
    if (member != "00" && member != "01") {
      _member = parseInt(member);
    }
    var min_comment_user_member = self.data.detail.min_comment_user_member;
    var min_comment_user_memberName =
      self.data.detail.min_comment_user_memberName;
    if (member != "00" && member != "01" && _member < min_comment_user_member) {
      if (e != "replay") {

        wx.lin.showDialog({
          type: "confirm",
          title: "ماۋزۇ",
          showTitle: false,
          confirmText: "ماقۇل",
          confirmColor: "#f60",
          content: "ھوقوقىڭىز يىتىشمىدى، "+min_comment_user_memberName+" دىن يۇقۇرى ئەزالارلار يوللىيالايدۇ، جۇغلانما يىغىپ دەرىجىڭىزنى ئۆستۈرەمسىز؟",
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../earnIntegral/earnIntegral'
              });
            }
  
            
          }
        })

        // Adapter.toast(
        //   "权限不足,需" +
        //     min_comment_user_memberName +
        //     "及以上等级方可发表评论。",
        //   5000
        // );
      }
    } else {
      let userId = self.data.userSession.userId
      let sessionId = self.data.userSession.sessionId
      if (!userId || !sessionId) {
        self.setData({ isLoginPopup: true })
        return
      }

      let args = {
        userId: userId,
        sessionId: sessionId
      }
      API.getEnableExchangePhone(args).then(res => {
        if (!res.enable) {
          // 登录鉴权失败
          if (res.code === 'user_parameter_error') {
            wx: wx.showToast({
              title: 'مىنىڭ دىگەن بەتتىكى قالدۇق تازلاشنى بىسىپ قالدۇق تازلاڭ',
              icon: 'none',
              duration: 3000
            })
            self.setData({ showPopPhone: false })
            return
          }
          self.setData({showPopPhone:true})
        }
        else
        {
          self.setData({
            toolbarShow: false,
            commentInputDialogShow: true,
            iconBarShow: false,
            menuBackgroup: !this.data.menuBackgroup,
            focus: true
          });
  
        }
      })
    }
  },

  //显示或隐藏评论图标工具栏
  showIconBar: function() {
    this.setData({
      toolbarShow: false,
      iconBarShow: true,
      commentInputDialogShow: false,
      menuBackgroup: !this.data.menuBackgroup,
      focus: false
    });
  },
  //点击非评论区隐藏评论输入框或图标栏
  hiddenBar: function() {
    this.setData({
      iconBarShow: false,
      toolbarShow: true,
      menuBackgroup: false,
      commentInputDialogShow: false,
      focus: false
    });
  },

  confirm: function() {
    this.setData({
      "dialog.hidden": true,
      "dialog.title": "",
      "dialog.content": ""
    });
  },
  closeLoginPopup() {
    this.setData({ isLoginPopup: false });
  },
  openLoginPopup() {
    this.setData({ isLoginPopup: true });
  },
  postRefresh: function() {
    this.onPullDownRefresh();
    this.hiddenBar();
    Adapter.toast("يېڭىلاندى", 1500);
  },

  // 嵌入公众号
  insertWxPost() {
    this.getAppId();
    this.hiddenBar();
    this.setData({
      insertWxPopupShow: true
    });
  },

  // 获取appID
  getAppId() {
    var self = this;
    API.getSettings().then(res => {
      self.setData({
        appID: res.settings.appid
      });
    });
  },

  // 复制嵌入信息
  copyInsertInfo(e) {
    let data = e.currentTarget.dataset;
    let id = data.id;
    let path = data.path;
    let info = `AppID：${id}，ئادرىس: ${path}`;

    this.closeInsertWxPopup();
    Adapter.copyLink(info, "كۆپەيتىلدى");
  },

  // 关闭嵌入微信弹出
  closeInsertWxPopup() {
    this.setData({
      insertWxPopupShow: false
    });
  },

  copyLink: function() {
    var url = this.data.detail.permalink;
    this.hiddenBar();
    Adapter.copyLink(url, "كۆپەيتىلدى");
  },
  gotoWebpage: function() {
    var url = this.data.detail.permalink;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    this.hiddenBar();
    Adapter.gotoWebpage(enterpriseMinapp, url);
  },
  creatPoster: function() {
    var self = this;
    self.hiddenBar();
    Adapter.creatPoster(self, app, API, util, self.modalView, "topic");
  },
  onPosterSuccess(e) {
    const { detail } = e;
    // wx.previewImage({
    //   current: detail,
    //   urls: [detail]
    // })
    this.showModal(detail);
  },
  onPosterFail(err) {
    //console.error(err);
    Adapter.toast(err, 2000);
  },
  onCreatePoster() {
    var self = this;
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
    } else {
      Adapter.creatArticlePoster(
        self,
        app,
        API,
        util,
        self.modalView,
        "topic",
        Poster
      );
    }
  },
  showModal: function(posterPath) {
    this.modalView.showModal({
      title: "ئالبومغا ساقلىۋىلىپ دوستلىرىڭىزغا ھەمبەھىرلىيەلەيسىز",
      confirmation: false,
      confirmationText: "",
      inputFields: [
        {
          fieldName: "posterImage",
          fieldType: "Image",
          fieldPlaceHolder: "",
          fieldDatasource: posterPath,
          isRequired: false
        }
      ]
    });
  },
  payment: function() {
    var self = this;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    if (enterpriseMinapp == "1") {
      if (!self.data.userSession.sessionId) {
        self.setData({ isLoginPopup: true });
      } else {
        wx.navigateTo({
          url:
            "../payment/payment?postid=" +
            self.data.topicId +
            "&categoryid=" +
            self.data.detail.categories[0] +
            "&posttitle=" +
            self.data.detail.title.rendered
        });
      }
    } else {
      Adapter.toast("个人主体小程序无法使用此功能", 2000);
    }
  },
  postPraise: function() {
    var self = this;
    var system = self.data.system;
    var enterpriseMinapp = this.data.detail.enterpriseMinapp;
    var authorZanImage = self.data.detail.author_zan_image;
    var praiseimgurl = self.data.detail.praiseimgurl;
    if (authorZanImage != "") {
      wx.previewImage({
        urls: [authorZanImage]
      });
    } else {
      if (system == "iOS") {
        if (praiseimgurl != "") {
          wx.previewImage({
            urls: [praiseimgurl]
          });
        } else if (praiseimgurl == "" && enterpriseMinapp == "1") {
          Adapter.toast("根据相关规定，该功能暂时只支持在安卓手机上使用", 1500);
        } else {
          Adapter.toast("تەڭشەكتە خاتالىق بار", 1500);
        }
      } else {
        if (enterpriseMinapp == "1") {
          if (!self.data.userSession.sessionId) {
            self.setData({ isLoginPopup: true });
          } else {
            wx.navigateTo({
              url:
                "../postpraise/postpraise?postid=" +
                self.data.topicId +
                "&touserid=" +
                self.data.userSession.userId +
                "&posttype=post"
            });
          }
        } else if (enterpriseMinapp != "1" && praiseimgurl != "") {
          wx.previewImage({
            urls: [praiseimgurl]
          });
        } else {
          Adapter.toast("تەڭشەكتە خاتالىق بار", 1500);
        }
      }
    }

    self.hiddenBar();
  },
  playRemoteAudio: function(e) {
    var self = this;
    var audioUrl = self.data.detail.audioUrl;
    backgroundAudioManager.src = audioUrl;
    backgroundAudioManager.title = "ئۈنگە ئىلىش";
    self.setData({
      isPlaying: 1
    });
  },
  stopRemoteAudio: function() {
    backgroundAudioManager.stop();
    this.setData({
      isPlaying: 0
    });
  },
  deleteComment: function(e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var topicId = self.data.detail.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var repliesList = self.data.repliesList;

    if (!sessionId || !userId) {
      Adapter.toast("تىزىملىتىپ كىرىڭ", 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.topicId = topicId;
    data.deletetype = "publishStatus";
    wx.lin.showDialog({
      type: "confirm",
      title: "ماۋزۇ",
      showTitle: false,
      confirmText: "ماقۇل",
      confirmColor: "#f60",
      content: "ئۆچۈرەمسىز؟",
      success: res => {
        if (res.confirm) {
          API.deleteReplyById(data).then(res => {
            if (res.code == "error") {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            } else {
              // wx.pageScrollTo({
              //     selector : '.entry-title1'

              //   })
              //self.setData({page:1,isLastPage:false,commentsList:[]})
              //self.onReachBottom();

              var hasChild = false;
              repliesList.forEach(element => {
                if (element.id == id && element.child.length > 0) {
                  hasChild = true;
                }
              });
              if (hasChild) {
                self.onPullDownRefresh();
              } else {
                repliesList = repliesList.filter(function(item) {
                  return item["id"] !== id;
                });
                self.setData({ repliesList: repliesList });
              }

              var total_replies = parseInt(self.data.total_replies) - 1;
              self.setData({
                total_replies: total_replies
              });

              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
          });
        } else if (res.cancel) {
        }
      }
    });
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

    var enterpriseMinapp = self.data.detail.enterpriseMinapp;
   
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
              Adapter.copyLink(href, "كۆپەيتىلدى")
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

      if (src.indexOf(self.data.downloadFileDomain[i]) != -1) {
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
  onHidePupopTap(e) {
    this.setData({ popupShow: false });
  },
  showPupop(e) {
    var args = {};
    var self = this;
    self.loadBBForums(self);
  },
  // 加载帖子列表
  loadBBForums(appPage) {
    var forums = [];
    var sessionId = appPage.data.userSession.sessionId;
    var userId = appPage.data.userSession.userId;
    appPage.setData({
      forums: []
    });

    var args = {};
    args.userId = userId;
    args.sessionId = sessionId;
    API.getBBForums(args)
      .then(res => {
        if (res.length && res.length > 0) {
          forums = forums.concat(res);
          appPage.setData({
            forums: forums,
            popupShow: true
          });
        } else {
          wx.showToast({
            title: res,
            duration: 1500
          });
        }
      })
    wx.stopPullDownRefresh();
  },
  postsub: function(e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, "isLoginNow", util);
      return;
    } else {
      var extid = e.currentTarget.dataset.id;
      var subscribetype = "categorySubscribe";
      var subscribemessagesid = e.currentTarget.dataset.subid;
      Adapter.subscribeMessage(
        self,
        subscribetype,
        API,
        subscribemessagesid,
        extid,
        util
      );
    }
  },

  // 评论点赞
  postCommentLike(e) {
    let self = this;

    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, "isLoginNow", util);
      return;
    }

    let id = e.currentTarget.dataset.id;
    let extype = "replay";

    let args = {
      id: id,
      extype: extype,
      userid: self.data.userSession.userId,
      sessionid: self.data.userSession.sessionId
    };

    API.commentLike(args).then(res => {
      if (res.success) {
        let list = self.data.repliesList;
        list = list.map(item => {
          let isCur = item.id === id;

          if (isCur && item.likeon === "0") {
            item.likeon = "1";
            item.likecount++;
          } else if (isCur && item.likeon === "1") {
            item.likeon = "0";
            item.likecount--;
          }
          return item;
        });

        self.setData({
          repliesList: list
        });
      } else {
        wx.showToast({
          title: res.message,
          mask: false,
          icon: "none",
          duration: 3000
        });
      }
    });
  },

  // 去用户主页
  goUserDetail(e) {
    let id = e.currentTarget.dataset.id;
    let url = "../author/author?userid=" + id + "&postype=topic";
    wx.navigateTo({
      url: url
    });
  },
  // 预览图片
  previewImage(e) {
    var imgallsrc = e.currentTarget.dataset.imgallsrc
    var imgsrc = e.currentTarget.dataset.imgsrc
    wx.previewImage({
      current: imgsrc,
      urls: imgallsrc
    })
  },
  getPhoneNumber(e){
    Adapter.getPhoneNumber(e,this,API,Auth);
 }, 
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }
  
};
//-------------------------------------------------
Page(options);
