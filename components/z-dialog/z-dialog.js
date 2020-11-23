Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    // 弹窗类型 confirm 和 alert
    type: {
      type: String,
      value: 'confirm'
    },
    show: {
      type: Boolean,
      value: false
    },
    // 是否显示遮罩
    showMask: {
      type: Boolean,
      value: true
    },
    // 是否可点遮罩关闭
    maskClosable: {
      type: Boolean,
      value: true
    },
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 是否显示标题
    showTitle: {
      type: Boolean,
      value: true
    },
    // 内容
    content: {
      type: 'String',
      value: ''
    },
    // 确定按钮的文本
    confirmText: {
      type: String,
      value: '确定'
    },
    // 取消按钮的文本
    cancelText: {
      type: String,
      value: '取消'
    },
    isCoverView: { // 是否用 cover-view 标签：解决textarea层级覆盖弹窗问题）
      type: Boolean,
      value: false
    }
  },
  data: {
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
      const config = {
        type: 'confirm',
        showMask: true,
        maskClosable: true,
        title: '提示',
        showTitle: true,
        content: '',
        confirmText: '确定',
        cancelText: '取消',
        isCoverView: false,
        success: null
      }

      wx.z = wx.z || {}
      wx.z.showDialog = (options) => {
        const {
          type = config.type,
          showMask = config.showMask,
          maskClosable = config.maskClosable,
          title = config.title,
          showTitle = config.showTitle,
          content = config.content,
          confirmText = config.confirmText,
          cancelText = config.cancelText,
          isCoverView = config.isCoverView,
          success = config.success
        } = options

        this.setData({
          show: true,
          type,
          showMask,
          maskClosable,
          title,
          showTitle,
          content,
          confirmText,
          cancelText,
          isCoverView,
          success
        })
        return this
      }
    },

    // 确定
    onConfirmTap(e) {
      let detail = 'confirm'
      let option = { bubbles: true, composed: true }

      const {
        success
      } = this.data
      success && success({
        confirm: true,
        cancel: false
      })
      this.setData({
        show: !this.data.show
      })
      this.triggerEvent('confirm', detail, option)
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

      this.triggerEvent('cancel', detail, option)
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
    }
  }
});