const API = require("../../../../utils/api.js");
const Auth = require("../../../../utils/auth.js");
const Adapter = require("../../../../utils/adapter.js");
const util = require("../../../../utils/util.js");
import config from "../../../../utils/config.js";
const app = getApp();
const appName = app.globalData.appName

Page({
  // 初始数据
  data: {
    mediaList: [],
    userSession: {}, // 用户
    wxLoginInfo: {},
    memberUserInfo: {},
    userInfo: {},
    page: {
      index: 1,
      size: 5
    },

    indexCurrent: null,
    pageName: "media-list",
    mediatype: "",
    pageTitle: appName
  },

  // 页面加载
  onLoad: function(options) {
    var self = this;
    var mediatype = options.mediatype;
    self.setData({ mediatype: mediatype });
    Auth.checkSession(app, API, self, "isLoginLater", util);
    this.initData(mediatype);
    Auth.checkLogin(self);

    wx.setNavigationBarTitle({
      title: mediatype === "image" ? "图文" : "视频"
    });

    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    let mediatype = this.data.mediatype
    let title = ''

    if (mediatype === 'image') title = '精彩图文'
    if (mediatype === 'video') title = '精彩视频'

    return {
      title: this.data.pageTitle + '-' + title,
      query: {
        mediatype
      }
    }
  },

  // 分享
  onShareAppMessage: function(e) {
    let self = this
    let path = ''
    let id = ''
    let type = ''
    let title = ''
    let img = ''

    if (e.from === "button") {
      id = e.target.dataset.id
      type = e.target.dataset.type
      title = e.target.dataset.title
      img = e.target.dataset.img

      if (type === "post") {
        path = "/pages/detail/detail?id=" + id;
      } else if (type === "topic") {
        path = "/pages/socialdetail/socialdetail?id=" + id
      }
    } else {
      let mediatype = self.data.mediatype
      if (mediatype === "image") {
        path = "/pages/common/media-center/media-list/media-list?mediatype=" + mediatype
        title = "精彩图文，与君共赏"
      } else if (mediatype === "video") {
        path = "/pages/common/media-center/media-list/media-list?mediatype=" + mediatype
        title = "精彩视频，与君共赏"
      }
    }

    return {
      title,
      path,
      imageUrl: img
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    let page = this.data.page;
    page.index = 1;
    var mediatype = this.data.mediatype;

    this.setData({
      mediaList: [],
      page
    });

    this.getListData(mediatype);
  },

  // 上拉加载
  onReachBottom: function() {
    this.data.page.index++;
    var mediatype = this.data.mediatype;
    this.getListData(mediatype);
  },

  postLike: function(e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var postParentType = e.currentTarget.dataset.postparenttype;
    var detailName = "media-list";
    if (!self.data.userSession.sessionId) {
      self.setData({ isLoginPopup: true });
    } else {
      Adapter.postLike(id, self, app, API, detailName);
    }
  },

  // 初始数据逻辑
  initData(mediatype) {
    this.getListData(mediatype);
  },

  // 获取数据
  getListData(mediatype) {
    var index = this.data.page.index;

    let args = {
      per_page: this.data.page.size,
      page: index,
      userId: this.data.userSession.userId,
      sessionId: this.data.userSession.sessionId,
      mediatype: mediatype
    };

    API.getMedia(args).then(res => {
      let list = this.data.mediaList;

      if (res.length) {
        list.push(...res);
      }

      this.setData({
        mediaList: list
      });

      wx.stopPullDownRefresh();
    });
  },

  // 预览图片
  previewImage(e) {
    let imgList = e.currentTarget.dataset.imglist;
    let imgSrc = e.currentTarget.dataset.imgsrc;

    wx.previewImage({
      current: imgSrc,
      urls: imgList
    });
  },

  // 点击播放时
  handlePlay(e) {
    var curIdx = e.currentTarget.id;
    var curIndex = e.currentTarget.index;
    // 没有播放时播放视频
    if (!this.data.indexCurrent) {
      this.setData({
        indexCurrent: curIdx
      });
      var videoContext = wx.createVideoContext(curIdx, this);
      videoContext.play();
    } else {
      // 有播放时先暂停，再播放当前点击的
      var videoContextPrev = wx.createVideoContext(
        this.data.indexCurrent,
        this
      );
      if (this.data.indexCurrent != curIdx) {
        videoContextPrev.pause();
        this.setData({
          indexCurrent: curIdx
        });
        var videoContextCurrent = wx.createVideoContext(curIdx, this);
        videoContextCurrent.play();
      }
    }
  },

  // 点击暂停时
  handlePause(e) {
    let id = e.currentTarget.dataset.id;
    // 遍历视频数组，如果是当前点击的视屏，就把isplay属性改为false
    let newVideoList = this.data.mediaList;
    newVideoList = newVideoList.map(item => {
      if (item.id === id) {
        item.isPlay = false;
      }
      return item;
    });
    // 重新更新下data里的数据
    this.setData({
      mediaList: newVideoList
    });
  },

  // 去作者主页
  toAuthor(e) {
    let id = e.currentTarget.dataset.id;
    let path = `/pages/author/author?userid=${id}`;

    wx.navigateTo({
      url: path
    });
  },

  // 去内容详情
  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let path = "";

    if (type === "post") {
      path = "/pages/detail/detail?id=" + id;
    } else if (type === "topic") {
      path = "/pages/socialdetail/socialdetail?id=" + id;
    }

    wx.navigateTo({
      url: path
    });
  },
  agreeGetUser: function(e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, "0");
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
  }
});
