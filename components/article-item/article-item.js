// 文章列表组件
import config from '../../utils/config.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array,
     // 1 左图 2 右图 3 大图 4 多图 5 瀑布流 6 无图
    type: {
      type: Number,
      value: null
    },
    showAction: {
      type: Boolean,
      value: false
    },
    isWppage: { // wp页面
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showAd: true,
    articleStyle: config.articleStyle || 1
  },

  attached: function () {
    if (!this.data.type) {
      let articleStyle = wx.getStorageSync('articleStyle') || config.articleStyle || 1
      this.setData({ articleStyle: Number(articleStyle) })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转
    goto(e) {
      // wp页面跳转
      if (this.data.isWppage) {
        this.triggerEvent('click', e)
        return
      }

      let { id } = e.currentTarget
      let type = e.currentTarget.dataset.posttype || 'post'
      let url = ''
      if (type === 'post') {
        url = '../detail/detail?id=' + id
      } else if (type === 'topic' || type === 'reply') {
        url = '../socialdetail/socialdetail?id=' + id
      }

      wx.navigateTo({
        url
      })
    },

    // 广告错误
    onError(e) {
      if (e.detail.errCode) {
        this.setData({
          showAd: false
        })
      }
    },

    submitPage(e) {
      this.triggerEvent('submitPage', e)
    },

    deleteTopic(e) {
      this.triggerEvent('deleteTopic', e)
    },

    // 发送订阅消息
    sendSubscribeMessage(e) {
      this.triggerEvent('sendSubscribeMessage', e)
    }
  }
})
