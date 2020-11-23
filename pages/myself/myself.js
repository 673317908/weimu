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
const util = require('../../utils/util.js')
const NC = require('../../utils/notificationcenter.js')
import { logout } from '../../utils/auth.js'
import config from '../../utils/config.js'
const app = getApp()
const appName = app.globalData.appName
const pageCount = 10

const options = {
  data: {
    shareTitle: appName + '关于我',
    pageTitle: " ",
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isLoginPopup: false,
    system: '',
    enterpriseMinapp: '',
    raw_praise_word: '鼓励',
    postMessageId: "",
    scopeSubscribeMessage: '',
    newcontentSubscribeCount: 0,
    pageName:'myself',
    zan_display:'0',
    pendingCount:{},
    messagesCount:'',
    tabBarRedDotIndex:config.getTabBarRedDotIndex,
    redHotCount:0
  },

  onLoad: function (option) {
    let self = this;
    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system
        });
      }
    })
    Auth.checkSession(app, API, self, 'isLoginNow', util);
    //Auth.setUserMemberInfoData(self);
    Auth.checkLogin(self);
    self.getSettings();
  },
  onShow: function () {
    let self = this;
    Auth.setUserMemberInfoData(self);
     Auth.checkLogin(self);
    wx.setStorageSync('openLinkCount', 0);

    if(self.data.userSession.sessionId)
    {
      this.setData({
        isLoginPopup: false
      });
      self.onPullDownRefresh();
      self.getPendingCount();
     
     

    }
    
   
  },
  getSettings: function () {
    var self = this;
    API.getSettings().then(res => {
      var enterpriseMinapp = res.settings.enterpriseMinapp ? res.settings.enterpriseMinapp : "";
      var postMessageId = res.settings.postMessageId ? res.settings.postMessageId : "";
      var raw_praise_word = res.settings.raw_praise_word ? res.settings.raw_praise_word : "";
      var zan_display = res.settings.zan_display;
      this.setData({
        enterpriseMinapp: enterpriseMinapp,
        raw_praise_word: raw_praise_word,
        postMessageId: postMessageId,
        zan_display:zan_display
      });
    })
  },
  onReady: function () {
    var self = this;
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    });
   
  },
  onHide:function(){   
   

  },
  onPullDownRefresh: function () {

    this.setData({
      isPull: true
    });

    if (this.data.userSession.sessionId) {
      Auth.checkGetMemberUserInfo(this.data.userSession, this, API);
      
    }
    wx.stopPullDownRefresh()
  },
  agreeGetUser: function (e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, API, '0');

  },
  redictSetting: function () {
    wx.navigateTo({
      url: '../settings/settings'
    })
  },

  // 去积分等级说明页
  toIntegralDes() {
    if (!this.data.userSession.sessionId) {
      this.setData({
        isLoginPopup: true
      });

      
    }
    else
    {
      wx.navigateTo({
        url: `../myinfo/myinfo?integral=${this.data.memberUserInfo.integral}`
      })

    }
    
  },

  redictPage: function (e) {
    var mytype = e.currentTarget.dataset.mytype;
    if (mytype == "logout") {
      Auth.logout(this);
      wx.reLaunch({
        url: '../myself/myself'
      })
    } else if (mytype == "about") {
      var url = "";
      url = '../about/about';
      wx.navigateTo({
        url: url
      })



    } else {
      if (!this.data.userSession.sessionId) {
        this.setData({
          isLoginPopup: true
        });
      } else {
        if (mytype == "myorders") {
          wx.navigateTo({
            url: '../myorder/myorder'
          });
        } else if (mytype == "mypublish") {
          wx.navigateTo({
            url: '../m-myPublish/m-myPublish?userid=' + this.data.userSession.userId + "&postype=topic"
          });
        } else if (mytype == "myposts") {
          wx.navigateTo({
            url: '../m-myPublish/m-myPublish?userid=' + this.data.userSession.userId + "&postype=post"
          });
        } else if (mytype == "myMessages") {
          wx.navigateTo({
            url: '../mymessage/mymessage'
          });
          
        }else if (mytype == "mynotice") {
          wx.navigateTo({
            url: '../notice/notice'
          });
        }
        else if (mytype == "myshoporders") {
          wx.navigateTo({
            url: 'plugin-private://wx34345ae5855f892d/pages/orderList/orderList?tabId=pendingPay'
          });
          
        }else if (mytype == "myshoppingcart") {
          wx.navigateTo({
            url: 'plugin-private://wx34345ae5855f892d/pages/shoppingCart/shoppingCart'
          });
        } else if(mytype == "orderManage") {
          wx.navigateTo({
            url: '../shop/order/order'
          });
        }

        
         else if (mytype == "mytopics") {
          wx.navigateTo({
            url: '../m-myPublish/m-myPublish?userid=' + this.data.userSession.userId + "&postype=topic"
          });
        } else if (mytype == "myzanimage") 
        {
          wx.navigateTo({
            url: '../authorcode/authorcode'
          });

        } else if (mytype == "topicspending") {
          wx.navigateTo({
            url: '../postpending/postpending?posttype=topic'
          });

        } else if (mytype == "postspending") {
          wx.navigateTo({
            url: '../postpending/postpending?posttype=post'
          });

        } else if (mytype == "commentspending") {
          wx.navigateTo({
            url: '../commentsPending/commentsPending?posttype=post'
          });

        } else if (mytype == "replyspending") {
          wx.navigateTo({
            url: '../commentsPending/commentsPending?posttype=topic'
          });

        } else if (mytype == "myIntegral") {
          wx.navigateTo({
            url: '../myIntegral/myIntegral'
          });

        } else if (mytype == 'followmeAuthor') {
          wx.navigateTo({
            url: '../userlist/userlist?authorType=followme'
          });
        } else if (mytype == 'myFollowAuthor') {
          wx.navigateTo({
            url: '../userlist/userlist?authorType=myFollow'
          });
        } else if (mytype == "mysignin") {
          wx.navigateTo({
            url: '../earnIntegral/earnIntegral'
          });
        } else if (mytype == "adminCenter") {
          wx.navigateTo({
            url: '../admincenter/admincenter'
          });
        } else if (mytype == "publishMinApp") {
          wx.navigateToMiniProgram({
            appId: 'wxcff7381e631cf54e'
          });
        } else if (mytype == "kefuMinApp") {
          wx.navigateToMiniProgram({
            appId: 'wx277c9f1d194fce2f'
          });
        }else if (mytype == "shujuMinApp") {
          wx.navigateToMiniProgram({
            appId: 'wx95e493619d0ff929'
          });
        }else if (mytype == "mycoupon") {
          wx.navigateTo({
            url: '../shop/my-coupon/my-coupon'
          });
        }
        else {
          wx.navigateTo({
            url: '../readlog/readlog?mytype=' + mytype
          });
        }

      }
    }
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

  onShareAppMessage: function () {
    return {
      title: this.data.shareTitle,
      path: '/pages/myself/myself',
      //imageUrl: this.data.detail.content_first_image,
    }
  },

  openSettting: function () {
    var self = this;
    wx.openSetting({
      success(res) { }
    })
  },
  subscribeMessage: function (e) {
    var self = this;
    var subscribetype = e.currentTarget.dataset.subscribetype;
    var subscribemessagesid = e.currentTarget.dataset.subscribemessagesid;
    Adapter.subscribeMessage(self, subscribetype, API, subscribemessagesid,0);
  },
  getPendingCount:function(e)
  {
    var self=this;
    var args ={};
    args.sessionId = self.data.userSession.sessionId;
    args.userId = self.data.userSession.userId;
    API.getPendingCount(args).then(res => {
      if(res.success)
      {
        var  pendingCount=res.pendingcount;
        var topic_pending_count=parseInt(pendingCount.topic_pending_count);
        var reply_pending_count=parseInt(pendingCount.reply_pending_count);
        var post_pending_count=parseInt(pendingCount.post_pending_count);
        var comment_pending_count=parseInt(pendingCount.comment_pending_count);
        var count =topic_pending_count+reply_pending_count+post_pending_count+comment_pending_count;
        var redHotCount =0;
        redHotCount =redHotCount +count;
        self.setData({pendingCount:pendingCount,redHotCount:redHotCount});
      }
      

    }).then(res=>{

      self.getMessageCount();
    })

  },  
  getMessageCount:function () {
    var self = this;   
    var args={};
    args.userId=self.data.userSession.userId;
    args.sessionId=self.data.userSession.sessionId;
    args.messagetype="all";
    API.getMessageCount(args).then(res => {
      if (res.success) {
        var messagesCount = res.messagesCount[0].count;

        var count= parseInt(messagesCount);
          var redHotCount =self.data.redHotCount;
          redHotCount =redHotCount +count;
          self.setData({messagesCount:messagesCount,redHotCount:redHotCount});
         
      }
  }).then(res=>{

    var redHotCount = self.data.redHotCount;
      //设置未读消息提示
      if (redHotCount >0) {
        wx.showTabBarRedDot({
          index: self.data.tabBarRedDotIndex
        })
      }
      else {
        wx.hideTabBarRedDot({
          index: self.data.tabBarRedDotIndex
        })
      }
    

  }) 
},

logoutTap(e){
  var  pageName=this.data.pageName;
  this.closeLoginPopup();     
  Auth.logout(this);
      wx.reLaunch({
        url: '../'+pageName+'/'+pageName
      })
}
  

}
//-------------------------------------------------
Page(options)