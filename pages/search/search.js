const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')


const app = getApp()
const pageCount = 10

Page({
  // 初始数据
  data: {
    isShowList: false,
    isEmpty: false,
    isShowHistory: true,
    isLastPage: false,

    isLoading: false,
    isPullDown: false,
    isError: false,

    articlesList: [],
    socialList:[],
    topicList: [],

    postype: '',
    searchKey: '',
    page: 1
  },

  // 页面加载
  onLoad: function (options) {
    this.setData({
      postype: options.postype ? options.postype : ''
    })


    // 页面标题
    let title = '搜索'
    if (this.data.postype === 'article') title = '文章搜索'
    if (this.data.postype === 'topic') title = '动态搜索'
    wx.setNavigationBarTitle({
      title: title
    })

    this.getSearchStorage()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      isPullDown: true,
      isError: false,   
      isLoading: false, 
      isLastPage: false,        
      isShowList: false, 
      isShowHistory: true,
      isEmpty: false,
      page: 1,         
      articlesList: [],
      topicsList: []
    })

    // 输入内容为空
    if (!this.data.searchKey) {
      wx.showToast({
        title: '请输入搜索关键字！',
        icon: 'none',
        duration: 1500
      })
      wx.stopPullDownRefresh()
      this.getSearchStorage()
      return
    }

    if (this.data.postype === 'article') {
      this.getSearchPosts()
    } else if (this.data.postype === 'topic') {
      this.getTopicList()
    }

    wx.stopPullDownRefresh()
  },

  // 上拉加载
  onReachBottom: function () {
    if (this.data.isLastPage) return

    this.setData({
      page: this.data.page + 1
    })

    if (this.data.postype === 'article') {
      this.getSearchPosts()
    } else if (this.data.postype === 'topic') {
      this.getTopicList()
    }
  },

  // 获取文章列表
  getSearchPosts() {
    let self = this

    let params = {
      page: self.data.page,
      pageCount: pageCount,
      searchKey: self.data.searchKey
    }

    self.setData({
      isLoading: true
    })
    API.getSearchPosts(params).then(res => {
      let pageData = {}
      if (!res.length) {
        pageData.isEmpty = true
        pageData.isShowHistory = false
        self.setData(pageData)
      }

      if (res.length) {
        pageData.isLoading = false
        pageData.articlesList = self.data.articlesList.concat(res)
        pageData.isShowList = true
        if (res.length < pageCount) pageData.isLastPage = true

        self.setData(pageData)

      } else if (res.code == 'rest_post_invalid_page_number') {
        self.setData({
          isLastPage: true
        })
        wx.showToast({
          title: '已达最后一页',
          icon: "none",
          duration: 1500
        })
      }
      wx.stopPullDownRefresh()
    }).catch(err => {
      self.setData({
        isLoading: false,
        isPullDown: false,
        isShowList: false,
        isError: true
      })
    }).finally(res => {
      wx.stopPullDownRefresh()
      self.setData({
        isLoading: false
      })
    })
  },

  // 获取动态列表
  getTopicList() {
    let self = this
    let params = {
      page: self.data.page,
      pageCount: 5,
      searchKey: self.data.searchKey,
      isSearch: true
    }

    API.getBBTopics(params).then(res => {
      if (res.topics && res.topics.length) {
        let topicList = [].concat(self.data.topicList, res.topics)

        self.setData({
          topicList,
          isShowList: true,
          isLastPage: res.topics.length < 5,
          isLoading: false
        })
      } else {
        self.setData({
          isEmpty: true
        })
      }
    }).catch(err => {
      self.setData({
        isLoading: false,
        isPullDown: false,
        isShowList: false,
        isEmpty: false,
        isLastPage: false,
        isError: true
      })
    }).finally(res => {
      wx.stopPullDownRefresh()
      self.setData({
        isLoading: false
      })
    })
  },

  // 搜索
  formSubmit() {
    if (!this.data.searchKey) {
      wx.showToast({
        title: '请输入搜索关键字！',
        icon: "none",
        duration: 1500
      })
      return
    }

    this.getSearchData()
  },

  // 根据搜索关键字获取相应数据
  getSearchData(key = this.data.searchKey) {
    this.setSearchStorage(key)

    this.setData({
      isShowList: false,
      isLoading: false,
      isPullDown: false,
      isError: false,
      isLastPage: false,
      page: 1,
      articlesList: [],
      topicList: []
    })

    // 文章搜索
    if (this.data.postype === 'article') {
      this.getSearchPosts()
    }

    // 帖子搜索
    if (this.data.postype === 'topic') {
      // let url = '../sociallist/sociallist?searchKey=' + key
      // wx.navigateTo({
      //   url: url
      // })

      this.getTopicList()
    }
  },

  // 点击搜索历史
  onSearch(e) {
    let val = e.currentTarget.dataset.search
    this.setData({
      searchKey: val
    })

    this.getSearchData()
  },

   // 分享
   onShareAppMessage: function () {  
    let name = getApp().globalData.appName
    var self=this;
    var title =name + '-搜索'
    if(self.data.searchKey) {
      title += ':'+self.data.searchKey
    }
    return {
      title,
      path: '/pages/search/search'
    }
  },

  // 缓存搜索历史
  setSearchStorage(key) {
    let articleHistory = wx.getStorageSync('searchInfo').article || []
    let topicHistory = wx.getStorageSync('searchInfo').topic || []

    let type = this.data.postype
    let searchInfo = {}

    // 文章
    if (type === 'article') {
      if (articleHistory.length) {
        // 去重
        articleHistory.map((m, index) => {
          if (m === key) articleHistory.splice(index, 1)
        })
        if (articleHistory.length > 10) articleHistory.pop()
      }
 
      articleHistory.unshift(key)
      searchInfo = {
        article: articleHistory,
        topic: topicHistory
      }
    }

    // 帖子
    if (type === 'topic') {
      if (topicHistory.length) {
        // 去重
        topicHistory.map((m, index) => {
          if (m === key) topicHistory.splice(index, 1)
        })
        if (topicHistory.length >= 10) topicHistory.pop()
      }

      topicHistory.unshift(key)
      searchInfo = {
        article: articleHistory,
        topic: topicHistory
      }
    }

    wx.setStorageSync('searchInfo', searchInfo)
  },

  // 获取搜索历史
  getSearchStorage() {
    let articleHistory = wx.getStorageSync('searchInfo').article || []
    let topicHistory = wx.getStorageSync('searchInfo').topic || []
    let type = this.data.postype

    let list = []
    if (type === 'article') {
      list = articleHistory
    }

    if (type === 'topic') {
      list = topicHistory
    }

    this.setData({
      searchHistory: list
    })
  },

  // 清空搜索记录
  clearSearch() {
    wx.z.showDialog({
      content: '您确定要清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) { // 确定
          let type = this.data.postype
          let articleHistory = wx.getStorageSync('searchInfo').article || []
          let topicHistory = wx.getStorageSync('searchInfo').topic || []

          if (type === 'article') {
            articleHistory = []
          }
          if (type === 'topic') {
            topicHistory = []
          }

          let searchInfo = {
            article: articleHistory,
            topic: topicHistory
          }
          wx.setStorageSync('searchInfo', searchInfo)

          this.setData({
            searchHistory: []
          })
        }
      }
    })
  },

  // 跳转详情
  redictDetail(e) {
    Adapter.redictDetail(e, 'post')
  },

  // 输入
  handleInput(e) {
    let val = e.detail.value
    this.data.searchKey = val
  }
})