Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    top: '',
    isFromShare: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let src = options.src

    let menuBtn = wx.getMenuButtonBoundingClientRect()
    let top = menuBtn.top + 'px'
    this.setData({
      src,
      top,
      isFromShare: options.from === 'share'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'دوستىڭىز سىزگە بىر فىلىم ئىۋەتتى',
      path: `/pages/full-video/full-video?src=${this.data.src}&from=share`
    }
  },

  // 返回
  onBack() {
    if (this.data.isFromShare) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    } else {
      wx.navigateBack()
    }
  }
})