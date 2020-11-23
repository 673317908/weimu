const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object,
    btnText: String
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    onClick(e) {
      if (this.data.btnText === '立即领取') {
        this.pullPushCoupon(e)
      }
      if (this.data.btnText === '立即使用') {
        wx.switchTab({
          url: '../index/index'
        })
      }
    },

    // 领取优惠券
    async pullPushCoupon(e) {
      let userInfo = wx.getStorageSync('userSession')
      let sessionid = userInfo.sessionId
      let userid = userInfo.userId
      let couponid = e.currentTarget.dataset.couponid
      if(!sessionid || !userid) {
        this.triggerEvent('login')
        return
      }
      const res = await app.$api.pullPushCoupon({
        sessionid,
        userid,
        couponid
      })
      if (res.errcode === 0) {
        wx.showToast({
          icon: 'success',
          title: '领取成功！'
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.errmsg || '出错了，请稍后再试！'
        })
      }
    }
  }
})
