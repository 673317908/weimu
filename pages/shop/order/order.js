const app = getApp()

Page({
  data: {
    tabList: [
      { title: '待付款', status: '10' },
      { title: '待发货', status: '20' },
      { title: '待收货', status: '30' },
      { title: '已完成', status: '100' },
      { title: '已售完', status: '200' },
      { title: '已取消', status: '250' },
    ],
    active: '10',
    page: 1,
    pageSize: 10,
    orderList: [],
    empty: false
  },

  onLoad: function (options) {
    this.getOrderList(options.isRefresh)
  },

  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      orderList: []
    })
    this.getOrderList()
  },

  onReachBottom: function () {
    let page = this.data.page + 1
    this.setData({
      page
    })
    this.getOrderList()
  },

  // 切换tab
  async onChange(e) {
    this.setData({
      active: e.detail.name,
      orderList: [],
      empty: false,
      page: 1
    })

    wx.showLoading({
      title: 'ئېچىلىۋاتىدۇ',
    })
    await this.getOrderList()
    wx.hideLoading()
  },

  // 获取订单列表
  async getOrderList(isRefresh) {
    // 是否刷新
    if (isRefresh) this.setData({
      page: 1,
      orderList: []
    })

    let userInfo = wx.getStorageSync('userSession')
    let status = this.data.active

    let params = {
      status,
      sessionid: userInfo.sessionId,
      userid: userInfo.userId,
      page: this.data.page,
      page_size: this.data.pageSize,
      start_create_time: '2019-08-01 00:00:00',
      end_create_time: '2050-08-01 00:00:00'
    }
    const res = await app.$api.getOrderList(params)
    let list = res.orders || []
    let orderList = this.data.orderList
    orderList.push(...list)
    let empty = !orderList.length

    this.setData({
      orderList,
      empty
    })
  },

  // 跳转
  goto(e) {
    let id = e.target.dataset.info.order_id
    
    wx.navigateTo({
      url: `/pages/shop/order-detail/order-detail?orderId=${id}`
    })
  }
})