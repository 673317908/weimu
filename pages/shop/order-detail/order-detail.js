const app = getApp()

Component({
  properties: {
    orderId: String,
  },
  data: {
    orderId: '',
    orderInfo: {},
    swiperList: [],

    expressList: [], // 快递公司列表
    curExpress: {},
    waybillId: '',

    show: false,
    loading: false,
    btnLoading: false
  },

  methods: {
    onLoad: function (options) {
      this.initData()
    },

    initData() {
      this.getOrderDetail()
    },

    onPullDownRefresh: function () {
      this.getOrderDetail(true)
    },

    // 获取订单信息
    async getOrderDetail(isRefresh) {
      if (isRefresh) {
        this.setData({
          orderInfo: {}
        })
      }

      let userInfo = wx.getStorageSync('userSession')
      let params = {
        id: this.data.orderId,
        sessionid: userInfo.sessionId,
        userid: userInfo.userId
      }
      const res = await app.$api.getOrderDetail(params)
      let orderInfo = res.order || {}

      this.setData({
        orderInfo
      })
    },

    // 获取快递公司列表
    async getExpressList() {
      const res = await app.$api.getExpressList()
      let expressList = res.company_list || []

      this.setData({
        expressList,
        loading: false
      })
    },

    // 发货
    async onDeliver() {
      this.setData({ btnLoading: true })
      let userInfo = wx.getStorageSync('userSession')
      let orderid = this.data.orderId
      let deliveryid = this.data.curExpress.delivery_id
      let waybillid = this.data.waybillId

      if(! userInfo.sessionId || !userInfo.userId) {
        this.onLogin();
        return
      }

      if(!deliveryid || !waybillid)
      {

        wx.showToast({
          title: '没有选择快递公司或填写快递单号',
          mask: true,
          icon: "none",
          duration: 2000
        })

        this.setData({ btnLoading: false })

        return

      }
 

      const res = await app.$api.submitDeliver({
        orderid,
        deliveryid,
        waybillid,
        sessionid: userInfo.sessionId,
        userid: userInfo.userId
      })
      this.setData({ btnLoading: false })

      if (res.errcode === 0) {
        wx.showToast({
          title: '发货成功'
        })

        // 刷新数据
        this.getOrderDetail(true)

        // 刷新列表数据
        app.$util.refreshtPrevPage({ isRefresh: true })
      } else {
        wx.showToast({
          title: res.errmsg || res.message || '出错了，请稍后重试！',
          icon: 'none'
        })
      }
    },
        // 登录
    onLogin() {
      wx.z.showLogin({
        success: () => {

        }
      })
    },

    onChange(e) {
      let waybillId = e.detail

      this.setData({
        waybillId
      })
    },

    onShowPopup() {
      this.setData({
        show: true,
        loading: true
      })
      this.getExpressList()
    },

    onClose() {
      this.setData({
        show: false
      })
    },

    onConfirm(e) {
      let curExpress = e.detail.value

      this.setData({
        curExpress,
        show: false
      })
    }
  }
})