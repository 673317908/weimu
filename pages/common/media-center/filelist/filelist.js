const API = require("../../../../utils/api.js");

Page({
  data: {
    fileList: [],
    page: 1,
    per_page: 15,
    isPlay: false,
    shareTitle: "你的朋友给你分享了一大波文件，快来查看吧！"
  },

  onLoad: function(options) {
    this.getFileList()

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    return {
      title: this.data.shareTitle
    }
  },

  onShareAppMessage: function() {
    return {
      title: this.data.shareTitle,
      path: "/pages/common/media-center/fileList/fileList"
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      fileList: []
    })
    this.getFileList()
  },

  // 上拉加载
  onReachBottom: function() {
    this.setData({
      page: this.data.page + 1
    })
    this.getFileList()
  },

  // 获取文件列表数据
  getFileList() {
    let self = this
    let pramas = {}
    pramas.filetype = "document"
    pramas.usertype = "all"
    pramas.page = this.data.page
    pramas.per_page = this.data.per_page

    API.getAttachments(pramas).then(res => {
      if (!this.data.fileList.length) {
        self.setData({
          fileList: res
        });
      } else {
        self.setData({
          fileList: [].concat(this.data.fileList, res)
        })
      }
    })
  },

  // 打开文档
  openDoc(e) {
    var url = e.currentTarget.dataset.filelink
    var fileType = e.currentTarget.dataset.filetype

    wx.downloadFile({
      url,
      success: function(res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath: filePath,
          // fileType
        })
      }
    })
  }
})
