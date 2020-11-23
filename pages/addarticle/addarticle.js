const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const app = getApp();


Page({
  data: {
    userSession: {}, // 用户
    wxLoginInfo: {},
    memberUserInfo: {},
    userInfo: {},
    subscribemessagesid: '',

    columns: [], // 分类列表

    isRewardedVideo: false, // 激励视频
    isOPenPay: false, // 付费阅读
    postStatus: "",
    isDisabledVideo: false,
    isDisabledPay: false,

    formData: { // 表单
      title: '',
      content: '',
      categoryId: '',
      categoryName: '',
      excerpt: '',
      tags: '',
      videoUrl: '',
      videoSrc:'',
      vid:'',
      video_poster:'',
      price: '',
      integral: ''
    },

    formats: {}, // 富文本编辑器
    readOnly: false,
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    imgList: [], // 文章中插入的图片，上传的时候单独传上去，每次添加不用setData，只在js中维护

    isHiddenTextarea: false, // 解决textarea在安卓层级太高bug

    isShowMore: false,
    showCategoryPop: false,
    pageName:'addarticle'
  },

  /* 页面加载 */
  onLoad: function (options) {
    // 加载缓存的内容
    var self=this;
    Auth.checkSession(app, API, self, 'isLoginLater', util);
    var  videoposter = options.videoposter;
    this.setData({      
      videoposter:videoposter
    })
    let article = wx.getStorageSync('article')
    //article.poster=videoposter;
    if(article) {
      this.setData({
        formData: article,
        videoposter:videoposter
      })
    }

    this.getSettings()  
    this.getCategoryData()
    Auth.checkLogin(self);
  },

  // 获取设置
  getSettings() {
    API.getSettings().then(res => {
      let subscribemessagesid = res.settings.new_post_message_id
      this.setData({
        subscribemessagesid
      })
    })
  },

  // 输入标题
  bindTitle(e) {
    let formData = this.data.formData
    formData.title = e.detail.value

    this.setData({
      formData
    })
  },

  // 输入正文
  onContentInput(e) {
    let formData = this.data.formData
    formData.content = e.detail.html

    this.setData({
      formData
    })
  },

  // 输入摘要
  bindExcerpt(e) {
    let formData = this.data.formData
    formData.excerpt = e.detail.value

    this.setData({
      formData
    })
  },

  // 输入标签
  onTagInput(e) {
    let formData = this.data.formData
    formData.tags = e.detail.value

    this.setData({
      formData
    })
  },

  // 输入视频连接
  // onVideoInput(e) {
  //   let formData = this.data.formData
  //   formData.videoUrl = e.detail.value

  //   this.setData({
  //     formData
  //   })
  // },

  // 输入积分
  bindintegral(e) {
    let formData = this.data.formData

    let val = e.detail.value
    if (val && val <= 0) {
      val = ''
      this.toastMsg('积分不能小于0，请重新输入')
    }
    formData.integral = val

    this.setData({
      formData
    })
  },

  // 输入价格
  bindprice(e) {
    let formData = this.data.formData

    let val = e.detail.value
    if (val && val <= 0) {
      val = ''
      this.toastMsg('价格金额不能小于0，请重新输入')
    }
    formData.price = val

    this.setData({
      formData
    })
  },

  // 开启付费阅读
  openPay(e) {
    if (this.data.isRewardedVideo) {
      this.setData({
        isOPenPay: false,
        isDisabledPay: true
      })
      this.toastMsg('开启激励视频后将不能再开启付费阅读！')
      return
    }

    if (e.detail.value) {
      this.setData({
        isOPenPay: true
      })
    } else {
      this.setData({
        isOPenPay: false,
        isDisabledVideo: false
      })
    }
  },

  // 开启激励视频
  openRewardedVideo(e) {
    if (this.data.isOPenPay) {
      this.setData({
        isRewardedVideo: false,
        isDisabledVideo: true
      })

      this.toastMsg('开启付费阅读后将不能再开启激励视频！')
      return
    }

    if (e.detail.value) {
      this.setData({
        isRewardedVideo: true
      })
    } else {
      this.setData({
        isRewardedVideo: false,
        isDisabledPay: false
      })
    }
  },

  // 获取分类数据
  getCategoryData() {
    let args = {}
    args.cateType = 'all'
    Adapter.loadCategories(args, this, API, false)
  },

  // 弹出分类弹窗
  categoryBtn() {
    this.setData({
      showCategoryPop: !this.data.showCategoryPop
    })
  },

  // 选择一级分类
  pickCategory(e) {
    let formData = this.data.formData
    formData.categoryId = e.currentTarget.dataset.categoryid
    formData.categoryName = e.currentTarget.dataset.categoryname

    this.setData({
      formData,
      showCategoryPop: false
    })
  },

  // 选择子分类
  pickSubCategory(e) {
    let formData = this.data.formData
    formData.categoryId = e.currentTarget.dataset.categoryid
    formData.categoryName = e.currentTarget.dataset.categoryname

    this.setData({
      formData,
      showCategoryPop: false
    })
  },

  // 展开收起
  addMore() {
    this.setData({
      isShowMore: !this.data.isShowMore
    })
  },

  // 缓存内容
  setStorage() {
    wx.setStorage({
      key: "article",
      data: this.data.formData
    })
  },

  // 发布文章
  publishArticle(e) {
    var that = this

    // 登录验证
    if (!that.data.userSession.sessionId) {
      that.setData({
        isLoginPopup: true
      })
      return
    }

    // 输入验证
    let errorMsg = that.validateMsg()
    if (errorMsg) {
      that.toastMsg(errorMsg)
      return
    }

    var userId = that.data.userSession.userId
    var sessionId = that.data.userSession.sessionId
    var subscribemessagesid = that.data.subscribemessagesid

    // 提交文章参数
    let f = that.data.formData
    let imgList = that.data.imgList

    let arr = JSON.parse(JSON.stringify(imgList))

    imgList.map((img, idx) => {
      let isHave = f.content.indexOf(img.src) != -1
      if (!isHave) {
        imgList.splice(idx, 1)
      }
    })

    let data = {
      userid: userId,
      sessionid: sessionId,
      title: f.title,
      content: f.content,
      category: f.categoryId,
      excerpt: f.excerpt,
      tags: f.tags ? f.tags.replace(/，/g, ",") : '',
      videos: f.vid ? [{
        videokey: "raw_video_vid1",
        vid: f.vid
      }] : [],
      videoDuration: that.data.isRewardedVideo ? 1 : 0, // 激励视频
      payRequired: that.data.isOPenPay ? 1 : 0, // 付费阅读
      price: f.price,
      integral: f.integral,
      videoUrl:f.videoUrl,
      videoPostId:f.videoPostId,
      video_poster:f.video_poster?f.videoposter:f.video_poster,
      imgList
    }

    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      confirmText: "提交",
      confirmColor: "#2f80ed",
      cancelColor: "#999",
      content: "您确定要提交文章吗？",
      success: (res) => {
        if (res.confirm) {
          // 内容缓存本地，防止登录信息过期内容丢失
          that.setStorage()

          API.publishPost(data).then(res => {
            var postId = res.postId;
            var postStatus = res.postStatus;
            var code= res.code;
            if (res.success) {
              // 清除内容缓存
              wx.removeStorageSync('article')

              wx.lin.showDialog({
                type: "confirm",
                title: "提示",
                // showTitle: false,
                confirmText: "订阅",
                confirmColor: "#2f80ed",
                cancelColor: "#999",
                content: res.message + ",是否订阅文章评论消息?",
                success: (data) => {
                  if (data.confirm) {
                    that.postsub(postId, subscribemessagesid, postStatus);
                  } else if (data.cancel) {

                    if (postStatus === "publish") {
                      setTimeout(function () {
                        util.navigateBack({
                          prevPageData: {
                            isPostSuccess: true
                          },
                          delta: 1
                        })
                      }, 1000);
                    } else {
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 1
                        })
                      }, 1000);
                    }
                  }
                }
              })
            } else {
              var message=res.message
              var code=res.code;
              if(res.code=='87014')
              {
                message="内容含有违法违规内容";

              }
              wx.showToast({
                title: message,
                icon: "none",
                duration: 3000,
                success: function () {
                  if(code=='87014')
                  {
                    that.editorCtx.clear({
                      success: function (res) {
                        // console.log("clear success")
                      }
                    })

                  }
                  else{

                    setTimeout(function () {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 2000);

                  }
                  
                }
              })
            }
          })
        }
      }
    })
  },

  // 微信提示封装
  toastMsg(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },

  // 验证错误提示
  validateMsg() {
    // 分类
    if (!this.data.formData.categoryId) {
      return '请选择文章分类！'
    }

    // 标题
    if (!this.data.formData.title.trim()) {
      return '请输入文章标题！'
    } else if (this.data.formData.title.trim().length > 100) {
      return '文章标题不能多于100字！'
    }

    // 正文
    if (!this.data.formData.content || this.data.formData.content === '<p><br></p>') {
      return '请输入正文内容！'
    }

    // 摘要不能多于500字
    if (this.data.formData.excerpt.trim().length > 500) {
      return '文章摘要不能多于500字！'
    }

    // 开启付费
    if (this.data.isOPenPay && (!this.data.formData.integral && !this.data.formData.price)) {
      return '开启付费后，请输入金额或积分！'
    }
  },

  // 订阅消息
  postsub(extid, subscribemessagesid, postStatus) {
    var self = this

    if (!self.data.userSession.sessionId) {
      Auth.checkSession(app, API, self, 'isLoginNow', util)
    } else {
      var subscribetype = "postCommentSubscribe"
      self.setData({ postStatus: postStatus })
      Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid, extid, util)
    }
  },

  // 取消发布
  cancelPublish() {
    // 返回首页
    function goBack() {
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 1000)
    }

    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      // showTitle: false,
      confirmText: "保存",
      confirmColor: "#2f80ed",
      cancelColor: "#999",
      content: '是否保存当前内容到草稿箱？',
      success: (data) => {
        if (data.confirm) {
          // 内容缓存
          wx.setStorage({
            key: "article",
            data: this.data.formData,
            success: res => {
              goBack()
            },
            fail: res => {
              wx.showToast({
                title: '文章缓存失败！',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          // 清除内容缓存
          wx.removeStorageSync('article')
          goBack()
        }
      }
    })
  },

  // 富文本编辑器相关
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({ editorHeight, keyboardHeight })
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context

      if(!res) return

      let content = wx.getStorageSync('article').content
      that.editorCtx.setContents({
        html: content || '',
        success: function(res) {
          let formData = that.data.formData
          formData.content = content
          that.setData({
            formData
          })
        }
      })
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  undo() {
    this.editorCtx.undo()
  },
  redo() {
    this.editorCtx.redo()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        // console.log('insert divider success')
      }
    })
  },

  // 清空
  clear() {
    wx.lin.showDialog({
      type: "confirm",
      title: "提示",
      // showTitle: false,
      confirmText: "确定",
      confirmColor: "#2f80ed",
      cancelColor: "#999",
      content: "你确定要清空编辑器中的内容吗？",
      success: (data) => {
        if (data.confirm) {
          this.editorCtx.clear({
            success: function (res) {
              // console.log("clear success")
            }
          })
        }
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  // 插入年月日时间
  insertDate() {
    const date = new Date()
    let h = date.getHours()
    let hour = h < 10 ? `0${h}` : h

    const formatDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hour}:${date.getMinutes()}:${date.getSeconds()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  // 插入图片
  insertImage() {
    const that = this

    let sessionId = that.data.userSession.sessionId
    let userId = that.data.userSession.userId
    let formData = {
      'sessionid': sessionId,
      'userid': userId,
      'fileName': ""
    }

    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', , 'camera'],
      success: (res) => {
        var tempFiles = res.tempFiles;
        var bigFileCount = 0;
        var upLoadFileCount = 0;
        var pics_array = new Array()
        for (var i = 0; i < tempFiles.length; i++) {
          var tempFileSize = Math.ceil((tempFiles[i].size) / 1024);
          var tempFilePath = tempFiles[i].path;
          if (tempFileSize > 2048) {
            bigFileCount++;
            Adapter.toast('图片大于2M', 3000);
            continue;
          } else {
            var data = {};
            data.imgfile = tempFilePath
            data.formData = formData

            // 上传loading
            wx.showLoading({
              title: "正在上传图片...",
              mask: true
            })

            API.uploadFile(data).then(res => {
              var res = JSON.parse(res.trim())

              if (res.success) {
                that.editorCtx.insertImage({
                  src: res.imageurl,
                  data: {
                    id: res.attachmentPostId,
                    role: 'god'
                  },
                  width: '100%'
                })

                // 单独维护的上传图片列表
                that.data.imgList.push({
                  src: res.imageurl,
                  id: res.attachmentPostId
                })
              } else {
                wx.showToast({
                  title: res.message,
                  mask: false,
                  icon: "none",
                  duration: 2000
                })
              }

              wx.hideLoading()
            }).catch(err => {
              wx.showToast({
                icon: 'none',
                title: err.errMsg || '上传失败...'
              })

              wx.hideLoading()
            })
          }
        }
      }
    })
  },

  add_video: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var videoposter= self.data.videoposter
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    
    var data = {};
    var _formData = {
      'sessionid': sessionId,
      'userid': userId
    };
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 10,
      compressed: true,
      camera: 'back',
      success(res) {
        var size = Math.ceil((res.size) / 1024);
        var duration = Math.round(res.duration);
        if (size > 2048) {
          Adapter.toast('上传的视频不能大于2M', 3000);
          return;
        }
        data.imgfile = res.tempFilePath;
        _formData.fileName = "";
        data.formData = _formData;
        wx.showLoading({
          title: "正在上传视频...",
          mask: true
        });
        API.uploadFile(data).then(res => {
          var res = JSON.parse(res.trim());

          if (res.code == 'error') {
            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 3000
            });
          } else {
            let formData = self.data.formData

            formData.videoSrc=res.imageurl;
            formData.videoUrl=res.imageurl;
            formData.videoPostId=res.attachmentPostId;
            formData.poster=videoposter;
           // formData.video_poster=videoposter;
            formData.videoDuration=duration;
            self.setData({formData:formData});
          }
          wx.hideLoading();
        }).catch(err => {
          wx.showToast({
            icon: 'none',
            title: err.errMsg || '上传失败...'
          });
          wx.hideLoading()
        })
      }
    })
  },
  del_video: function(e) {
    let self = this;
    var touchTime = self.data.v_touch_end - self.data.v_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          var sessionId = self.data.userSession.sessionId;
            var userId = self.data.userSession.userId;
            if (!sessionId || !userId) {
              Adapter.toast('请先授权登录', 3000);
              return;
            }
            var id = self.data.formData.videoPostId;
            var args = {
              'sessionid': sessionId,
              'userid': userId,
              'id': id
            };
            API.deleteFile(args).then(res => {
              let formData = self.data.formData;
              formData.videoSrc='';
              formData.poster='';
              formData.video_poster='';
              formData.videoDuration=0;
              self.setData({
                formData:formData
              })
            }).catch(err => {
              self.setData({
                formData:formData
              })
            })
        }
      })

    }
  },

  parserLink: function() {

    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    

    wx.getClipboardData({
      success: function (res) {
        var info = util.getUrlInfo(res.data)
        if (info.infoType == 'video_qq_m' || info.infoType == 'video_qq_pc') {
          var vid = "";
          vid = info.infoType == 'video_qq_pc' ? util.GetUrlFileName(res.data) : util.GetQueryString(res.data, "vid");
          if (vid) {
            let formData = self.data.formData
            formData.vid=vid
            self.setData({
              formData: formData
            })
          } else {
            Adapter.toast('解析腾讯视频链接错误！', 3000);
          }
        } else if (!info.infoType || !info) {
          Adapter.toast('请复制腾讯视频链接哟！', 3000);
        } else {
          Adapter.toast('视频链接解析错误，换一个试试吧！', 3000);
        }
      }
    })
  },
  del_link_video: function(e) {
    let self = this;
    var touchTime = self.data.v_link_touch_end - self.data.v_link_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          let formData = self.data.formData
          formData.vid='';
          self.setData({
            formData: formData
          })
        }
      })
    }
  },
  add_video_poster: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }

    var formData = {
      'sessionid': sessionId,
      'userid': userId,
      'fileName': ""
    };

    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', , 'camera'],
      success: (res) => {
        var tempFiles = res.tempFiles;
        var bigFileCount = 0;
        var upLoadFileCount = 0;
        // wx.showLoading({
        //   title: "正在上传图片...",
        //   mask:true
        // });
        var pics_array = new Array()
        for (var i = 0; i < tempFiles.length; i++) {
          var tempFileSize = Math.ceil((tempFiles[i].size) / 1024);
          var tempFilePath = tempFiles[i].path;
          if (tempFileSize > 2048) {
            bigFileCount++;
            Adapter.toast('图片大于2M', 3000);
            continue;

          } else {
            var data = {};
            data.imgfile = tempFilePath;
            data.formData = formData;
            API.uploadFile(data).then(res => {
              var res = JSON.parse(res.trim());
              if (res.code == 'error') {
                wx.showToast({
                  title: res.message,
                  mask: false,
                  icon: "none",
                  duration: 3000
                });
              } else {

                var video_poster = res.imageurl;
                var formData = self.data.formData;

                formData.poster=video_poster;
                formData.video_poster=video_poster;

                self.setData({
                  formData:formData
                })

              }
              wx.hideLoading();

            }).catch(err => {
              wx.showToast({
                icon: 'none',
                title: err.errMsg || '上传失败...'
              });
              wx.hideLoading()
            })
          }
        }
      }
    })

  },
  vlinktouchstart: function(e) {
    let that = this;
    that.setData({
      v_link_touch_start: e.timeStamp
    })
  },
  vlinktouchend: function(e) {
    let that = this;
    that.setData({
      v_link_touch_end: e.timeStamp
    })
  },
  vtouchstart: function(e) {
    let that = this;
    that.setData({
      v_touch_start: e.timeStamp
    })
  },
  vtouchend: function(e) {
    let that = this;
    that.setData({
      v_touch_end: e.timeStamp
    })
  },

  onBindBlur: function (e) {
    let formData = this.data.formData
    formData.vid = e.detail.value.trim()
    this.setData({
      formData: formData
    })
  },
  del_pic: function (e) {
    let self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var touchTime = self.data.touch_end - self.data.touch_start;
    if (touchTime > 350) {
      let src = e.currentTarget.dataset.src;
      var id = e.currentTarget.dataset.id;
      var pics_array = self.data.pics_array;
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          if (res.tapIndex == 0) {
            var args = {
              'sessionid': sessionId,
              'userid': userId,
              'id': id
            };
            API.deleteFile(args).then(res => {
              pics_array = pics_array.filter(function (item) {
                return item.imagePostId != id;
              });
              self.setData({
                pics_array: pics_array
              })
            }).catch(err => {
              pics_array = pics_array.filter(function (item) {
                return item.imagePostId != id;
              });

              self.setData({
                pics_array: pics_array
              })
            })
          }
        }
      })
    }

  },
  mytouchstart: function (e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  mytouchend: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },


  myVideotouchstart: function (e) {
    let that = this;
    that.setData({
      video_touch_start: e.timeStamp
    })
  },
  myVideotouchend: function (e) {
    let that = this;
    that.setData({
      video_touch_end: e.timeStamp
    })
  },

  del_video_poster: function (e) {
    let self = this;
    var touchTime = self.data.video_touch_end - self.data.video_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          let formData = self.data.formData
          formData.video_poster = ''
          self.setData({
            formData: formData
          })
        }
      })
    }
  }
})