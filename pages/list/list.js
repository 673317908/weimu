const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const util = require('../../utils/util.js');
const Adapter = require('../../utils/adapter.js')
const NC = require('../../utils/notificationcenter.js')
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10


Page({
  data: {
    isArticlesList: true,
    isSearch: false,
    isTag: false,
    tagname: '',
    isCategory: false,
    categoryId: "",
    searchKey: "",
    articlesList: [],
    categoryImage: "",
    isLastPage: false,
    isPull: false,
    page: 1,
    shareTitle: '',
    pageTitle: '',
    tag: '',
    listAdsuccess: true,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    subscribemessagesid: "",
    categorySubscribeCount: 0,
    pageName: "list",
    platform: '',
    system: '',
    isIpx: '',
    pageName: "list",
    productId: "",
    productype: "catsubscribe",
    banner: {}
  },

  onLoad: function (options) {
    // 设置插屏广告

    this.setInterstitialAd();
    var self = this;
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android'
        var isIpx = t.model.indexOf('iPhone X') != -1 ? true : false
        self.setData({ system: system, platform: t.platform, isIpx: isIpx })
      }
    })

    let args = {};

    Auth.checkSession(app, API, self, 'isLoginLater', util);
    args.userId = self.data.userSession.userId
    args.sessionId = self.data.userSession.sessionId
    args.page = this.data.page;
    args.pageCount = pageCount;
    if (options.searchKey && options.searchKey != '') {
      args.isSearch = true;
      args.isCategory = false;
      args.searchKey = options.searchKey;
      args.istag = false;
      self.setData({
        searchKey: options.searchKey,
        isSearch: true,
        isCategory: false,
        istag: false,
        pageTitle: appName + "-搜索",
        shareTitle: appName + "-搜索",
      });
    }
    if (options.categoryIds && options.categoryIds != '') {
      args.isSearch = false;
      args.isCategory = true;
      args.isTag = false;
      args.categoryIds = options.categoryIds;
      self.setData({
        isSearch: false,
        isCategory: true,
        isTag: false,
        categoryIds: options.categoryIds,

      });
      self.LoadCategory(args);
    }
    if (options.tag && options.tag != '') {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = options.tag;
      self.setData({
        isSearch: false,
        isCategory: false,
        isTag: true,
        tag: options.tag,
        tagname: options.tagname,
        tagPostsCount: options.tagPostsCount,
        pageTitle: "#" + options.tagname,
        shareTitle: appName+"-标签'"+options.tagname + "'相关的文章"
      });
    }
    Adapter.loadArticles(args, this, API);

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage','shareTimeline']
    })
    this.getCustomBanner()
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    let query = {}

    if (this.data.isSearch) {
      query = {
        searchKey: this.data.searchKey
      }
    }

    if (this.data.isCategory) {
      query = {
        categoryIds: this.data.categoryIds
      }
    }

    if (this.data.isTag) {
      query = {
        tag: this.data.tag,
        tagname: this.data.tagname,
        tagPostsCount: this.data.tagPostsCount
      }
    }

    return {
      title: this.data.shareTitle,
      query
    }
  },

  // 分享
  onShareAppMessage: function () {
    let path = '/pages/list/list'

    if (this.data.isSearch) {
      path += "?searchKey=" + this.data.searchKey
    }
    if (this.data.isCategory) {
      path += "?categoryIds=" + this.data.categoryIds
    }
    if (this.data.isTag) {
      path += "?tag=" + this.data.tag + "&tagname=" + this.data.tagname + "&tagPostsCount=" + this.data.tagPostsCount
    }

    return {
      title: this.data.shareTitle,
      path: path
    }
  },

  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    });
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    Auth.checkLogin(this)
    this.setData({
      isPull: true,
      isError: false,
      isArticlesList: false,
      articlesList: [],
      listAdsuccess: true
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
      args.categoryIds = this.data.categoryIds;
    }
    if (this.data.isTag) {
      args.isSearch = false;
      args.isCategory = false;
      args.isTag = true;
      args.tag = this.data.tag;
    }
    Adapter.loadArticles(args, this, API, true);
  },

  // 上拉加载
  onReachBottom: function () {
    let args = {};
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
        args.categoryIds = this.data.categoryIds;
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
      Adapter.loadArticles(args, this, API);
    }
  },

  // 获取自定义banner
  getCustomBanner() {
    const http = API.getConfig()

    http.then(res => {
      const data = res.settings
      let banner = data.expand.cat_posts_list_nav
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

  // 获取小程序插屏广告
  setInterstitialAd() {
    API.getSettings().then(res => {
      // 获取广告id，创建插屏广告组件
      if (!res.success) return
      let interstitialAd = wx.createInterstitialAd({
        adUnitId: res.settings.raw_interstitial_ad_id
      })
      // 监听插屏错误事件
      interstitialAd.onError((err) => {
        // console.log(err)
      })
      // 显示广告
      if (interstitialAd) {
        interstitialAd.show().catch((err) => {
          // console.log(err)
        })
      }
    })
  },

  // 跳转至查看文章详情
  redictDetail(e) {
    Adapter.redictDetail(e, "post");
  },

  formSubmit(e) {
    var url = '../list/list'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.redirectTo({
        url: url,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入搜索内容',
        showCancel: false,
      })
    }
  },

  //获取分类列表
  LoadCategory(args) {
    API.getCategoryById(args).then(res => {
      let cateImage = res.category_thumbnail_image ? res.category_thumbnail_image : '../../images/uploads/default_image.jpg'
      let cateInfo = {
        ...res,
        integral: +res.catYearIntegral,
        price: +res.catyearprice
      }

      this.setData({
        category: cateInfo,
        productId: res.id,
        productname: '专题付费订阅：' + res.name,
        shareTitle:res.description,
        totalfee: res.catyearprice,
        pageTitle: res.name,
        categoryImage: cateImage
      })

      wx.setNavigationBarTitle({
        title: res.name
      })
    })
  },

  adbinderror(e) {
    var self = this;
    if (e.detail.errCode) {
      self.setData({
        listAdsuccess: false
      })
    }
  },

  removeArticleChange() {
    //NC.removeNotification("articleChange", this)
  },

  // 积分支付
  postIntegral() {
    var self = this;
    var args = {};
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return; 
    }

    var productId = self.data.category.id;
    var originalprice = parseInt(self.data.category.catYearIntegral);
    args.sessionid = sessionId;
    args.extid = productId;
    args.userid = userId;
    args.integral = originalprice;
    args.extype = "catsubscribeIntegral";


    var originalprice = originalprice;
    var userIntegral = parseInt(self.data.memberUserInfo.integral);
    if (userIntegral < originalprice) {

      wx.lin.showDialog({
        type: "confirm",
        title: "标题",
        showTitle: false,
        confirmText: "确认",
        confirmColor: "#f60",
        content: "积分不足，是否去赚积分",
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
            if (!res.success) {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            }
            else {
              wx.lin.showToast({
                title: '积分支付成功',
                icon: 'success',
                duration: 2000,
                mask: true,
                placement: 'right',
                success: (res) => {
                  var category = self.data.category;
                  category.paypequired = "0";
                  self.setData({ category: category });
                }
              })
            }
          })
        }
      }
    })

  },

  // 微信支付
  payment(e) {
    var self = this;
    var totalfee = self.data.category.catyearprice;
    if (totalfee == "") {
      Adapter.toast("支付金额不能为空", 2000);
      return;
    }

  
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);

      return;
      
    }
    Adapter.prodcutPayment(self, app, API, util)
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

  // 订阅
  postsub(e) {
    var self = this;
    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util);
      return;

    }
    else {
      var extid = e.currentTarget.dataset.id;
      var subscribetype = 'categorySubscribe';
      var subscribemessagesid = e.currentTarget.dataset.subid;
      Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid, util);
    }

  },
  logoutTap(e){    
    Auth.logout(this);   
    this.onPullDownRefresh();
    this.closeLoginPopup();     
  }
})