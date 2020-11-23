// 版权信息组件
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    paddingBottom: {
      type: String,
      value: '20rpx'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    copyright: ''
  },

  attached: function () {
    let copyright = app.globalData.copyright
    this.setData({ copyright })
  }
})
