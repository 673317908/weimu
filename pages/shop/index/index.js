const API = require('../../../utils/api.js')
const app = getApp()


Page({
  data: {
    swiperList: [],
    selectedList: [],
    productList: [],
    page: 1,
    shareTitle: 'ماگىزىن',
    couponList: [],
    activeTab: 0,

    cateList: [],
    activeCate: 0
  },

  onLoad: function (option) {
    this.getShopSetting()
    this.getCouponList()
    this.getShopProducts()

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function () {
    return {
      title: this.data.shareTitle + '-' +getApp().globalData.appName
    }
  },

  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle + '-' +getApp().globalData.appName,
      path: '/pages/shop/index/index'
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      swiperList: [],
      selectedList: [],
      productList: [],
      page: 1
    })
    this.getShopSetting()
    this.getCouponList()
    this.getShopProducts()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    let page = this.data.page + 1
    this.setData({
      page
    })

    this.getShopProducts()
  },

  // // 获取精选商品
  // getSelectedList() {
  //   const http = API.getConfig()

  //   http.then(res => {
  //     const data = res.settings
  //     let selectedList = data.expand.products_nav || []

  //     this.setData({
  //       selectedList
  //     })
  //   })
  // },

  // 轮播和热销商品
  async getShopSetting() {
    const res = await app.$api.getShopSetting()
    let swiperList = res.shop_swipe_nav || []
    let selectedList = res.shop_hot_products_nav || []

    this.setData({
      swiperList,
      selectedList
    })
  },

  // 获取优惠券列表
  async getCouponList() {
    const res = await app.$api.getCouponList()
    let couponList = res.coupons || []

    this.setData({
      couponList
    })
  },

  // 获取商品分类列表
  async getGoodsCate() {
    const res = await app.$api.getGoodsCate()
    let list = res.shopcat_list || []

    list = list.map(item => {
      if (!item.children || !item.children.length) {
        item.children = [{ ...item, children: [] }]
      }
      return item
    })

    this.setData({
      cateList: list
    })
  },

  // 获取商品列表
  getShopProducts() {
    var self = this;
    var args = {};
    args.page = self.data.page;
    args.page_size = 10;
    API.getShopProducts(args).then(res => {
      let productList = self.data.productList;
      if (res.errcode == "0") {
        productList.push(...res.spus)
      }
      self.setData({
        productList
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

  openMyCart(){
    wx.navigateTo({
      url: 'plugin-private://wx34345ae5855f892d/pages/shoppingCart/shoppingCart'
    });    
  },

  // 登录
  onLogin() {
    wx.z.showLogin({
      success: () => {}
    })
  },

  async onTabChange(e) {
    this.setData({
      activeCate: e.detail.name,
      cateList: [],
      cateSubList: []
    })

    // wx.showLoading({
    //   title: 'ئېچىلىۋاتىدۇ',
    // })
    await this.getGoodsCate()
    // wx.hideLoading()
  }
})