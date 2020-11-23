const API = require('../../../../utils/api.js')
const backgroundAudioManager = wx.getBackgroundAudioManager();

Page({
  data: {
    audioList: [],
    page: 1,
    per_page: 15,
    isPlay: false,
    dataId: 0,
    shareTitle: "你的朋友给你分享了一条音频，快来听听吧！"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAudioList();
    var self=this;
    backgroundAudioManager.onEnded(() => {
      self.setData({
        isPlaying: 0
      })
    });
    wx.showShareMenu({
      withShareTicket:true,
      menus:['shareAppMessage','shareTimeline']
    })
  },
  // 获取文件列表数据
  getAudioList: function () {
    var self = this;
    var pramas = {};
    pramas.filetype = 'audio';
    pramas.usertype = "all";
    pramas.page = this.data.page;
    pramas.per_page = this.data.per_page;

    API.getAttachments(pramas).then(res => {
      if (!this.data.audioList.length) {
        self.setData({
          audioList: res
        })
      } else {
        self.setData({
          audioList: [].concat(this.data.audioList, res)
        })
      }
    })
  },

  playRemoteAudio: function (e) {
    var self = this;
    var audioUrl = e.currentTarget.dataset.audiourl;
    var dataId = e.currentTarget.dataset.id;
    backgroundAudioManager.src = audioUrl;
    backgroundAudioManager.title = "录音";

    // 遍历音频数组，如果是当前点击的音频，就给添加一个isplay属性
    let newAudioList = this.data.audioList
    newAudioList = newAudioList.map(item => {
      if (item.id === dataId) {
        item.isPlay = true
      }
      return item
    })
    // 重新更新下data里的数据
    this.setData({
      audioList: newAudioList
    })
  },
  stopRemoteAudio: function (e) {
    backgroundAudioManager.stop();
    var dataId = e.currentTarget.dataset.id;
    // 遍历音频数组，如果是当前点击的音频，就给添加一个isplay属性
    let newAudioList = this.data.audioList
    newAudioList = newAudioList.map(item => {
      if (item.id === dataId) {
        item.isPlay = false
      }
      return item
    })
    // 重新更新下data里的数据
    this.setData({
      audioList: newAudioList
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      audioList: []
    })
    this.getAudioList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      page: this.data.page + 1
    })
    this.getAudioList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/common/media-center/audiolist/audiolist'
    }
  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
})