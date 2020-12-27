// 动态列表组件
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

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: 'قوناقلىق',
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
    shareTitle: appName + '-قوناقلىق',
    pageTitle: 'قوناقلىق',
    showAddbtn: false,
    displayPostimage: true,
    displayInputContent: false,
    focus: false,
    placeholder: "مەزمۇننى يىزىڭ...",
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
    videoAdId: "",

    authorList: [],
    curActiveKey: "one",
    oneTabOPen: true,
    twoTabOpen: false,
    fourTabOPen: false,

    isOneTabOPened: false,
    isTwoTabOpened: false,
    isFourTabOPened: false,
    popupShow: false,
    pageName: 'social',
    isPostSuccess: false,
    publishTopicUserRight: "0",
    showPopPhone: false
  },

  /**
   * 组件布局完成
   */
  ready() {},

  /**
   * 组件的方法列表
   */
  methods: {

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
        var publishTopicUserRight = self.data.publishTopicUserRight;
        var min_posttopic_user_memberName = self.data.min_posttopic_user_memberName;
        if (publishTopicUserRight == "0") {
          //Adapter.toast("权限不足,需"+min_posttopic_user_memberName+"及以上等级方可发表回复。", 5000)
          wx.lin.showDialog({
            type: "confirm",
            title: "ماۋزۇ",
            showTitle: false,
            confirmText: "ماقۇل",
            confirmColor: "#f60",
            content: "权限不足,需" + min_posttopic_user_memberName + "及以上等级方可发表回复。是否去赚积分提高等级?",
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
                title: 'مىنىڭ دىگەن بەتتىكى قالدۇق تازلاشنى بىسىپ قالدۇق تازلاڭ',
                icon: 'none',
                duration: 3000
              })
              self.setData({ showPopPhone: false })
              return
            }
            self.setData({ showPopPhone: true })
          }
          else {
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
        Adapter.toast('تىزىملىتىپ كىرگەندىن كىيىن داۋاملاشتۇرۇڭ', 3000)
        return
      }

      data.id = id
      data.userid = userId
      data.sessionid = sessionId
      data.deletetype = deletetype
      var posttype = 'topic'
      wx.z.showDialog({
        type: "confirm",
        title: "ئەسكەرتىش",
        confirmText: "ماقۇل",
        content: "ئۆچۈرەمسىز؟",
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
              } else {
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
        Adapter.toast('تىزىملىتىپ كىرگەندىن كىيىن داۋاملاشتۇرۇڭ', 3000)
        return
      }

      wx.lin.showDialog({
        type: "confirm",
        title: "发送新内容订阅消息",
        showTitle: true,
        confirmText: "ماقۇل",
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

    onHidePupopTap(e) {
      this.setData({ popupShow: false })
    },

    showPupop(e) {
      var args = {};
      var self = this;
      this.setData({ popupShow: true })
    },

    postsub: function (e) {
      var self = this;
      if (!self.data.userSession.sessionId) {
        Auth.checkSession(app, API, self, 'isLoginNow', util);

      }
      else {
        var extid = e.currentTarget.dataset.id;
        var subscribetype = 'categorySubscribe';
        var subscribemessagesid = e.currentTarget.dataset.subid;
        Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid, util);
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
    submitPage: function (e) {
      var self = this;
      var id = e.currentTarget.id;
      var data = {};
      var userId = self.data.userSession.userId;
      var sessionId = self.data.userSession.sessionId;
      var posttype = 'topic';
      if (!sessionId || !userId) {
        Adapter.toast('تىزىملىتىپ كىرىڭ', 3000);
        return;
      }
      data.id = id;
      data.userid = userId;
      data.sessionid = sessionId;
      data.posttype = posttype;

      wx.lin.showDialog({
        type: "confirm",
        title: "ماۋزۇ",
        showTitle: false,
        confirmText: "ماقۇل",
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
                    var topicsList = self.data.topicsList;
                    var _topicsList = [];

                    topicsList.forEach(post => {

                      if (post.id == id) {
                        post.searhDataPostCount = parseInt(post.searhDataPostCount) + 1;
                      }
                      _topicsList.push(post);

                    });
                    self.setData({ topicsList: _topicsList });

                  }
                });
              }

            })

          }
        }
      })
    },
    getPhoneNumber(e) {
      Adapter.getPhoneNumber(e, this, API, Auth);
    }
  }
})
