const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'

const pageCount = 10
const authorPageCount = 5
const authorListPageCount = 20
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
const appName = app.globalData.appName

Page({
  // 初始数据
  data: {
    title: '动态',
    topicsList: [],
    authorTopicsList: [],
    isLastPage: false,
    isError: false,
    isLoading: false,
    isPull: false,
    page: 1,
    authorPage: 1,
    authorlistPage: 1,
    isLastAuthorPage: false,
    isLastAuthorListPage: false,
    forumId: '0',
    currentColumn: 0,
    forums: [],
    forum: {},

    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    shareTitle: appName + '-动态',
    pageTitle: '动态',
    showAddbtn: false,
    displayPostimage: true,
    displayInputContent: false,
    focus: false,
    placeholder: "说点什么...",
    toUserId: "",
    toFormId: "",
    commentdate: "",
    content: "",
    default_forum_id: 0,
    inputContentValue: '',
    isPlaying: 0,
    dataId: 0,

    topiclistAdId: "",
    topiclistAd: "",
    topiclistAdEvery: 0,
    listAdsuccess: true,
    videoAdId:"",

    authorList: [],
    curActiveKey: "one",
    oneTabOPen: true,
    twoTabOpen: false,
    fourTabOPen: false,

    isOneTabOPened: false,
    isTwoTabOpened: false,
    isFourTabOPened: false,
    popupShow:false,
    pageName:'social',
    isPostSuccess:false,
    publishTopicUserRight:"0",
    showPopPhone:false
  },

  // 页面加载
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    })
    var self=this;
    Auth.checkSession(app, API, self, 'isLoginLater', util)
   // Auth.setUserMemberInfoData(this)
    this.initData()
    Auth.checkLogin(this)
    wx.showShareMenu({
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline']
    }) 
  },

  // 点击播放时
  handlePlay: function (e) {
    var curIdx = e.currentTarget.id;
    var curIndex = e.currentTarget.index
    // 没有播放时播放视频
    if (!this.data.indexCurrent) {
      this.setData({
        indexCurrent: curIdx
      })
      var videoContext = wx.createVideoContext(curIdx, this)
      videoContext.play()
    } else { // 有播放时先暂停，再播放当前点击的
      var videoContextPrev = wx.createVideoContext(this.data.indexCurrent, this)
      if (this.data.indexCurrent != curIdx) {
        videoContextPrev.pause()
        this.setData({
          indexCurrent: curIdx
        })
        var videoContextCurrent = wx.createVideoContext(curIdx, this)
        videoContextCurrent.play()
      }
    }
  },


  // 点击暂停时
  handlePause: function (e) {
    let id = e.currentTarget.dataset.id;
    // 遍历视频数组，如果是当前点击的视屏，就把isplay属性改为false
    let newVideoList = this.data.videoList
    newVideoList = newVideoList.map(item => {
      if (item.id === id) {
        item.isPlay = false
      }
      return item
    })
    // 重新更新下data里的数据
    this.setData({
      videoList: newVideoList
    })
  },


  // 初始数据逻辑
  initData() {
    let systemInfo = wx.getSystemInfoSync()
    let screenRatio = 750 / systemInfo.windowWidth

    var self =this;
    self.setData({
      screenRatio: screenRatio,
      oneTabOPen: true,
      isOneTabOPened: true
    })   
    self.loadBBForums()
    backgroundAudioManager.onEnded(function () {
      self.setData({
        isPlaying: 0
      })
    })
  },

  // 页面显示
  onShow: function (options) {
    let self = this
    Auth.setUserMemberInfoData(self)
   // Auth.checkLogin(this)
   if (self.data.isPostSuccess) {
    self.onPullDownRefresh();
    self.setData({isPostSuccess:false})
  }
  },

  // 初次渲染完成
  onReady: function () {
    let self = this
    
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self = this
    Auth.checkLogin(this);
    var curActiveKey = self.data.curActiveKey
    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId
    var args = {}

    if (curActiveKey === 'one') {
      self.setData({
        page: 1,
        isLastPage: false
      })
      self.loadBBForums()
    } else if (curActiveKey === 'two') {
      args.authorPage = 1
      args.per_page = authorPageCount
      args.userId = userId
      args.sessionId = sessionId
      var authorTopicsList = []
      self.setData({ authorTopicsList: authorTopicsList, isLastAuthorPage: false,listAdsuccess:true })
      Adapter.loadMyfollowAuthorTopics(args, self, API)
    } else if (curActiveKey === 'four') {
      args.authorlistPage = 1
      args.per_page = authorListPageCount
      args.userId = userId
      args.sessionId = sessionId
      self.setData({ isLastAuthorListPage: false, authorList: [] })
      Adapter.loadAuthorList(args, self, API)
    }
  },

  // 上拉加载
  onReachBottom: function () {
    let args = {}
    var self = this
    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId
    var oneTabOPen = self.data.oneTabOPen
    var twoTabOpen = self.data.twoTabOpen
    var fourTabOpen = self.data.fourTabOpen

    if (oneTabOPen && !self.data.isLastPage) {
      args.page = self.data.page + 1
      args.forumId = self.data.forumId
      args.pageCount = pageCount
      args.isCategory = true
      args.userId = userId
      args.sessionId = sessionId      
      Adapter.loadBBTopics(args, this, API)
      
    } else if (twoTabOpen && !self.data.isLastAuthorPage) {
      args.authorPage = self.data.authorPage + 1
      args.per_page = authorPageCount
      args.userId = userId
      args.sessionId = sessionId    
      Adapter.loadMyfollowAuthorTopics(args, self, API)      
    } else if (fourTabOpen && !self.data.isLastAuthorListPage) {
      args.authorlistPage = self.data.authorlistPage + 1
      args.per_page = authorListPageCount
      args.userId = userId
      args.sessionId = sessionId     
      Adapter.loadAuthorList(args, self, API)
    }
  },

  // 分享
  onShareAppMessage: function () {
    let shareTitle = this.data.shareTitle
    return {
      title: shareTitle,
      path: 'pages/social/social'
    }
  },

  // 进入地图找帖
  toSocialMap() {
    var url = '../socialmap/socialmap';
    wx.navigateTo({
      url: url
    })
  },

  //切换Tab菜单
  changeTabs(e) {
    var self = this
    var curActiveKey = e.detail.activeKey
    var oneTabOPen = self.data.oneTabOPen
    var twoTabOpen = self.data.twoTabOpen
    var fourTabOPen = self.data.fourTabOPen
    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId
    var isOneTabOPened = self.data.isOneTabOPened
    var isTwoTabOpened = self.data.isTwoTabOpened
    var isFourTabOPened = self.data.isFourTabOPened
    var args = {}
    Auth.setUserMemberInfoData(self)

    self.setData({ curActiveKey: curActiveKey })
    if (curActiveKey == 'one') {
      self.setData({
        twoTabOpen: false,
        oneTabOPen: true,
        threeTabOpen: false
      })

      if (isOneTabOPened) {
        self.setData({
          page: 1,
          isLastPage: false
        })
        self.loadBBForums()
      }
    } else if (curActiveKey == 'two') {
      if (!isTwoTabOpened) {
        self.loadMyfollowAuthorTopics()
        self.setData({ isTwoTabOpened: true })
      } else {
        args.authorPage = 1
        args.per_page = authorPageCount
        args.userId = userId
        args.sessionId = sessionId
        var authorTopicsList = []
        self.setData({ authorTopicsList: authorTopicsList, isLastAuthorPage: false })
        Adapter.loadMyfollowAuthorTopics(args, self, API)
      }

      self.setData({
        twoTabOpen: true,
        oneTabOPen: false,
        threeTabOpen: false
      })
    }
    else if (curActiveKey == 'four') {
      if (!isFourTabOPened) {
        self.loadAuthorList();
        self.setData({ isFourTabOPened: true })

      }
      else {
        args.authorlistPage = 1;
        args.per_page = authorListPageCount;
        args.userId = userId;
        args.sessionId = sessionId;
        self.setData({ isLastAuthorListPage: false, authorList: [] })
        Adapter.loadAuthorList(args, self, API);
      }
      self.setData({
        twoTabOpen: false,
        oneTabOPen: false,
        threeTabOpen: true
      });
    }
  },

  // 点击圈子
  toQuanziList(e) {
    var id = e.currentTarget.dataset.forumid
    var url = '../sociallist/sociallist?forumId=' + id
    wx.navigateTo({
      url: url
    })
  },

  // 跳转帖子详情
  TopicDetail(e) {
    let sid = e.currentTarget.id
    let url = '../socialdetail/socialdetail?id=' + sid
    wx.navigateTo({
      url: url
    })
  },

  // 跳转全屏视频
  toFullVideo(e) {
    let src = e.currentTarget.dataset.src
    let url = `../full-video/full-video?src=${src}`
    wx.navigateTo({
      url
    })
  },

  // 搜索
  openSearch() {
    var url = '../search/search?postype=topic';
    wx.navigateTo({
      url: url
    })
  },

  // 加载帖子列表
  loadBBForums() {
    var self = this
    var forums = []

    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId

    self.setData({
      isPull: true,
      isError: false,
      topicsList: [],
      forums: []
    })

    var args ={};
    args.userId=userId;
    args.sessionId=sessionId

    API.getBBForums(args).then(res => {
      var raw_enable_newtopic_option = '0'
      var raw_enable_newtopic_integral = 0
      var default_forum_id = 0
      var raw_default_videoposter_image = ''

      if (res.length && res.length > 0) {
        forums = forums.concat(res);
        self.setData({
          forums: forums
        })

        default_forum_id = parseInt(forums[0].default_forum_id)
        raw_default_videoposter_image = forums[0].raw_default_videoposter_image;
        raw_enable_newtopic_option = forums[0].raw_enable_newtopic_option;
        var publishTopicUserRight = forums[0].publishTopicUserRight;
        var min_posttopic_user_memberName=forums[0].min_posttopic_user_memberName;

        raw_enable_newtopic_integral = parseInt(forums[0].raw_enable_newtopic_integral)

        let data = {}
        data.page = self.data.page
        data.pageCount = pageCount

        data.forumId = '0'
        data.isCategory = true
        data.userId = userId
        data.sessionId = sessionId
        Adapter.loadBBTopics(data, self, API)

        if (raw_enable_newtopic_option == "1") {
          self.setData({
            showAddbtn: true,
            forumId: '0',
            default_forum_id: default_forum_id,
            raw_default_videoposter_image: raw_default_videoposter_image,
            publishTopicUserRight:publishTopicUserRight,
            min_posttopic_user_memberName:min_posttopic_user_memberName})
        } else {
          self.setData({
            showAddbtn: false,
            publishTopicUserRight:publishTopicUserRight,
            min_posttopic_user_memberName:min_posttopic_user_memberName
          })
        }
      } else {
        wx.showToast({
          title: res,
          duration: 1500
        })
      }
    })

    wx.stopPullDownRefresh()
  },

  // 加载关注的帖子列表
  loadMyfollowAuthorTopics(e) {
    let data = {}
    var self = this
    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId

    data.authorPage = self.data.authorPage
    data.per_page = authorPageCount
    data.userId = userId
    data.sessionId = sessionId
    Adapter.loadMyfollowAuthorTopics(data, self, API)
  },

  // 加载作者列表
  loadAuthorList(e) {
    let data = {}
    let self = this
    let sessionId = self.data.userSession.sessionId
    let userId = self.data.userSession.userId

    data.userId = userId
    data.sessionId = sessionId
    data.per_page = authorListPageCount
    data.authorlistPage = 1
    Adapter.loadAuthorList(data, self, API)
  },

  // 去作者主页
  redictAuthorDetail(e) {
    var authorId = e.currentTarget.id
    var url = '../author/author?userid=' + authorId + '&postype=topic'
    wx.navigateTo({
      url: url
    })
  },

  // 发布动态
  sendPost() {
    var self = this
    if (!self.data.userSession.sessionId) {
      self.setData({
        isLoginPopup: true
      })
    } else {
      var publishTopicUserRight=self.data.publishTopicUserRight;
      var min_posttopic_user_memberName=self.data.min_posttopic_user_memberName;
      if(publishTopicUserRight=="0")
      {
        //Adapter.toast("权限不足,需"+min_posttopic_user_memberName+"及以上等级方可发表回复。", 5000)
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
        
        return;
      }
      var forumId = self.data.default_forum_id
      var raw_default_videoposter_image = self.data.raw_default_videoposter_image
      this.setData({
        displayPostimage: true,
        displayInputContent: false
      })

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
              title: '用户参数错误，请点击我的页面"清除缓存"后再次登录',
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
          var url = '../../pages/postopic/postopic?forumid=' + forumId + '&videoposter=' + raw_default_videoposter_image
          wx.navigateTo({
            url: url
          })
  
        }
      })

      
    }
  },

  //显示输入框
  showCommentInputDialog() {
    var self = this
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true })
    } else {
      this.setData({
        displayPostimage: false,
        displayInputContent: true
      })
    }
  },

  //隐藏输入框
  hiddenCommentInputDialog() {
    this.setData({
      displayPostimage: true,
      displayInputContent: false
    })
  },

  // 点赞
  postLike(e) {
    var self = this
    var id = e.currentTarget.id
    var listType = e.currentTarget.dataset.listtype;
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true })
    } else {
      Adapter.postLike(id, self, app, API, listType)
    }
  },

  // 打开登录框
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

  // 用户同意授权
  agreeGetUser(e) {
    let self = this
    Auth.checkAgreeGetUser(e, app, self, API, '0')
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

  // 打开文档
  open_link_doc(e) {
    var self = this
    var url = e.currentTarget.dataset.filelink
    var fileType = e.currentTarget.dataset.filetype

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

  // 播放音频
  playRemoteAudio(e) {
    var self = this
    var audioUrl = e.currentTarget.dataset.audiourl
    var dataId = e.currentTarget.dataset.id
    backgroundAudioManager.src = audioUrl
    backgroundAudioManager.title = "录音"
    self.setData({
      isPlaying: 1,
      dataId: dataId
    })
  },

  // 停止播放
  stopRemoteAudio(e) {
    backgroundAudioManager.stop()
    var dataId = e.currentTarget.dataset.id
    this.setData({
      isPlaying: 0,
      dataId: dataId
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
      scale: 10,
      name: address
    })
  },

  // 关注
  followAuthor(e) {
    var self = this
    this.setData({
      userSession: wx.getStorageSync('userSession')
    })

    var sessionId = self.data.userSession.sessionId
    var userId = self.data.userSession.userId
    var flag = e.currentTarget.dataset.follow
    var authorid = parseInt(e.currentTarget.dataset.authorid)
    var listType = e.currentTarget.dataset.listtype
    if (!sessionId || !userId) {
      self.setData({
        isLoginPopup: true
      })
      return
    }

    var args = {}
    args.userId = userId
    args.sessionId = sessionId
    args.id = authorid
    args.flag = flag
    args.listType = listType
    Adapter.userFollow(API, self, args)
  },

  zanAuthor(e) {
    var zanimage = e.currentTarget.dataset.zanimage
    wx.previewImage({
      current: zanimage,
      urls: [zanimage]
    })
  },

  // 删除话题
  deleteTopic(e) {
    var self = this
    var id = e.currentTarget.id
    var data = {}
    var userId = self.data.userSession.userId
    var sessionId = self.data.userSession.sessionId
    var deletetype = 'publishStatus'
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000)
      return
    }

    data.id = id
    data.userid = userId
    data.sessionid = sessionId
    data.deletetype = deletetype
    var posttype = 'topic'
    wx.z.showDialog({
      type: "confirm",
      title: "提示",
      confirmText: "确认",
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
              })
            }else {
              self.setData({
                page: 1,
                isLastPage: false
              })
              self.loadBBForums()
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

  onHidePupopTap(e){
    this.setData({popupShow:false})
  },

  showPupop(e){
    var args= {};
    var self=this; 
    this.setData({popupShow:true})
  },

  postsub: function (e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      
    }
    else {
    var extid=e.currentTarget.dataset.id;
    var subscribetype = 'categorySubscribe';
    var subscribemessagesid = e.currentTarget.dataset.subid;
    Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid,extid,util);
    }
      
  },

  adbinderror(e) {
    var self = this  
    if (e.detail.errCode) {
      self.setData({
        listAdsuccess: false
      })
    }
  },
  submitPage:function(e) {
    var self = this;
    var id = e.currentTarget.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var posttype = 'topic';
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.posttype = posttype;
   
    wx.lin.showDialog({
      type: "confirm",
      title: "标题",
      showTitle: false,
      confirmText: "确认",
      confirmColor: "#f60",
      content: "确认提交？",
      success: (res) => {
        if (res.confirm) {
          API.submitPageById(data).then(res => {
            if (res.code) {
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
                duration: 3000,
                success: function () {
                  var topicsList=self.data.topicsList;
                  var _topicsList=[];

                  topicsList.forEach(post => {

                    if(post.id==id)
                    {                      
                      post.searhDataPostCount=parseInt(post.searhDataPostCount)+1;
                    }    
                    _topicsList.push(post);       
    
                  });    
                  self.setData({topicsList:_topicsList});                

                }
              });
            }

          })

        } 
      }
    })
  },
  getPhoneNumber(e) {
    Adapter.getPhoneNumber(e,this,API,Auth);
  },
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }
})

