/*
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const pageCount = 10

const options = {
  data: {
    isArticlesList: true,
    isLastPage: false,
    isLoading: false,
    isCategory: false,
    isError: false,
    isPull: false,
    isWiper: false,
    isTags: false,
    categories: '',
    swiperArticles: [],
    articlesList: [],
    billboardList: [],
    page: 1,

    pageTitle: 'باشبەت',
    articleStyle: '',
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    topNav: [],
    columns: [],
    isColumnPannelOpen: !1,
    columnsSelected: [],
    columnsUnselected: [],
    currentMovingIndex: -1,
    moveToIndex: -1,
    columnItemHeight: 60,
    isInEdit: !1,
    showRefreshTipBtn: !1,
    scrollTop: [],
    windowHeight: 0,
    windowWidth: 0,
    tagsList: [],
    commentsList: [],
    homepageAd: '0',
    homepageAdId: '',
    homepageAdsuccess: true,
    listAdsuccess: true,
    homepageMediaDisplay: false,
    isFirst: false, // 是否第一次打开,

    scopeSubscribeMessage: '',
    isLoginPopup: false,
    pageName: "index",
    isPostSuccess: false,
    Settings: {},
    showAfficialAccount: false,

    banner: {},
    tabBarRedDotIndex:config.getTabBarRedDotIndex,
    productsNav: [],
    showPopPhone: false
  },

  onLoad: function (option) {
    this.getSwiperData()
    this.getShopSetting()
    this.setPageInfo()
    this.changeListStyle()

    var args = {};
    var self = this;
    var LaunchOptions = wx.getLaunchOptionsSync();
    var scene = LaunchOptions['scene'];

    if (scene == 1001 || scene == 1047 || scene == 1124 || scene == 1089 || scene == 1038 || scene == 1011 || scene == 1017) {
      self.setData({ showAfficialAccount: true })
    }

    Auth.checkSession(app, API, self, 'isLoginLater', util);
    args.pageCount = pageCount;
    args.cateType = 'all';
    args.userId = self.data.userSession.userId;
    args.sessionId = self.data.userSession.sessionId;
    Adapter.loadCategories(args, self, API, true);
    var currentColumn = 0;
    self.setData({
      currentColumn: currentColumn,
      categoryId: '0'
    });

    Adapter.getSettings(self, API);   
    Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    self.loadBillboard();
    // 判断用户是不是第一次打开，弹出添加到我的小程序提示
    var isFirstStorage = wx.getStorageSync('isFirst');
    if (!isFirstStorage) {
      self.setData({
        isFirst: true
      });
      wx.setStorageSync('isFirst', 'no')
      setTimeout(function () {
        self.setData({
          isFirst: false
        });
      }, 5000)
    }

    // 设置系统分享菜单
    wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
    })

    if (option.frompage == "detail") {
      var id = option.id;
      wx.navigateTo({
        url: "/pages/detail/detail?id=" + id
      })
    }
  },

  // 自定义分享朋友圈
  onShareTimeline: function () {
    let txt = getApp().globalData.appDes
    let name = getApp().globalData.appName
    return {
      title: name + '-' + txt
    }
  },

  // 分享
  onShareAppMessage: function () {
    let imageUrl = this.data.Settings.raw_default_share_image
    let txt = getApp().globalData.appDes
    let name = getApp().globalData.appName

    return {
      title: name + '-' + txt,
      path: '/pages/index/index',
      imageUrl
    }
  },

  onShow: function () {
    let self = this;
    var showAddbtn = false;
    wx.setStorageSync('openLinkCount', 0);
    if (parseInt(self.data.memberUserInfo.level) > 0) {
      showAddbtn = true;
    }
    self.setData({
      showAddbtn: showAddbtn
    });
    wx.getSystemInfo({
      success: function (t) {
        self.setData({
          windowHeight: t.windowHeight,
          windowWidth: t.windowWidth

        })
      }
    })

    var nowDate = new Date();
    nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    nowDate = new Date(nowDate).getTime();
    var _openAdLogs = wx.getStorageSync('openAdLogs') || [];
    var openAdLogs = [];
    _openAdLogs.map(function (log) {
      if (new Date(log["date"]).getTime() >= nowDate) {
        openAdLogs.unshift(log);
      }

    })

    wx.setStorageSync('openAdLogs', openAdLogs);
    if (self.data.isPostSuccess) {
      self.onPullDownRefresh(self.data.isPostSuccess);
      self.setData({ isPostSuccess: false })
    }

    var data = {};
    if (self.data.userSession.sessionId) {
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      data.messagetype = "all";
      Adapter.getMessageCount(self, data, API);
    }
  },

  onPullDownRefresh: function (e) {
    this.setData({
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      isLastPage: false,
      swiperArticles: [],
      articlesList: [],
      homepageAdsuccess: true,
      listAdsuccess: true
    })
    let args = {};
    if (this.data.currentColumn == 0) {
      // this.loadSwiper();
      this.getSwiperData();
      this.getShopSetting()
      args.userId = this.data.userSession.userId;
      args.sessionId = this.data.userSession.sessionId;
      args.pageCount = pageCount;
      args.cateType = 'all'
      Adapter.loadCategories(args, this, API, true, true);
    } else {
      args = {};
      if (e) {
        args.userId = this.data.userSession.userId;
        args.sessionId = this.data.userSession.sessionId;
        args.cateType = 'all'
        Adapter.loadCategories(args, this, API, true, true);
      }
      else {

        args.page = 1;
        args.pageCount = pageCount;
        args.isCategory = this.data.isCategory;
        args.categoryId = this.data.categoryId;
        args.categoryIds = this.data.categoryIds;
        Adapter.loadArticles(args, this, API, true);

      }


    }
    // this.fetchCommentsData();
    Auth.setUserMemberInfoData(this);
  },

  onReachBottom: function () {
    let args = {};
    if (!this.data.isLastPage && !this.data.isLoading) {
      args.page = this.data.page + 1;
      args.pageCount = pageCount;
      args.isCategory = this.data.isCategory;
      args.categoryId = this.data.categoryId;
      args.categoryIds = this.data.categoryIds;
      Adapter.loadArticles(args, this, API);
    }
  },

  // 动态设置页面信息
  setPageInfo() {
    let app=getApp();
    let title = app.globalData.appName

    if(title) {
      wx.setNavigationBarTitle({
        title
      })
    }
    
    this.setData({      
      pageTitle: title
    })
  },

  // 获取轮播和精选栏目
  getSwiperData() {
    const http = API.getHomeConfig()

    http.then(res => {
      const data = res;
      let swiperArticles = data.expand.swipe_nav || []
      let topNav = data.expand.selected_nav || []
      let showMedia = data.raw_homepage_media_display === '1'
      let banner = data.expand.home_list_top_nav

      this.setData({
        swiperArticles,
        topNav: this.splitArray(topNav, 4),
        homepageMediaDisplay: showMedia,
        banner
      })
    })
  },

  // 按倍数分割数组
  splitArray(arr, b) {
    // arr 数组  b 切割比例
    let num = 0
    let list = []
    for (let i = 0; i < arr.length; i++) {
      if (i % b === 0 && i !== 0) {
        list.push(arr.slice(num, i))
        num = i
      }
      if ((i + 1) === arr.length) {
        list.push(arr.slice(num, (i + 1)))
      }
    }
    return list
  },

  async getShopSetting() {
    const res = await app.$api.getShopSetting()
    let list = res.shop_selected_products_nav || []

    this.setData({
      productsNav: list
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

  // 轮播图片
  loadSwiper() {
    const self = this;
    API.getSwiperPosts().then(response => {
      if (response.posts.length > 0) {
        self.setData({
          swiperArticles: self.data.swiperArticles.concat(response.posts.map(function (item) {
            return item;
          })),
          isWiper: true,
          homepageAd: response.homepageAd,
          homepageAdId: response.homepageAdId,
          homepageMediaDisplay: response.homepageMediaDisplay == '1' ? true : false
        });
      } else {
        self.setData({
          isWiper: false
        });
      }
    }).catch(err => {
      this.setData({

        isPull: false,
        isWiper: false
      })
      wx.stopPullDownRefresh()
    })
  },

  //获取最新评论数据
  fetchCommentsData() {
    var self = this
    let args = {};
    // 设置最新评论显示的条数
    args.limit = 2;
    args.page = 1;
    args.flag = "newcomment"
    self.setData({
      commentsList: []
    })
    Adapter.loadComments(args, this, API);
  },

  // 点击评论跳转至查看文章详情
  commentRedictDetailn(e) {
    var id = e.currentTarget.dataset.postid
    var url = '../detail/detail?id=' + id
    wx.navigateTo({
      url
    })
  },

  //首页图标跳转
  onNavRedirect(e) {
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    var extraData = e.currentTarget.dataset.extraData == null ? '' : e.currentTarget.dataset.extraData;
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webview/webview?url=' + url;
      wx.navigateTo({
        url: url
      })
    }

  },

  // 跳转至查看文章详情
  redictDetail(e) {
    Adapter.redictDetail(e, "post");
  },

  loadBillboard() {
    var data = {};
    data.pageCount = 5;
    data.page = 1;
    data.listName = 'billboardList';
    data.isCategory = true;
    var billboardList = [];

    API.getPosts(data).then(res => {
      if (res.length && res.length > 0) {
        billboardList = res;
        this.setData({
          billboardList: billboardList
        });

      }

    })

  },

  removeArticleChange() {
    // NC.removeNotification("articleChange", this)
  },

  addArticle() {
    let self = this
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
      } else {
        var videoposter = self.data.articlesList[0].raw_default_videoposter_image;
        var url = '../addarticle/addarticle?videoposter=' + videoposter;
        wx.navigateTo({
          url: url
        })
      }
    })
  },

  openSearch() {
    var url = '../search/search?postype=article';
    wx.navigateTo({
      url: url
    })
  },

  //媒体中心
  goalbum() {
    var url = '/pages/common/media-center/photolist/photolist';
    wx.navigateTo({
      url: url
    })
  },

  govideo() {
    var url = '/pages/common/media-center/media-list/media-list?mediatype=video';
    wx.navigateTo({
      url: url
    })
  },

  goimage() {
    var url = '/pages/common/media-center/media-list/media-list?mediatype=image';
    wx.navigateTo({
      url: url
    })
  },
  gofile() {
    var url = '/pages/common/media-center/filelist/filelist';
    wx.navigateTo({
      url: url
    })
  },
  goaudio() {
    var url = '/pages/common/media-center/audiolist/audiolist';
    wx.navigateTo({
      url: url
    })
  },

  // 选择文章列表样式
  changeListStyle(e) {
    let val = wx.getStorageSync('articleStyle')
    let articleStyle = e ? e.detail.value : (val ? val : config.articleStyle)

    wx.setStorageSync('articleStyle', articleStyle)
    let isOpen = this.data.isColumnPannelOpen

    this.setData({
      articleStyle,
      // articlesList: [],
      isColumnPannelOpen: isOpen ? !isOpen : isOpen
    })

    console.log(this.data.articleStyle)
    // 重新请求下数据
    // let args = {
    //   page: 1,
    //   pageCount,
    //   cateType: 'all'
    // }
    // Adapter.loadCategories(args, this, API, true)
  },

  pannelData: {
    columns: [],
    needRefreshAfterClose: !1,
    touchX: 0,
    touchY: 0
  },

  openCustomPannel() {
    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : -1;
    if (this.data.isColumnPannelOpen && this.pannelData.needRefreshAfterClose) {

      this.setData({
        isColumnPannelOpen: !1,
        columns: this.data.columnsSelected.slice(0),
        currentColumn: -1 == e ? 0 : e,
        // columnSliders: [],
        // columnNews: [],
        // isInEdit: !1
      });
      this.pannelData.needRefreshAfterClose = !1;

    }
    //  this.getListData(!0, this.data.currentColumn), this.pannelData.needRefreshAfterClose = !1, 
    // this.saveColumnSortState()) 
    else {

      this.setData({
        isColumnPannelOpen: !this.data.isColumnPannelOpen,
        isInEdit: !this.data.isColumnPannelOpen && this.data.isInEdit,
        currentColumn: -1 == e ? this.data.currentColumn : e
      });

    }

    var showAddbtn = false;
    if (parseInt(this.data.memberUserInfo.level) > 0 && this.data.currentColumn != 0) {
      showAddbtn = true;

    }
    this.setData({
      showAddbtn: showAddbtn
    });


  },
  switchColumn(t) {
    var e = t.currentTarget.dataset.idx;
    var categoryId = t.currentTarget.dataset.categoryid;
    var categoryIds = t.currentTarget.dataset.categoryids;
    var _categoryId = this.data.categoryId;
    if (_categoryId == categoryId) {
      return;
    }
    this.setData({
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      isLastPage: false,
      swiperArticles: [],
      articlesList: []
    })
    var args = {};
    args.page = 1;
    if (categoryId == '0') {
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
      // this.loadSwiper();
      this.getSwiperData()
      this.getShopSetting()
    } else {
      wx.setNavigationBarTitle({
        //title: t.currentTarget.dataset.categorynames
        title: t.currentTarget.dataset.categoryname
      });
    }
    args.categoryId = categoryId;
    args.categoryIds = categoryIds;
    args.isCategory = true;
    this.setData({
      currentColumn: e,
      isCategory: args.isCategory,
      categoryId: categoryId,
      categoryIds: categoryIds
    });
    var showAddbtn = false;
    if (parseInt(this.data.memberUserInfo.level) > 0 && this.data.currentColumn != 0) {
      showAddbtn = true;
    }
    this.setData({
      showAddbtn: showAddbtn
    });
    Adapter.loadArticles(args, this, API, true);
  },
  selectColumn(t) {
    var e = t.currentTarget.dataset.index;
    this.setData({
      isPull: true,
      isError: false,
      isWiper: false,
      isArticlesList: false,
      swiperArticles: [],
      articlesList: [],
      //articleStyle: wx.getStorageSync()
    })
    //var e = t.currentTarget.dataset.idx;
    var categoryId = t.currentTarget.dataset.categoryid;
    var categoryIds = t.currentTarget.dataset.categoryids;

    // this.other.isSwitchColumn || e == this.data.currentColumn || (this.other.isSwitchColumn = !0, 
    // );
    var args = {};
    args.page = 1;
    if (categoryId == '0') {
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
      // this.loadSwiper();
      this.getSwiperData()
      this.getShopSetting()
    } else {
      wx.setNavigationBarTitle({
        title: t.currentTarget.dataset.categoryname
      });
    }
    args.categoryId = categoryId;
    args.categoryIds = categoryIds;
    args.isCategory = true;
    this.setData({
      isCategory: true,
      categoryId: categoryId,
      categoryIds: categoryIds

    });
    this.openCustomPannel(t, e);
    Adapter.loadArticles(args, this, API);



  },
  openCustomPannel: function (t) {
    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : -1;
    if (this.data.isColumnPannelOpen && this.pannelData.needRefreshAfterClose) {
      this.setData({
        isColumnPannelOpen: !1,
        columns: this.data.columnsSelected.slice(0),
        currentColumn: -1 == e ? 0 : e,
        // columnSliders: [],
        // columnNews: [],
        // isInEdit: !1
      });
    }
    // , this.getListData(!0, this.data.currentColumn), this.pannelData.needRefreshAfterClose = !1, 
    // this.saveColumnSortState())
    else {
      this.setData({
        isColumnPannelOpen: !this.data.isColumnPannelOpen,
        //isInEdit: !this.data.isColumnPannelOpen && this.data.isInEdit,
        currentColumn: -1 == e ? this.data.currentColumn : e
      });

    }


  },
  columnItemTouchEnd: function (t) {
    if (!(this.data.currentMovingIndex <= 0)) {
      var e = this;
      e.pannelData.columns = [], e.setData({
        currentMovingIndex: -1,
        moveToIndex: -1
      });
    }
  },
  columnItemTouchStart: function (t) {
    var e = t.currentTarget.dataset.index;
    if (e > 0 && e < this.data.columnsSelected.length) {
      this.setData({
        currentMovingIndex: e,
        moveToIndex: e
      }), this.pannelData.columns = this.data.columnsSelected.slice(0);
      var n = this.px2Rpx(t.touches[0].pageX),
        a = this.px2Rpx(t.touches[0].pageY);
      this.pannelData.touchX = n, this.pannelData.touchY = a;
    }
  },
  homepageAdbinderror: function (e) {
    var self = this;
    if (e.errCode) {
      self.setData({
        homepageAdsuccess: false
      })

    }
  },
  homepageAdLoad: function (e) {
    this.setData({
      homepageAdsuccess: true
    })
  },

  homepageAdClose: function (e) {
    this.setData({
      homepageAdsuccess: false
    })
  },

  adbinderror: function (e) {
    var self = this;
    if (e.detail.errCode) {
      self.setData({
        listAdsuccess: false
      })
    }

  },

  deleteTopic: function (e) {
    var self = this;
    var id = e.detail.currentTarget.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var deletetype = 'publishStatus';
    if (!sessionId || !userId) {
      Adapter.toast('تىزىملىتىپ كىرىڭ', 3000);
      return;
    }
    data.id = id;
    data.userid = userId;
    data.sessionid = sessionId;
    data.deletetype = deletetype;
    var posttype = 'topic'
    wx.lin.showDialog({
      type: "confirm",
      title: "ماۋزۇ",
      showTitle: false,
      confirmText: "ماقۇل",
      confirmColor: "#f60",
      content: "ئۆچۈرەمسىز؟",
      success: (res) => {
        if (res.confirm) {
          API.deletePostById(data).then(res => {
            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            } else {
              self.onPullDownRefresh();
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }

          })

        } else if (res.cancel) {


        }
      }
    })

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

  // 点击关闭添加到我的小程序提示框
  shutAddMyMiniapp() {
    this.setData({
      isFirst: false
    })
  },

  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');
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

  // 发送订阅消息
  sendSubscribeMessage(e) {
    var self = this
    var id = e.detail.currentTarget.id
    var author = e.detail.currentTarget.dataset.author
    var title = e.detail.currentTarget.dataset.title
    var data = {}

    var userId = self.data.userSession.userId
    var sessionId = self.data.userSession.sessionId

    if (!sessionId || !userId) {
      Adapter.toast('تىزىملىتىپ كىرگەندىن كىيىن داۋاملاشتۇرۇڭ', 3000)
      return
    }

    wx.lin.showDialog({
      type: "confirm",
      title: "يېڭىلىنىش ئۇقتۇرىشى",
      showTitle: true,
      confirmText: "ماقۇل",
      confirmColor: "#f60",
      content: "مۇقىملاشتۇرامسىز؟",
      success: (res) => {
        if (res.confirm) {
          var res = Adapter.sendSubscribeMessage(self, id, author, title, 'post', API).then(res => {
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

  officialSucc: function (e) {
    // if(e.detail.status==0)
    // {
    //   this.setData({showAfficialAccount:false})
    // }
  },

  officialFail: function (e) {
    this.setData({ showAfficialAccount: false })
  },

  submitPage: function (e) {
    var self = this;
    var id = e.detail.currentTarget.id;
    var data = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var posttype = 'post';
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
      content: "يوللامسىز؟",
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
                  var articlesList = self.data.articlesList;
                  var _articlesList = [];

                  articlesList.forEach(post => {

                    if (post.id == id) {
                      post.searhDataPostCount = parseInt(post.searhDataPostCount) + 1;
                    }
                    _articlesList.push(post);

                  });
                  self.setData({ articlesList: _articlesList });

                }
              });
            }

          })

        } 
      }
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
}

Page(options)