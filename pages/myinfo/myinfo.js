const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js')


Page({
  data: {
    userInfo: {},
    info: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},

    comment: '', // 等级权益
    commentPass: '',
    postTopic: '',
    topicPass: '',
    articlePass: '',

    integral: '', // 当前积分
    grade: ''
  },

  // 页面加载
  onLoad: function(options) {
    this.setData({
      integral: Number(options.integral)
    })  

    this.initData()
  },
  onShow: function () {
    let self = this;
    Auth.setUserMemberInfoData(self);
    
  },

  // 初始逻辑
  initData() {
    let u = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: u
    })
    
    this.getSettings()
  },

  // 获取设置数据
  getSettings() {
    var self = this

    API.getSettings().then(res => {
      let info = res.settings
      let comment = self.formateGrade(info.min_comment_user_member)
      let commentPass = self.formateGrade(info.min_comment_pass_user_member)
      let postTopic = self.formateGrade(info.min_posttopic_user_member)
      let topicPass = self.formateGrade(info.min_posttopic_pass_user_member)
      let articlePass = self.formateGrade(info.min_postarticle_pass_user_member)

      let grade = self.getGrade(info)

      self.setData({
        info,
        comment,
        commentPass,
        postTopic,
        topicPass,
        articlePass,
        grade
      })
    })
  },

  // 根据积分计算会员等级
  getGrade(e) {
    let integral = this.data.integral

    if (integral >= e.fifth_level_integral) {
      return '★★★★★★'
    } else if (integral >= e.fourth_level_integral) {
      return '★★★★★'
    } else if (integral >= e.third_level_integral) {
      return '★★★★'
    } else if (integral >= e.second_level_integral) {
      return '★★★'
    } else if (integral >= e.first_level_integral) {
      return '★★'
    } else {
      return '★'
    }  
  },

  // 格式化等级
  formateGrade(num) {
    num = Number(num)

    if (num === 10) num = '★'
    if (num === 11) num = '★★'
    if (num === 12) num = '★★★'
    if (num === 13) num = '★★★★'
    if (num === 14) num = '★★★★★'
    if (num === 15) num = '★★★★★★'
    if (num === 1) num = 'VIP'
    if (num === 0) num = 'باشقۇرغۇچى'

    return num
  }
})