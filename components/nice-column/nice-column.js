const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array,
    title: {
      type: String,
      value: '精选栏目'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    swiperIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange(e) {
      let swiperIndex = e.detail.current
      this.setData({
        swiperIndex
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
    }
  }
})
