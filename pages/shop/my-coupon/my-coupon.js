const app = getApp()

Page({
  data: {
    tabList: [
      { title: '全部', status: '10' },
      { title: '可使用', status: '20' },
      { title: '已过期', status: '30' },
    ],
    active: '10',
    page: 1,
    pageSize: 10,
    couponList: [],
    empty: false
  },

  onLoad: function (options) {
    this.getCouponList()
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      couponList: []
    })
    this.getCouponList()
  },

  onReachBottom: function () {
    let page = this.data.page + 1
    this.setData({
      page
    })
    this.getCouponList()
  },

  // 切换tab
  async onChange(e) {
    this.setData({
      active: e.detail.name,
      couponList: [],
      empty: false,
      page: 1
    })

    wx.showLoading({
      title: '加载中',
    })
    await this.getCouponList()
    wx.hideLoading()
  },

  // 获取优惠券
  async getCouponList() {
    const res = await app.$api.getCouponList()
    let couponList = res.coupons || []

    this.setData({
      couponList
    })
  }
})