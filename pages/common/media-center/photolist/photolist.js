const API = require("../../../../utils/api.js");

Page({
  data: {
    photoList: [],
    allImgSrc: [],
    page: 1,
    per_page: 18,
    isPlay: false,
    shareTitle: "你的朋友和你分享了一张美图，快来查看吧！"
  },

  onLoad: function(options) {
    this.getPhotolist();

    // 设置系统分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    });
  },

  // 自定义分享朋友圈
  onShareTimeline: function() {
    return {
      title: this.data.shareTitle
    }
  },

  // 分享
  onShareAppMessage: function() {
    return {
      title: this.data.shareTitle,
      path: "/pages/common/media-center/photolist/photolist"
    };
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      page: 1,
      photolist: []
    });
    this.getPhotolist();
  },

  // 上拉加载
  onReachBottom: function() {
    this.setData({
      page: this.data.page + 1
    });
    this.getPhotolist();
  },

  // 获取图片列表数据
  getPhotolist() {
    var self = this;
    var pramas = {};
    pramas.filetype = "image";
    pramas.usertype = "all";
    pramas.page = this.data.page;
    pramas.per_page = this.data.per_page;

    API.getAttachments(pramas).then(res => {
      // 所有的图片地址数组，为了查看大图用
      let allImgSrc = [];
      res.map(item => {
        allImgSrc.push(item.guid);
      });

      if (!this.data.photoList.length) {
        self.setData({
          photoList: res,
          allImgSrc: allImgSrc
        });
      } else {
        self.setData({
          photoList: [].concat(this.data.photoList, res),
          allImgSrc: [].concat(this.data.allImgSrc, allImgSrc)
        });
      }
    });
  },

  // 点击查看大图
  previewImage(e) {
    var imgallsrc = e.currentTarget.dataset.imgallsrc;
    var imgsrc = e.currentTarget.dataset.imgsrc;
    wx.previewImage({
      current: imgsrc,
      urls: imgallsrc
    });
  }
})
