const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')
const WxParse = require('../../vendor/wxParse/wxParse.js')
import config from '../../utils/config.js'
import { ModalView } from '../../templates/modal-view/modal-view.js'
import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster'
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()
let ctx = wx.createCanvasContext('mycanvas')
const pageCount = 10
let isFocusing = false
let rewardedVideoAd = null
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'


Page({
  // 初始数据
  data: {
    parentId: "0",
    shareTitle: "",
    pageTitle: "",
    postId: "",
    detail: {},
    commentCounts: 0,
    relatedPostList: [],
    commentsList: [],
    display: false,
    displaygoods: false,
    displaytags: false,
    displaymp: false,
    page: 1,
    isLastPage: false,
    isLoading: false,
    isPull: false,
    toolbarShow: true,
    commentInputDialogShow: false,
    iconBarShow: false,
    menuBackgroup: false,

    focus: false,
    placeholder: "说点什么...",
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
    platform: '',
    posterConfig: {},

    system: '',

    isPlayAudio: false,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    displayAudio: 'none',
    shareImagePath: '',
    detailSummaryHeight: '',
    detailAdsuccess: true,
    detailTopAdsuccess:true,
    fristOpen: false,
    popupShow:false,
    columns: [],
    pageName:"detail",
    isShowSubscribe: true,
    isPaySuccess:false,

    insertWxPopupShow: false, // 嵌入公众号弹出层
    appID: '',
    pagePath: '',
    showPopPhone: false,
    banner: {},
    showPopPoints: false,
    onlyVideo: false
  },

  // 页面加载
  onLoad: function (option) {
    this.setPageInfo()

    // 页面路径
    this.setData({
      pagePath: `pages/detail/detail?id=${option.id}`
    })

    let args = {}
    let self = this
    args.id = option.id
    args.postType = "post"
    Auth.checkSession(app, API, this, 'isLoginLater', util)
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'
        self.setData({
          system: system,
          platform: t.platform
        })
      }
    })

    args.userId = self.data.userSession.userId
    args.sessionId = self.data.userSession.sessionId

    // ‘canvas’为前面创建的canvas标签的canvas-id属性值
    Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext, ctx)
    self.setData({
      postId: option.id
    })
    Auth.checkLogin(self)
    new ModalView

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.getCustomBanner()

    // 显示阅读积分弹窗
    let userInfo = wx.getStorageSync('userSession')
    if (userInfo.sessionId && userInfo.userId) {
      this.setData({
        showPopPoints: true
      })
    }
  },

  onShow: function () {
    let self = this;
    Auth.setUserMemberInfoData(self);
    if (this.data.isPaySuccess) {
      self.onPullDownRefresh();
      self.setData({isPaySuccess:false})
    }

    if (this.data.userSession.sessionId) {
      Auth.checkGetMemberUserInfo(this.data.userSession, this, API)
    }

    if (this.data.showPopPoints && this.selectComponent("#count-down")) {
      this.selectComponent("#count-down").start()
    }
  },

  // 分享
  onShareAppMessage() {
    var self = this
    var imageUrl = self.data.detail.post_full_image

    return {
      title: self.data.detail.title.rendered,
      path: '/pages/index/index?frompage=detail&id=' + self.data.postId,
      imageUrl
    }
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    let imageUrl = this.data.detail.post_full_image

    return {
      title: this.data.detail.title.rendered,
      query: {
        id: this.data.detail.id
      },
      imageUrl
    }
  },

  // onHide: function() {
  //   if (this.data.showPopPoints) {
  //     this.selectComponent("#count-down").pause()
  //   }
  // },

  // 页面销毁
  onUnload: function () {
    // 清除定时器
    clearInterval(this.data.durationIntval)
    if (rewardedVideoAd && rewardedVideoAd.destroy) {
      rewardedVideoAd.destroy()
    }
    innerAudioContext.stop()
    ctx = null
  },

  // 监听页面滚动
  onPageScroll: function (res) {
    if (res.scrollTop < 100) {
      this.setData({ isShowSubscribe: true })
    } else {
      this.setData({ isShowSubscribe: false })
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self = this
    let args = {}
    Auth.checkLogin(self)
    Auth.setUserMemberInfoData(self) 
    args.id = self.data.postId
    args.postType = 'post'  
    args.userId = self.data.userSession.userId
    args.sessionId = self.data.userSession.sessionId
    self.setData({
      relatedPostList: [],
      isPull: true,
      detailAdsuccess: true,
      detailTopAdsuccess:true
    })
    Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext, ctx)
  },

  // 上拉加载
  onReachBottom: function () {
    let args = {}
    args.userId = this.data.userSession.userId
    args.sessionId = this.data.userSession.sessionId
    args.postId = this.data.postId
    args.limit = pageCount
    args.page = this.data.page
    args.flag = 'postcomment'
    if (!this.data.isLastPage) {      
      Adapter.loadComments(args, this, API)
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

  // 获取自定义banner
  getCustomBanner() {
    const http = API.getConfig()

    http.then(res => {
      const data = res.settings
      let banner = data.expand.post_detail_top_nav

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

  // 加载广告
  loadInterstitialAd(excitationAdId) {
    var self = this
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd
      (
        {
         adUnitId: excitationAdId,
         multiton: true 
        }
      )
      rewardedVideoAd.onLoad(() => {
        // console.log('广告加载成功')
      })
      rewardedVideoAd.onError((err) => {
        Adapter.toast("广告加载错误,请刷新页面", 3000)
        // this.setData({
        //   detailSummaryHeight: ''
        // })
      })
      rewardedVideoAd.onClose((res) => {
        var id = self.data.detail.id
        if (res && res.isEnded) {
          var nowDate = new Date()
          nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate()
          var openAdLogs = wx.getStorageSync('openAdLogs') || []

          // 过滤重复值
          if (openAdLogs.length > 0) {
            openAdLogs = openAdLogs.filter(function (log) {
              return log['id'] !== id
            })
          }
 
          // 如果超过指定数量不再记录
          if (openAdLogs.length < 21) {
            var log = {
              "id": id,
              "date": nowDate
            }
            openAdLogs.unshift(log)
            wx.setStorageSync('openAdLogs', openAdLogs)
          }

          this.setData({
            detailSummaryHeight: ''
          })
        } else {
          Adapter.toast("你中途关闭了视频", 3000)
        }
      })
    }
  },

  // 广告报错
  adbinderror(e) {
    var self = this  
    if (e.detail.errCode) {
      self.setData({
        detailAdsuccess: false
        
      })
    }
  },
  adTopbinderror: function (e) {
    var self = this;
    if (e.detail.errCode) {
      self.setData({ detailTopAdsuccess: false })
    }
  },

  // 阅读更多
  readMore() {
    var self = this
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
      return;
    }
    var platform = self.data.platform
    if (platform == 'devtools') {
      Adapter.toast("开发工具无法显示激励视频", 2000)
      // self.setData({
      //   detailSummaryHeight: ''
      // })
    } else {
      rewardedVideoAd.show()
        .catch(() => {
          rewardedVideoAd.load()
            .then(() => rewardedVideoAd.show())
            .catch(err => {
              Adapter.toast("激励视频广告获取失败！", 2000)
              // self.setData({
              //   detailSummaryHeight: ''
              // })
            })
        })
    }
  },

  // 播放暂停
  playAudio() {
    var self = this;
    Adapter.playAudio(innerAudioContext, self)
  },

  //拖动音频进度条
  sliderChange(e) {
    var that = this
    innerAudioContext.src = this.data.detail.audios[0].src
    //获取进度条百分比
    var value = e.detail.value
    this.setData({ audioTime: value })
    var duration = this.data.audioDuration
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100)
    //更改状态
    this.setData({ audioSeek: value, isPlayAudio: true })
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value)
    //播放歌曲
    innerAudioContext.play()
  },

  // 刷新
  detailRefresh() {
    var self = this
    let args = {}
    args.id = this.data.postId
    args.postType = 'post'
    Auth.setUserMemberInfoData(this)
    args.userId = this.data.userSession.userId
    args.sessionId = this.data.userSession.sessionId
    this.setData({ detail: {}, relatedPostList: [], isPull: true, detailAdsuccess: true, detailTopAdsuccess: true })
    Adapter.loadArticleDetail(args, self, WxParse, API, util, innerAudioContext)
  },

  // 加载评论数据
  fristOpenComment() {
    let args = {}
    args.userId = this.data.userSession.userId
    args.sessionId = this.data.userSession.sessionId
    args.postId = this.data.postId
    args.limit = pageCount
    args.page = 1
    args.flag = 'postcomment'
    this.setData({    
      commentsList: []
    })

    Adapter.loadComments(args, this, API)
  },

  // 跳转文章详情
  redictDetail(e) {
    Adapter.redictDetail(e, 'post')
  },

  // 回复评论
  replay(e) {
    var self = this
    if (self.data.detail.enableComment == '0') {
      return
    }
    var parentId = e.currentTarget.dataset.id
    var toUserName = e.currentTarget.dataset.name
    var toUserId = e.currentTarget.dataset.userid
 
    var commentdate = e.currentTarget.dataset.commentdate
    isFocusing = true
    self.showToolBar('replay')

    self.setData({
      parentId: parentId,
      placeholder: "回复" + toUserName + ":",
      focus: true,
      toUserId: toUserId,     
      commentdate: commentdate
    })
  },

  // 提交评论
  formSubmitComment(e) {
    var self = this
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true })
    } else {
      Adapter.submitComment(e, self, app, API, util)
    }
  },

  // 点赞
  postLike() {
    var self = this
    var id = self.data.detail.id
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true })
    } else {
      Adapter.postLike(id, self, app, API, "postDetail")
    }
  },

  // 用户授权
  agreeGetUser(e) {
    let self = this
    Auth.checkAgreeGetUser(e, app, self, API, '0')
  },

  // 弹出登录框
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    })
  },

  // 关闭登录框
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    })
  },

  // 输入框获得焦点
  onBindFocus(e) {
    var self = this
    isFocusing = false
      if (!self.data.focus) {
        self.setData({ focus: true })
      }  
  },

  // 输入框失去焦点
  onBindBlur(e) {
    var self = this
    if (!isFocusing) {
      const text = e.detail.value.trim()
      if (!text) {
        self.setData({
          parentID: '0',
          placeholder: '说点什么...',
          userid: '',
          toFromId: '',
          commentdate: ''
        })
      }
    }
  },

  //显示隐藏评论输入框
  showToolBar(e) {   
    var self=this;
    var member = self.data.memberUserInfo.member;
    var _member=10;
    if(member !="00" && member !="01" ) {
      _member= parseInt(member)
    }
    var min_comment_user_member=self.data.detail.min_comment_user_member;
    var min_comment_user_memberName=self.data.detail.min_comment_user_memberName;
    if(member !="00" && member !="01"  && _member < min_comment_user_member) {
      if(e !="replay") {
        wx.lin.showDialog({
          type: "confirm",
          title: "标题",
          showTitle: false,
          confirmText: "确认",
          confirmColor: "#f60",
          content: "权限不足,需"+min_comment_user_memberName+"及以上等级方可发表评论。是否去赚积分提高等级?",
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../earnIntegral/earnIntegral'
              });
            }        
          }
        })
      }  
    }
    else{
      let userId = self.data.userSession.userId
      let sessionId = self.data.userSession.sessionId
      if (!userId || !sessionId) {
        self.setData({ isLoginPopup: true })
        return
      }

      let args ={
        userId: userId,
        sessionId: sessionId
      }
      API.getEnableExchangePhone(args).then(res => {
        if (!res.enable) {
          // 登录鉴权失败
          if (res.code === 'user_parameter_error') {
            wx: wx.showToast({
              title: '用户参数错误，请点击我的页面"清除缓存"后再次登录',
              icon: 'none',
              duration: 3000
            })
            self.setData({ showPopPhone: false })
            return
          }

          self.setData({showPopPhone:true})
        } else {
          this.setData({
            toolbarShow: false,
            commentInputDialogShow: true,
            iconBarShow: false,
            menuBackgroup: !this.data.menuBackgroup,
            focus: true
          })
        }
      })
      

    } 
    
  },

  //显示隐藏工具栏
  showIconBar() {
    this.setData({
      toolbarShow: false,
      iconBarShow: true,
      commentInputDialogShow: false,
      menuBackgroup: !this.data.menuBackgroup,
      focus: false
    })
  },

  //点击非评论区隐藏弹出栏
  hiddenBar() {
    this.setData({
      iconBarShow: false,
      toolbarShow: true,
      menuBackgroup: false,
      commentInputDialogShow: false,
      focus: false
    })
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '../index/index'
    })
  },

  // 文章刷新
  postRefresh() {
    this.onPullDownRefresh()
    this.hiddenBar()
    Adapter.toast("已刷新", 1500)
  },

  // 嵌入公众号
  insertWxPost() {
    this.getAppId()
    this.hiddenBar()
    this.setData({
      insertWxPopupShow: true
    })
  },

  // 获取appID
  getAppId() {
    var self = this
    API.getSettings().then(res => {
      self.setData({
        appID: res.settings.appid
      })
    })
  },

  // 复制嵌入信息
  copyInsertInfo(e) {
    let data = e.currentTarget.dataset
    let id = data.id
    let path = data.path
    let info = `AppID：${id}，小程序路径：${path}`

    this.closeInsertWxPopup()
    Adapter.copyLink(info, "复制成功")
  },

  // 关闭嵌入微信弹出
  closeInsertWxPopup() {
    this.setData({
      insertWxPopupShow: false
    })
  },

  // 复制链接
  copyLink() {
    var url = this.data.detail.link
    this.hiddenBar()
    Adapter.copyLink(url, "复制成功")
  },

  // 去到网页
  gotoWebpage() {
    var url = this.data.detail.link
    var enterpriseMinapp = this.data.detail.enterpriseMinapp
    this.hiddenBar()
    Adapter.gotoWebpage(enterpriseMinapp, url)
  },

  // 生成海拔
  onCreatePoster() {
    var self = this
    if (!self.data.userSession.sessionId) {
      self.setData({
        isLoginPopup: true
      })
    } else {
      Adapter.creatArticlePoster(self, app, API, util, self.modalView, 'post', Poster)
    }
  },

  // 海报生成成功
  onPosterSuccess(e) {
    const { detail } = e
    this.showModal(detail)
  },

  // 海报生成失败
  onPosterFail(err) {
    Adapter.toast(err, 2000)
  },

  // 创建海报
  creatPoster() {
    var self = this
    self.hiddenBar()
    Adapter.creatPoster(self, app, API, util, self.modalView, 'post')
  },

  // 保存海报
  showModal(posterPath) {
    this.modalView.showModal({
      title: '保存至相册可以分享给好友',
      confirmation: false,
      confirmationText: '',
      inputFields: [{
        fieldName: 'posterImage',
        fieldType: 'Image',
        fieldPlaceHolder: '',
        fieldDatasource: posterPath,
        isRequired: false
      }],
      confirm: function (res) {}
    })
  },

  // 支付
  payment() {
    var self = this
    var enterpriseMinapp = this.data.detail.enterpriseMinapp

    if (enterpriseMinapp == "1") {
      if (!self.data.userSession.sessionId) {
        self.setData({ isLoginPopup: true })
      } else {
        var originalprice = self.data.detail.originalprice
        var postprice = self.data.detail.postprice
        var catYearPrice = self.data.detail.catyearprice
        var catYearIntegral = self.data.detail.catYearIntegral

        if (postprice != '' || catYearPrice != '' || catYearIntegral != '') {
          wx.navigateTo({
            url: '../payment/payment?postid=' + self.data.postId + "&categoryid=" + self.data.detail.categories[0] + "&posttitle=" + self.data.detail.title.rendered
          })
        } else if (originalprice != "" && catYearIntegral == '') {
          self.postIntegral()
        }
      }
    } else {
      Adapter.toast("个人主体小程序无法使用此功能", 2000)
    }
  },

  // 支付积分
  postIntegral() {
    var self = this
    var userId = self.data.userSession.userId
    var sessionId = self.data.userSession.sessionId
    var postId = self.data.detail.id

    if (!sessionId) {
      self.setData({ isLoginPopup: true })
      return
    }
    var originalprice = parseInt(self.data.detail.originalprice);
    var userIntegral  = parseInt(self.data.memberUserInfo.integral);
    if(userIntegral<originalprice)
    {


      var _integral =originalprice-userIntegral;
      wx.lin.showDialog({
        type: "confirm",
        title: "标题",
        showTitle: false,
        confirmText: "确认",
        confirmColor: "#f60",
        content: "积分不足,还需要"+_integral+"积分，是否去赚积分?",
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../earnIntegral/earnIntegral'
            });
          }

          
        }
      }) 
      
      return;

    }
    var args = {}
    args.sessionid = sessionId
    args.extid = postId
    args.userid = userId
    args.integral = originalprice
    args.extype = "postIntegral"

    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "将使用积分" + originalprice + ",确认使用？",
      success: (res) => {
        if (res.confirm) {
          API.postIntegral(args).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            } else {
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

  
  postPraise() {
    var self = this
    var system = self.data.system
    var enterpriseMinapp = this.data.detail.enterpriseMinapp
    var authorZanImage = self.data.detail.author_zan_image
    var praiseimgurl = self.data.detail.praiseimgurl
    if(praiseimgurl=='')
    {
      praiseimgurl = app.globalData.praiseImg;
    }
    if (authorZanImage) {
      wx.previewImage({
        urls: [authorZanImage]
      })
    } else {
      if (system == 'iOS') {
        if (praiseimgurl) {
          wx.previewImage({
            urls: [praiseimgurl]
          })
        } else if (!praiseimgurl && enterpriseMinapp == "1") {
          Adapter.toast("根据相关规定，该功能暂时只支持在安卓手机上使用", 1500)
        } else {
          Adapter.toast("设置错误", 1500)
        }
      } else {
        if (enterpriseMinapp == "1") {
          if (!self.data.userSession.sessionId) {
            self.setData({ isLoginPopup: true })
          } else {
            wx.navigateTo({
              url: '../postpraise/postpraise?postid=' + self.data.postId + "&touserid=" + self.data.userSession.userId + "&posttype=post"
            })
          }
        } else if (enterpriseMinapp != "1" && praiseimgurl != "") {
          wx.previewImage({
            urls: [praiseimgurl]
          })
        } else {
          Adapter.toast("设置错误", 1500)
        }
      }
    }

    self.hiddenBar()
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

  // 删除评论
  deleteComment(e) {
    var self = this
    var id = e.currentTarget.dataset.id
    var data = {}
    var userId = self.data.userSession.userId
    var sessionId = self.data.userSession.sessionId
    var commentsList = self.data.commentsList

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000)
      return
    }
    data.id = id
    data.userid = userId
    data.sessionid = sessionId
    data.deletetype = 'publishStatus'
    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认删除？",
      success: (res) => {
        if (res.confirm) {
          API.deleteCommentById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              })
            } else {
              var hasChild = false
              commentsList.forEach(element => {
                if (element.id == id && element.child.length > 0) {
                  hasChild = true
                }
              })

              if (hasChild) {
                self.onPullDownRefresh()
              } else {
                commentsList = commentsList.filter(function (item) {
                  return item["id"] !== id
                })
                self.setData({
                  commentsList: commentsList
                })
              }

              var commentCounts = parseInt(self.data.commentCounts) - 1
              self.setData({
                commentCounts: commentCounts
              })

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
  onHidePupopTap(e){
    this.setData({popupShow:false})
  },

  showPupop(e){
    var args= {};
    var self=this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return;
      
    }
    args.cateType = 'subscribe';
    args.userId=self.data.userSession.userId;
    args.sessionId=self.data.userSession.sessionId;

    Adapter.loadCategories(args, self, API, true); 
  },
  
  confirm() {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  postsub(e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return;
      
    }
    else {
    var extid=e.currentTarget.dataset.id;
    var subscribetype = 'categorySubscribe';
    var subscribemessagesid = e.currentTarget.dataset.subid;
    Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid,extid, util);
    }
      
  },

  // 评论点赞
  postCommentLike(e) {
    let self = this

    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util)
      return;
    }

    let id = e.currentTarget.dataset.id
    let extype = 'comment'

    let args = {
      id: id,
      extype: extype,
      userid: self.data.userSession.userId,
      sessionid: self.data.userSession.sessionId
    }

    API.commentLike(args).then(res => {
      if (res.success) {
        let list = self.data.commentsList
        list = list.map(item => {
          let isCur = item.id === id

          if (isCur && item.likeon === '0') {
            item.likeon = '1'
            item.likecount++
          } else if (isCur && item.likeon === '1') {
            item.likeon = '0'
            item.likecount--
          }
          return item
        })

        self.setData({
          commentsList: list
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
  },

  // 去用户主页
  goUserDetail(e) {
    let id = e.currentTarget.dataset.id
    let url = '../author/author?userid=' + id + '&postype=topic'
    wx.navigateTo({
      url: url
    })
  },
  wxParseToRedict(e){
      var appid=e.currentTarget.dataset.appid;
      var redirectype=e.currentTarget.dataset.redirectype;   
      var path=e.currentTarget.dataset.path;
      var url=e.currentTarget.dataset.url;

      if (redirectype == 'apppage') { //跳转到小程序内部页面         
        wx.navigateTo({
          url: path
        })
      } else if (redirectype == 'webpage') //跳转到web-view内嵌的页面
      {
        url = '../webview/webview?url=' + url;
        wx.navigateTo({
          url: url
        })
      }
      else if (redirectype == 'miniapp') //跳转其他小程序
       {
        wx.navigateToMiniProgram({
          appId: appid,
          path: path
          
        })
      }
      

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

  // 打开地图查看位置
  openmap(e) { 
    var lat = Number(e.currentTarget.dataset.lat)
    var lng = Number(e.currentTarget.dataset.lng)
    var address = e.currentTarget.dataset.address
    wx.openLocation({
      latitude: lat,
      longitude: lng,
      scale: 15,
      name: address
    })
  },
  
  getPhoneNumber(e){
    Adapter.getPhoneNumber(e,this,API,Auth);
  },

  // 获取积分奖励
  async getReadPoints() {
    let userInfo = wx.getStorageSync('userSession')
    let params = {
      postid: this.data.postId,
      sessionid: userInfo.sessionId,
      userid: userInfo.userId
    }
    const res = await app.$api.getReadPoints(params)

    // if (res.code === 'success') return
    wx.showToast({
      title: res.message,
      icon: 'none',
      duration: 2000
    })
    this.setData({
      showPopPoints: false
    })
  },
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }

})

