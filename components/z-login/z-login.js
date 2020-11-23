const app = getApp()

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
    code: '',
    success: null
  },

  /**
  * 组件的初始数据
  */
  attached() {
    this.initDialog()
  },

  pageLifetimes: {
    show() {
      this.initDialog()
    },
  },

  methods: {
    // 初始化弹窗
    initDialog() {
      // 获取code
      wx.login({
        success: (r) => {
          if (r.code) {
            this.setData({
              code: r.code
            })
          }
        }
      })

      const config = {
        success: null
      }

      wx.z = wx.z || {}
      wx.z.showLogin = (options) => {
        const {
          success = config.success
        } = options

        this.setData({
          show: true,
          success
        })
        return this
      }
    },

    // 确定
    async onConfirmTap(e) {
      let userInfo = e.detail.userInfo || {}
      wx.setStorageSync('userInfo', userInfo)

      let params = {
        js_code: this.data.code,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData,
        userInfo
      }

      const res = await app.$api.login(params)
      if (res.raw_session) {
        wx.setStorageSync('userSession', res.raw_session);
        this.getMemberUserInfo()

        wx.showToast({
          icon: 'success',
          title: '登录成功！',
        })

        // 关闭
        this.setData({
          show: false
        })
      } else {
        wx.showToast({
          title: res.message || '出错了，请稍后再试！',
        })
      }

      // let detail = 'confirm'
      // let option = { bubbles: true, composed: true }

      // const {
      //   success
      // } = this.data
      // success && success({
      //   confirm: true,
      //   cancel: false
      // })
      // this.setData({
      //   show: !this.data.show
      // })
      // this.triggerEvent('confirm', detail, option)
    },

    // 取消
    onCancelTap(e) {
      let detail = 'cancel'
      let option = { bubbles: true, composed: true }

      const {
        success
      } = this.data
      success && success({
        confirm: false,
        cancel: true
      })
      this.setData({
        show: !this.data.show
      })

      // this.triggerEvent('cancel', detail, option)
    },

    // 关闭
    onClose() {
      let data = this.data
      if (!data.maskClosable) return
      this.setData({
        show: false
      })
      this.triggerEvent('close', {}, {})
    },
    stopEvent() {
      // 阻止默认事件
    },

    // 获取会员信息
    async getMemberUserInfo() {
      let params = wx.getStorageSync('userSession') || {}
      const res = await app.$api.getMemberUserInfo(params)

      if (res.memberUserInfo) {
        wx.setStorageSync('memberUserInfo', res.memberUserInfo)
      }
    }
  }
});