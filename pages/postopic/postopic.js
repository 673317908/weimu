/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require('../../utils/api.js')
const Auth = require('../../utils/auth.js')
const Adapter = require('../../utils/adapter.js')
const util = require('../../utils/util.js');
const NC = require('../../utils/notificationcenter.js')
var WxParse = require('../../vendor/wxParse/wxParse.js');
let ArrayList = require("../../utils/arrayList.js");

const recorderManager = wx.getRecorderManager();
const backgroundAudioManager = wx.getBackgroundAudioManager();

const recorderOptions = {
  duration: 20000,
  sampleRate: 44100,
  numberOfChannels: 2,
  encodeBitRate: 192000,
  format: 'mp3',
  frameSize: 50
}
var app = getApp();

var intervalAudioTime, intervalDeg;
Page({
  data: {
    pics: [],
    pics_array: [],
    link_pics: [],
    link_pics_array: [],
    wxParseData: [],
    display: 'none',
    page: 1,
    scrollHeight: 0,
    isGetUserInfo: false,
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    imageObject: [],
    imagescontents: [],
    tempFilePaths: [],
    buttonDisabled: false,
    show: false,
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    videoSrc: '',
    vid: '',
    content: '',
    poster: '',
    video_poster: '',
    videoUrl: '',
    videoDuration: 0,
    videoPostId: '',
    linkPoster: '',
    linkVideoUrl: '',
    linkVideoSrc: '',
    title: '',
    addImagesFlag: "image-on.png",
    addVideoFlag: "video-off.png",
    addAudioFlag: "audio-off.png",
    addLinkFlag: "link-off.png",
    addFileFlag: "file-off.png",
    messageFile: {},
    fileLink: "",
    fileType: "",
    fileName: "",
    filePostId: "",

    showMask: false,
    audioShow: false,
    recordStatus: "recordReady", //准备录音
    deg: 0, //
    audioTime: 0, //录音时长
    playTime: 0,
    isPlaying: 0, //是否正在播放
    completeRecord: 0, //录音是否完成
    showAudioTime: "00:00",
    playStatus: "ready",
    audioDuration: 0,
    audioSize: 0,
    audioUrl: '',
    audioName: '',
    audioPostId: "",
    audioSrc: "",

    activeType: "images", //要上传的文件类型,
    location: "",
    latitude: "",
    longitude: "",
    address: "",
    isOPenlocation: false,
    isOpenZan: false,
    scopeUserLocation: 'undefined',

    dialogshow: false,
    forums: [],
    topicIndex:0,
    settings:{},
    selectTags:[],
    pageName:"postopic",
    postStatus:"",
  },
  onLoad: function(options) {
    var self = this;
    var forumId = options.forumid;
    var videoposter = options.videoposter;
    this.getSetting();
    wx.getSystemInfo({
      success: function(res) {
        //console.info(res.windowHeight);
        self.setData({
          scrollHeight: res.windowHeight,

        });
      }
    });
    wx.getSetting({
      success(res) {
        if (typeof(res.authSetting['scope.userLocation']) == 'undefined') {
          self.setData({
            scopeUserLocation: "undefined"
          });
        } else {
          self.setData({
            scopeUserLocation: res.authSetting['scope.userLocation'] ? 'true' : 'false'
          });

        }

      }

    })

    backgroundAudioManager.onEnded(() => {
      self.setData({
        isPlaying: 0
      })
    });

    recorderManager.onError(res => {
      if (res.errMsg && (res.errMsg == 'operateRecorder:fail:auth denied' || res.errMsg == 'operateRecorder:fail auth deny')) {
        wx.showToast({
          title: "用户未授权使用录音",
          mask: false,
          icon: "none",
          duration: 3000
        });
        self.setData({
          audioShow: false,
          showMask: false,
          audioSrc: "",
          recordStatus: "recordReady",
          audioTime: 0,
          deg: 0
        })
        clearInterval(intervalAudioTime);
        clearInterval(intervalDeg);
      }

    })
    Auth.setUserMemberInfoData(self);
    // Auth.checkLogin(app,API,self,'isLoginLater',util);
    let list = new ArrayList();
    let list2 = new ArrayList();
    this.setData({
      //pics: list,
      // pics_array: list.toArray(),
      link_pics: list2,
      link_pics_array: list2.toArray(),
      forumId: forumId,
      videoposter: videoposter,
      forumId: forumId
    })  

    this.loadBBForums();
    this.getTags();


  },
  getSetting:function()
  {
    var self=this;
    API.getSettings().then(res => {

      self.setData({
        settings: res.settings
      })

    })

  },

  getTags:function()
  {
    var self = this;
    var tagtype="raw_topic_tagrecommend"
    API.getRecommendTags(tagtype).then(res=>{

       self.setData({tags:res})

    })

  },

  loadBBForums: function() {
    var self = this;
    var forumId=self.data.forumId;

    var args={};

    API.getBBForums(args).then(res => {
      var forums=res;
      var topicIndex=0;
      for(var i=0;i<forums.length;i++)
      {
        if(forumId==forums[i].id)
        {
          topicIndex=forums[i].index;
          break;
        }
        
      }
      self.setData({
        forums: forums,
        topicIndex:topicIndex
      })

    })


  },

  onChangeTap: function(e) {
    var forumId = e.detail.currentKey;
    this.setData({
      forumId: forumId
    });
  },
  checkboxChange:function(e)
  {
      var selectTags= e.detail.value;
      this.setData({selectTags:selectTags})
  },

  add_pic: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }

    if (self.data.pics_array.length > 9) {
      Adapter.toast('限定上传9张图片', 3000);
      return;

    }

    var picCount = parseInt(self.data.pics_array.length);
    var count=9-picCount;
    var formData = {
      'sessionid': sessionId,
      'userid': userId,
      'fileName': ""
    };

    wx.chooseImage({
      count: count,
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
        var pics_array = self.data.pics_array;
        for (var i = 0; i < tempFiles.length; i++) {
          var tempFileSize = Math.ceil((tempFiles[i].size) / 1024);
          var tempFilePath = tempFiles[i].path;
          if (tempFileSize > 2048) {
            bigFileCount++;
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

                pics_array.push({
                  path: res.imageurl,
                  upload: true,
                  local: true,
                  imagePostId: res.attachmentPostId,
                })
                self.setData({
                  pics_array: pics_array
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

                var video_poster = res.imageurl

                self.setData({
                  video_poster: video_poster,
                  poster: video_poster
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

  add_audio: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }

    wx.getSetting({
      success(res) {
        if (typeof(res.authSetting['scope.record']) == 'undefined') {
          self.setData({
            audioShow: true,
            showMask: true
          })
          return;

        }
        if (!res.authSetting['scope.record']) {
          wx.openSetting({
            success(res) {
              if (res.authSetting['scope.record']) {

                self.setData({
                  audioShow: true,
                  showMask: true
                })
              } else {

                wx.showToast({
                  title: "用户未授权使用录音",
                  mask: false,
                  icon: "none",
                  duration: 3000
                });

              }
            }
          })
        } else {
          self.setData({
            audioShow: true,
            showMask: true
          })

        }
      }
    })

  },

  cancelRecord: function() {

    this.setData({
      audioShow: false,
      showMask: false
    });

  },

  add_video: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var videoposter = self.data.videoposter;
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    var videoSrc = self.data.videoSrc;
    var vid = self.data.vid;
    if (videoSrc != "" || vid != "") {
      Adapter.toast('只能添加一个视频', 3000);
      return;
    }
    var data = {};
    var formData = {
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
        formData.fileName = "";
        data.formData = formData;
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
            self.setData({
              videoSrc: res.imageurl,
              videoUrl: res.imageurl,
              videoPostId: res.attachmentPostId,
              poster: videoposter,
              videoDuration: duration
            });

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

  onBindBlur: function(e) {
    var linkInfo=e.detail.value.trim();
    var self =this;
    if(linkInfo)
    {
      var info = util.getUrlInfo(linkInfo);
      if(info.infoType !='')
      {
        this.setData({
          linkInfo: linkInfo
        });

      }
      else
      {
        self.setData({
          linkInfo: ''
        })
        Adapter.toast('无法解析此链接', 1000);
      }
      

    }
    
  },  
  onShow: function() {
    var self = this;
    if (self.data.isOpenZan) {
      var data = {};
      data.userId = self.data.userSession.userId;
      data.sessionId = self.data.userSession.sessionId;
      API.getMyzanImage(data).then(res => {
        if (res.code) {
          self.setData({
            isOpenZan: false
          });
        }
      }).catch(err => {
        self.setData({
          isOpenZan: false
        });

      })
    }
    wx.getClipboardData({
      success: function(res) {
        var data = res.data;
        var info = util.getUrlInfo(res.data);
        if (data && info.infoType !="") {
          self.setData({
            pastelink: data
          })
        }
        else
        {
          self.setData({
            pastelink: ''
          })
        }
      }
    })

  },
  /**
   * 监听链接输入
   */
  changeLink: function(e) {
    var linkInfo = e.detail.value;
    if(linkInfo)
    {
      this.setData({
        linkInfo: linkInfo
      })

    }
    
  },
  pastelink:function(e)
  {
    var pastelink=e.currentTarget.dataset.pastelink;
    this.setData({linkInfo:pastelink});

  },
  parserLink: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;

    var linkVideoSrc = self.data.linkVideoSrc;


    const text = self.data.linkInfo;
    var info = util.getUrlInfo(text);
    if (info.infoType == 'video_qq_m' || info.infoType == 'video_qq_pc') {
      var vid = "";
      vid = info.infoType == 'video_qq_pc' ? util.GetUrlFileName(text) : util.GetQueryString(text, "vid");
      if (vid !== "" && vid != null) {
        self.setData({
          vid: vid,
          videoUrl: ''
        });
        // e.detail.value="";

        self.setData({
          linkInfo: ""
        })
      } else {
        //  e.detail.value="";
        Adapter.toast('解析腾讯的视频链接错误', 3000);
      }



    } else if (info.infoType == 'video_douyin') {
      info.sessionId = sessionId;
      info.userId = userId;
      Adapter.getVideo(info, API, self)

    } else if (info.infoType == "weibo") {
      info.sessionId = sessionId;
      info.userId = userId;
      Adapter.getWeibo(info, API, self)
    }
     else if (info.infoType == "toutiao") {
      info.sessionId = sessionId;
      info.userId = userId;
      Adapter.getToutiao(info, API, self)
    }
    else
    {
      self.setData({linkInfo:''})
    }
  },

  del_pic: function(e) {
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
              pics_array = pics_array.filter(function(item) {
                return item.imagePostId != id;
              });
              self.setData({
                pics_array: pics_array
              })
            }).catch(err => {
              pics_array = pics_array.filter(function(item) {
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

  del_link_pic: function(e) {
    let self = this;
    var touchTime = self.data.link_pic_touchend - self.data.link_pic_touchstart;
    if (touchTime > 350) {
      let item = e.currentTarget.dataset.src;
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          if (res.tapIndex == 0) {
            self.data.link_pics.remove(item);
            var link_pics_array = new Array()
            self.data.link_pics.toArray().map(path => {
              link_pics_array.push({
                path: path,
                upload: false,
                progress: 0,
              })
            })
            self.setData({
              link_pics: self.data.link_pics,
              link_pics_array: link_pics_array
            })
          }
        }
      })
    }

  },

  del_video: function(e) {
    let self = this;
    var touchTime = self.data.v_touch_end - self.data.v_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          if (e.target.id == "qqvideo") {
            self.setData({
              vid: ''
            })
          } else {
            var sessionId = self.data.userSession.sessionId;
            var userId = self.data.userSession.userId;
            if (!sessionId || !userId) {
              Adapter.toast('请先授权登录', 3000);
              return;
            }
            var id = self.data.videoPostId;
            var args = {
              'sessionid': sessionId,
              'userid': userId,
              'id': id
            };
            API.deleteFile(args).then(res => {
              self.setData({
                videoSrc: '',
                poster: "",
                video_poster: "",
                videoDuration: 0
              })
            }).catch(err => {
              self.setData({
                videoSrc: '',
                poster: "",
                video_poster: "",
                videoDuration: 0
              })
            })

          }
          self.setData({
            videoUrl: ''
          })
        }
      })
    }
  },

  del_link_video: function(e) {
    let self = this;
    var touchTime = self.data.v_link_touch_end - self.data.v_link_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          if (e.target.id == "qqvideo") {
            self.setData({
              vid: ''
            })
          } else {
            self.setData({
              linkVideoSrc: '',
              linkPoster: ""
            })
          }
          self.setData({
            linkVideoUrl: ''
          })
        }
      })

    }

  },

  mytouchstart: function(e) {
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })
  },
  mytouchend: function(e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })
  },


  myVideotouchstart: function(e) {
    let that = this;
    that.setData({
      video_touch_start: e.timeStamp
    })
  },
  myVideotouchend: function(e) {
    let that = this;
    that.setData({
      video_touch_end: e.timeStamp
    })
  },

  del_video_poster: function(e) {
    let self = this;
    var touchTime = self.data.video_touch_end - self.data.video_touch_start;
    if (touchTime > 350) {
      wx.showActionSheet({
        itemList: ['删除'],
        success: (res) => {
          self.setData({
            video_poster: ''
          })
        }
      })
    }
  },

  linkPictouchstart: function(e) {
    let that = this;
    that.setData({
      link_pic_touchstart: e.timeStamp
    })
  },
  linkPictouchend: function(e) {
    let that = this;
    that.setData({
      link_pic_touchend: e.timeStamp
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
  chooseMessageFile: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }

    var formData = {
      'sessionid': sessionId,
      'userid': userId
    };
    var extension = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf'];
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: extension,
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        var messageFile = res.tempFiles[0];

        var fileSize = messageFile.size;
        var fileName = messageFile.name;
        var filePath = messageFile.path;
        var fileType = util.getExtname(messageFile.name);
        var tempFileSize = Math.ceil(fileSize / 1024);
        if (tempFileSize > 2048) {
          Adapter.toast('选择的文件不能大于2M', 3000);
          return;

        }
        if (fileType == "doc" || fileType == "docx" || fileType == "ppt" || fileType == "pptx" || fileType == "xls" || fileType == "xlsx" || fileType == "pdf") {
          wx.showLoading({
            title: "正在上传文件...",
            mask: true
          });
          var data = {};
          formData.fileName = fileName;
          data.imgfile = filePath;
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
              self.setData({
                fileLink: res.imageurl,
                filePostId: res.attachmentPostId,
                fileName: fileName,
                fileType: fileType,
                messageFile: messageFile
              });

            }
            wx.hideLoading();

          }).catch(err => {
            wx.showToast({
              icon: 'none',
              title: err.errMsg || '上传失败...'
            });
            wx.hideLoading()
          })

        } else {
          Adapter.toast('只能选择的文件类型：doc、docx、ppt、pptx、xls、xlsx和pdf', 3000);
        }
      }
    })
  },
  del_link_doc: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) => {
        var filePostId = self.data.filePostId;
        if (filePostId != "") {

          var args = {
            'sessionid': sessionId,
            'userid': userId,
            'id': filePostId
          };

          API.deleteFile(args).then(res => {
            self.setData({
              fileLink: "",
              fileName: "",
              fileType: "",
              filePostId: "",
              messageFile: {}
            });

          }).catch(err => {
            wx.showToast({
              icon: 'none',
              title: err.errMsg || '删除失败...'
            })
          })
        }
      }
    })
  },

  addMedia: function(e) {
    var self = this;
    var mediaFlag = e.currentTarget.id;
    this.changeAddFlag(mediaFlag);
    self.setData({
      activeType: e.currentTarget.dataset.type
    })
  },

  changeAddFlag: function(flag) {

    var self = this;
    switch (flag) {
      case 'images':
        self.setData({
          addImagesFlag: "image-on.png",
          addVideoFlag: "video-off.png",
          addAudioFlag: "audio-off.png",
          addLinkFlag: "link-off.png",
          addFileFlag: "file-off.png"

        });
        break;
      case 'video':
        self.setData({
          addImagesFlag: "image-off.png",
          addVideoFlag: "video-on.png",
          addAudioFlag: "audio-off.png",
          addLinkFlag: "link-off.png",
          addFileFlag: "file-off.png"

        });
        break;
      case 'audio':
        self.setData({
          addImagesFlag: "image-off.png",
          addVideoFlag: "video-off.png",
          addAudioFlag: "audio-on.png",
          addLinkFlag: "link-off.png",
          addFileFlag: "file-off.png"

        });
        break;
      case 'link':
        self.setData({
          addImagesFlag: "image-off.png",
          addVideoFlag: "video-off.png",
          addAudioFlag: "audio-off.png",
          addLinkFlag: "link-on.png",
          addFileFlag: "file-off.png"

        });
        break;
      case 'file':
        self.setData({
          addImagesFlag: "image-off.png",
          addVideoFlag: "video-off.png",
          addAudioFlag: "audio-off.png",
          addLinkFlag: "link-off.png",
          addFileFlag: "file-on.png"

        });
        break;
    }

  },
  // 选择话题分类
  bindPickerChange: function(e) {
    var self= this;
    var topicIndex=e.detail.value;
    var forumId=self.data.forumId;
    var forums=self.data.forums; 
    for(var i=0;i<forums.length;i++)
    {
      if(topicIndex==forums[i].index)
      {
        forumId= forums[i].id;
        break;
      }
    }
      

    this.setData({
      topicIndex: topicIndex,
      forumId:forumId
    })
  },
  //提交话题内容
  formSubmit: function(e) {
    var self = this;
    var name = self.data.userInfo.nickName;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    var bbcontent = e.detail.value.inputContent;

    if (bbcontent.length === 0) {
      // self.setData({
      //   'dialog.hidden': false,
      //   'dialog.title': '提示',
      //   'dialog.content': '请输入内容'
      // });
      Adapter.toast('请输入内容', 3000);
      return false;
    }

    var selectTags = self.data.selectTags
    if(selectTags.length==0)
    {
      // self.setData({
      //   'dialog.hidden': false,
      //   'dialog.title': '提示',
      //   'dialog.content': '请选择一个话题标签'
      // });
      Adapter.toast('请选择一个话题标签', 3000);
      return false;

    }

    //var title = e.detail.value.inputTitle.replace('"','');
    var title = "";
    var inputContent=e.detail.value.inputContent;
    if(inputContent.length > 30) {
      title = inputContent.substring(0, 30) + "...";
    }
    else{
      title=inputContent;
    }

    var author_avatar = self.data.userInfo.avatarUrl;
    var forumId = self.data.forumId;
   

    if (title.length > 100) {
      // self.setData({
      //   'dialog.hidden': false,
      //   'dialog.title': '提示',
      //   'dialog.content': '标题多于100字'
      // });
      Adapter.toast('标题多于100字', 3000);
      return false;
    }
    if (bbcontent.length > 10000) {
      // self.setData({
      //   'dialog.hidden': false,
      //   'dialog.title': '提示',
      //   'dialog.content': '内容多于10000字'
      // });
      Adapter.toast('内容多于10000字', 3000);
      return false;
    }

    var imageObject = [];
    var pics_array = self.data.pics_array;
    if (pics_array.length > 0) {
      for (var i = 0; i < pics_array.length; i++) {
        var filePath = pics_array[i].path;
        imageObject = imageObject.concat('<img src="' + filePath + '"/><br/>');

      }
    }
    var link_pics_array = self.data.link_pics_array;

    if (link_pics_array.length > 0) {
      for (var i = 0; i < link_pics_array.length; i++) {
        var linkFilePath = link_pics_array[i].path;
        imageObject = imageObject.concat('<img src="' + linkFilePath + '"/><br/>');

      }
    }

    var imagesString = imageObject.toString();
    if (imagesString != "") {
      var reg = new RegExp(',', "g");
      imagesString = imagesString.replace(reg, "");
      bbcontent = '<p>' + bbcontent + '</p><p>' + imagesString + '</p>';
    }


    var videoSrc = self.data.videoSrc;
    var videoUrl = self.data.videoUrl;
    var poster = self.data.poster;
    var video_poster = self.data.video_poster;
    var videoDuration = self.data.videoDuration;

    if (video_poster != "") {
      poster = video_poster;

    }


    var videoFlag = "0";
    if (videoSrc != "") {
      bbcontent = bbcontent + '<p> <video src="' + videoUrl + '" poster="' + poster + '" controls="controls" width="100%"></video></p>';
      videoFlag = "1";
    }


    var linkVideoSrc = self.data.linkVideoSrc;
    var linkVideoUrl = self.data.linkVideoUrl;
    var linkPoster = self.data.linkPoster;


    if (linkVideoSrc != "") {
      bbcontent = bbcontent + '<p> <video src="' + linkVideoUrl + '" poster="' + linkPoster + '" controls="controls" width="100%"></video></p>';
      videoFlag = "1";
      video_poster=linkPoster;
    }


    var vid = self.data.vid;
    if (vid != "") {
      bbcontent = bbcontent + '<p> <iframe frameborder="0" src="https://v.qq.com/txp/iframe/player.html?vid=' + vid + '" allowFullScreen="true" width="100%" height="500px"></iframe></p>';
      videoFlag = "1";
    }

    var audioFlag = "0";
    var audioUrl = self.data.audioUrl;
    var playTime = self.data.playTime;
    if (audioUrl != "") {
      bbcontent = bbcontent + '<p> <audio title="' + self.data.audioName + '" src="' + audioUrl + '" controls="controls"><span data-mce-type="bookmark" style="display: inline-block; width: 0px; overflow: hidden; line-height: 0;" class="mce_SELRES_start"></span></audio>';
      audioFlag = "1";
    }


    if (bbcontent.length === 0) {
      // self.setData({
      //   'dialog.hidden': false,
      //   'dialog.title': '提示',
      //   'dialog.content': '请填写文章内容并至少上传一张图片,或一个视频,或一段音频'
      // });
      Adapter.toast('请填写文章内容并至少上传一张图片,或一个视频,或一段音频', 3000);
      return false;
    }

    var fileLink = self.data.fileLink;
    var fileName = self.data.fileName;
    var fileType = self.data.fileType;

    // if(fileLink !="")
    // {
    //   bbcontent =  bbcontent + '<p> 文档： <a href="'+fileLink+'"  target="_blank"></a></p>';  
    // }

    var isOpenZan = self.data.isOpenZan ? 'true' : "false";

    var videoPostId = self.data.videoPostId;
    var filePostId = self.data.filePostId;
    var audioPostId = self.data.audioPostId;



    var location = self.data.location;
    var address = self.data.address;
    var latitude = self.data.latitude;
    var longitude = self.data.longitude;


    var data = {
      sessionid: sessionId,
      userid: userId,
      content: bbcontent,
      title: title,
      tags: selectTags,
      videoFlag: videoFlag,
      audioFlag: audioFlag,
      fileLink: fileLink,
      fileName: fileName,
      fileType: fileType,
      videoUrl: videoUrl,
      videoDuration: videoDuration,
      audioUrl: audioUrl,
      playTime: playTime,
      pics_array: pics_array,
      videoPostId: videoPostId,
      filePostId: filePostId,
      audioPostId: audioPostId,
      isOpenZan: isOpenZan,
      location: location,
      address: address,
      latitude: latitude,
      longitude: longitude,
      video_poster:video_poster

    };

    wx.z.showDialog({
      type: "confirm",
      title: "提示",
      content: "是否提交话题？",
      confirmText: "提交",
      isCoverView: true,
      success: (res) => {
        if (res.confirm) {
          Adapter.postBBTopic(forumId, data, API, self,util);
        }
      }
    })  
  },


  confirm: function() {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },

  //文本域失去焦点时 事件处理
  textAreaBlur: function(e) {
    //获取此时文本域值
    this.setData({
      content: e.detail.value
    })

  },
  //文本域获得焦点事件处理
  textAreaFocus: function() {
    this.setData({
      isShow: false,
    })
  },

  //擦除重写
  formReset: function(e) {
    this.setData({
      chosen: ''
    })
  },
  modalChange: function(e) {
    this.setData({
      modalHidden: true
    })
  },

  recordStart: function() {

    var self = this;
    self.setData({
      recordStatus: "recording"
    });
    recorderManager.start(recorderOptions);
    intervalAudioTime = setInterval(function() {
      var audioTime = self.data.audioTime + 1;
      var showAudioTime = self.getShowAudioTime(audioTime);
      self.setData({
        audioTime: audioTime,
        showAudioTime: showAudioTime
      }, function(a) {
        20 == self.data.audioTime && self.recordStop();
      });
    }, 1000);

    intervalDeg = setInterval(function() {
      self.setData({
        deg: self.data.deg + 1.8
      });
    }, 100);

  },
  recordStop: function() {
    var self = this;
    clearInterval(intervalAudioTime);
    clearInterval(intervalDeg);
    if (self.data.audioTime < 5) {

      Adapter.toast('录音时长不能少于5秒', 2000);
      recorderManager.stop()
      recorderManager.onStop((res) => {
        self.setData({
          audioSrc: "",
          recordStatus: "recordReady",
          audioTime: 0,
          deg: 0
        })
      })
      return
    }

    recorderManager.stop()
    recorderManager.onStop((res) => {
      self.setData({
        audioDuration: res.duration / 1000,
        audioSize: res.fileSize,
        audioSrc: res.tempFilePath,
        recordStatus: "recordStop",
        playTime: parseInt(self.data.audioTime),
        audioTime: 0,
        showAudioTime: "00:00",
        deg: 0,
        playStatus: "ready"
      })
    })
  },

  returnRecord: function() {
    var self = this;
    self.setData({
      audioSrc: "",
      recordStatus: "recordReady",
      audioTime: 0,
      deg: 0
    })
  },

  selectAudio: function() {
    var self = this;
    var name = self.data.userInfo.nickName;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    var time = new Date()
    time = util.formatDate(time, "yyyy-MM-dd-HH-mm-ss");
    var audioName = name + "-" + time + "录音"

    var data = {};
    var formData = {
      'sessionid': sessionId,
      'userid': userId
    };

    wx.showLoading({
      title: "正在上传录音...",
      mask: true
    });
    data.imgfile = self.data.audioSrc;
    formData.fileName = audioName;
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
        self.setData({
          audioUrl: res.imageurl,
          audioPostId: res.attachmentPostId,
          audioName: audioName,
          recordStatus: "recordReady",
          audioTime: 0,
          deg: 0,
          audioShow: false,
          showMask: false
        });
      }
      wx.hideLoading();

    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: err.errMsg || '上传失败...'
      });
      wx.hideLoading()
    })
  },
  audioPlay: function() {
    var self = this;
    var playTime = parseInt(self.data.playTime);
    self.setData({
      playStatus: 'pause'
    });
    backgroundAudioManager.src = self.data.audioSrc;
    backgroundAudioManager.title = "我的录音";
    intervalAudioTime = setInterval(function() {
      var audioTime = self.data.audioTime + 1;
      var showAudioTime = self.getShowAudioTime(audioTime);
      self.setData({
        audioTime: audioTime,
        showAudioTime: showAudioTime
      }, function(a) {
        playTime == self.data.audioTime && self.stopPlay();
      });
    }, 1000);

    intervalDeg = setInterval(function() {
      self.setData({
        deg: self.data.deg + 1.8
      });
    }, 100);

  },
  stopPlay: function() {
    backgroundAudioManager.stop();
    clearInterval(intervalAudioTime);
    clearInterval(intervalDeg);
    this.setData({
      playStatus: 'ready',
      audioTime: 0,
      showAudioTime: "00：00",
      deg: 0
    })
  },
  playRemoteAudio: function() {
    var self = this;
    backgroundAudioManager.src = self.data.audioUrl;
    backgroundAudioManager.title = self.data.audioName;
    self.setData({
      isPlaying: 1

    })

  },
  stopRemoteAudio: function() {
    backgroundAudioManager.stop();
    this.setData({
      isPlaying: 0

    })

  },
  del_audio: function() {
    var self = this;
    var sessionId = self.data.userSession.sessionId;
    var userId = self.data.userSession.userId;
    if (!sessionId || !userId) {
      Adapter.toast('请先授权登录', 3000);
      return;
    }
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) => {
        var filePostId = self.data.audioPostId;
        if (filePostId != "") {

          var args = {
            'sessionid': sessionId,
            'userid': userId,
            'id': filePostId
          };

          API.deleteFile(args).then(res => {
            self.setData({
              audioPostId: "",
              audioName: "",
              audioUrl: "",
              audioDuration: 0

            });
            Adapter.toast('删除成功', 3000);

          }).catch(err => {
            wx.showToast({
              icon: 'none',
              title: err.errMsg || '删除失败...'
            })
          })
        }
      }
    })

  },
  getShowAudioTime: function(audioTime) {
    var resultAudioTime = "00:00";
    if (audioTime < 10) {
      resultAudioTime = "00:0" + audioTime;

    } else {

      resultAudioTime = "00:" + audioTime;

    }

    return resultAudioTime;
  },
  openUserLocation: function(e) {
    var self = this;
    if (!e.detail.value) {
      self.setData({
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        isOPenlocation: false
      });
      return;
    }
    wx.chooseLocation({
      success: function(res) {
        self.setData({
          location: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          isOPenlocation: true
        });
      },
      fail: function(err) {
        if (err.errMsg == 'chooseLocation:fail:auth denied' || err.errMsg == 'chooseLocation:fail auth deny') {
          wx.showToast({
            title: "请开启微信定位服务和小程序位置授权",
            mask: false,
            icon: "none",
            duration: 3000
          });

          self.setData({
            isOPenlocation: false,
            scopeUserLocation: 'false'
          });
        } else if (err.errMsg == 'chooseLocation:fail cancel') {
          self.setData({
            isOPenlocation: false,
            scopeUserLocation: 'true'
          });

        }


      }
    })


  },

  openUserLocationBtn: function(e) {
    var self = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          wx.chooseLocation({
            success: function(res) {
              self.setData({
                location: res.name,
                address: res.address,
                latitude: res.latitude,
                longitude: res.longitude,
                isOPenlocation: true,
                scopeUserLocation: 'true'
              });
            },
            fail: function(err) {
              if (err.errMsg == 'chooseLocation:fail cancel') {
                self.setData({
                  isOPenlocation: false,
                  scopeUserLocation: 'true'
                });

              }

            }

          })
        } else {
          wx.showToast({
            title: "用户未授权使用位置信息",
            mask: false,
            icon: "none",
            duration: 3000,
            isOPenlocation: false,
            scopeUserLocation: 'false'
          });

        }
      }
    })
  },
  openZan: function(e) {

    var self = this;
    if (!e.detail.value) {
      self.setData({
        isOpenZan: false
      });
      return;
    }
    var data = {};
    data.userId = self.data.userSession.userId;
    data.sessionId = self.data.userSession.sessionId;
    var  content ="尚未设置"+self.data.settings.raw_praise_word+"二维码，是否设置？";
    API.getMyzanImage(data).then(res => {
      if (res.code) {
        wx.z.showDialog({
          type: "confirm",
          title: "提示",
          confirmText: "去设置",
          content: content,
          isCoverView: true,
          success: (res) => {
            if (res.confirm) {
              self.setData({
                isOpenZan: true
              });
              wx.navigateTo({
                url: '../authorcode/authorcode'
              });

            } else if (res.cancel) {
              self.setData({
                isOpenZan: false
              });

            }
          }
        })

      } else {
        self.setData({
          isOpenZan: true
        })
      }
    })
  }

})