/*
 *
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

const API = require("../../utils/api.js");
const Auth = require("../../utils/auth.js");
const Adapter = require("../../utils/adapter.js");
const util = require("../../utils/util.js");
const NC = require("../../utils/notificationcenter.js");
import config from "../../utils/config.js";
const app = getApp()
const appName = app.globalData.appName
let mapCtx = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    screenRatio: 1,
    markers: [],
    includePoints: [],
    discoveryTotal: 1,
    curDiscovery: 0,
    randDis: 0,
    curCenter: [],
    center: [],
    distanceHide: !1,
    scopeUserLocation: "undefined",
    userList: [],
    authorList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    var systemInfo = wx.getSystemInfoSync();
    var screenRatio = 750 / systemInfo.windowWidth;
    self.setData({
      screenRatio: screenRatio
    });

    self.initMap(!0);
    if (
      (self.data.scopeUserLocation =
        "undefined" || self.data.scopeUserLocation == "true")
    ) {
      self.getLocation();
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },

  onShareTimeline: function() {
    return {
      title: appName + "-地图找贴,随时随地打卡"
    };
  },

  onShareAppMessage: function() {
    return {
      title: appName + "-地图找贴,随时随地打卡",
      path: '/pages/socialmap/socialmap'
    }

  },

  //初始化地图
  initMap: function(e) {
    var self = this;
    mapCtx = wx.createMapContext("discoveryMap");
    setTimeout(function() {
      self.getCenterLocation(e);
    }, 1000);
  },
  getCenterLocation: function(e) {
    var self = this;
    mapCtx.moveToLocation();
    setTimeout(function() {
      self.getNewDiscovery();
      if (0 != e && e) {
        self.showBlink();
      }
    }, 1000);
  },
  showBlink: function() {
    var self = this;
    self.setData({
      blinkFun: setInterval(function(a) {
        var random = Math.floor(5 * Math.random());
        self.handleCurMarker(random, "israndom");
      }, 1500),
      endBlink: setTimeout(function() {
        self.clearBlink();
      }, 100)
    });
  },
  clearBlink: function() {
    var self = this;
    if (0 != self.data.blinkFun && "" != self.data.blinkFun) {
      clearInterval(self.data.blinkFun), clearTimeout(self.data.endBlink);
      self.setData({
        blinkFun: "",
        endBlink: ""
      });
    }
  },
  handleCurMarker: function(random, a) {
    var self = this;
    var markers = self.data.markers;
    if (void 0 == a || "near" == a) {
      markers[self.data.curDiscovery].callout = {};

      if (0 == a && -1 != self.data.randDis) {
        markers[self.data.randDis].callout = {};
      }
      markers[random].callout = markers[random].calloutCopy;
      self.setData({
        markers: markers,
        curDiscovery: random
      });
      //self.handleGetThread(random);
    } else {
      var randDis = self.data.randDis;
      if (mar[randDis]) {
        markers[randDis].callout = {};
        mrak[random].callout = markers[random].calloutCopy;
        self.setData({
          markers: markers,
          randDis: random
        });
      }
    }
  },
  handleGetThread: function(a) {
    var e = this;
    if (void 0 == e.data.userList[a].thread) {
      var i = e.data.userList;
      t.invoke({
        path: "api/myinfo/getUserThread",
        data: {
          category: 0,
          city: "allCity",
          uid: i[a].uid,
          page: 1,
          perPage: 5
        },
        success: function(t) {
          if (t.data.my_thread_list.length > 0) {
            var n = t.data.my_thread_list.filter(function(t) {
              return "0" === t.status;
            });
            if (n.length > 0) {
              var r = n[0],
                s = {};
              r.extra && (s = JSON.parse(r.extra)),
                (r.imgUrl = s.imageUrls
                  ? s.imageUrls
                      .split(",")[0]
                      .replace("att2.citysbs.com", "att3.citysbs.com/140x100")
                  : "/style/images/default_thread.png"),
                (i[a].thread = r);
            } else i[a].thread = [];
          } else i[a].thread = [];
          e.setData({
            userList: i
          });
        }
      });
    }
  },
  getLocation: function() {
    var self = this;
    wx.getLocation({
      type: "gcj02",
      success: function(res) {
        if (
          !res ||
          (0 == Math.round(res.longitude) && res == Math.round(res.latitude))
        ) {
          self.setData({
            distanceHide: !0
          });
          wx.showToast({
            title: "获取位置失败",
            icon: "none"
          });
        } else {
          self.setData({
            curCenter: [res.longitude, res.latitude],
            distanceHide: !1,
            scopeUserLocation: "true"
          });
        }
      },
      fail: function(error) {
        if (
          error.errMsg == "getLocation:fail:auth denied" ||
          error.errMsg == "getLocation:fail auth deny"
        ) {
          wx.showToast({
            title: "请开启微信定位服务和小程序位置授权",
            mask: false,
            icon: "none",
            duration: 3000
          });
          self.setData({
            scopeUserLocation: "false",
            distanceHide: !0
          });
        }
      },
      complete: function() {}
    });
  },
  openUserLocationBtn: function(e) {
    var self = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting["scope.userLocation"]) {
          self.getLocation();
        } else {
          wx.showToast({
            title: "请开启小程序位置授权",
            mask: false,
            icon: "none",
            duration: 3000,
            isOPenlocation: false,
            scopeUserLocation: "false"
          });
        }
      }
    });
  },

  getNewDiscovery: function() {
    var self = this;
    mapCtx.getCenterLocation({
      success: function(res) {
        self.getDiscoveryData(res);
      }
    });
  },

  getDiscoveryData: function(t) {
    var self = this;
    var e = self.data.center;
    var i =
      e.length > 0 ? self.getDistance(e[1], e[0], t.latitude, t.longitude) : -1;
    if (i > 3 || -1 == i) {
      wx.showToast({
        title: "正在搜索中...",
        icon: "none"
      });
      self.resetDiscoveryData();
      self.getUsersLocations(t.longitude, t.latitude);
      self.setData({
        center: [t.longitude, t.latitude]
      });
    }
  },

  resetDiscoveryData: function() {
    this.setData({
      markers: [],
      includePoints: [],
      curDiscovery: 0,
      discoveryTotal: 0,
      userList: []
    });
  },
  markertap: function(e) {
    this.clearBlink();
    this.handleCurMarker(parseInt(e.markerId));
  },
  mapRegionChange: function(e) {
    var self = this;
    //暂时屏蔽拖动重新加载
    // if ("end" == e.type && "drag" == e.causedBy) {
    //   self.getNewDiscovery();
    // }
  },
  getUsersLocations: function(a, e) {
    var self = this;
    var screenRatio = self.data.screenRatio;
    API.getUsersLocations().then(res => {
      if (res && res.length > 0) {
        var userList = res;
        var markers = [];
        var includePoints = [];
        var fans = [];
        var d = 0;
        var maxdistance = 10;
        var curCenter = self.data.curCenter;
        for (var i = 0; i < userList.length; i++) {
          var latitude = parseFloat(userList[i].latitude);
          var longitude = parseFloat(userList[i].longitude);
          if (
            curCenter.length > 0 &&
            (0 != Math.round(curCenter[1]) || 0 != Math.round(curCenter[0]))
          ) {
            var distance = self.getDistance(
              curCenter[1],
              curCenter[0],
              latitude,
              longitude
            );
            if (distance < maxdistance) {
              d = i;
              maxdistance = distance;
            }
            userList[i].distance = distance > 0 ? distance.toFixed(1) : 0;
          }
          userList[i].isAttend = 0;
          var marker = {
            id: i,
            iconPath: self.getUserAvatarBg(userList[i].gender),
            latitude: latitude,
            longitude: longitude,
            width: Math.floor(90 / screenRatio),
            height: Math.floor(120 / screenRatio),
            alpha: 1,
            calloutCopy: self.getMarkerTip()
          };
          markers.push(marker);
          var includePoint = {
            latitude: userList[i].latitude,
            longitude: userList[i].longitude
          };
          includePoints.push(includePoint);
          fans.push(userList[i].userid);
        }
        self.setData({
          markers: markers,
          includePoints: includePoints,
          curDiscovery: 0,
          discoveryTotal: userList.length,
          userList: userList
        });
        self.getUserAvatar(userList);
        //self.getFans(c);
        self.handleCurMarker(d, "near");
      } else {
        self.resetDiscoveryData();
      }
    });
  },

  getUserAvatar: function(userList) {
    var self = this;
    for (var i = 0; i < userList.length; i++)
      !(function(i) {
        var user = userList[i];
        var avatarurl = user.avatarurl;
        var gender = user.gender;
        var o = setTimeout(function() {
          wx.getImageInfo({
            src: avatarurl,
            success: function(res) {
              var myCanvas = wx.createCanvasContext("myCanvas");
              myCanvas.drawImage(self.getUserAvatarBg(gender), 0, 0, 120, 160);
              myCanvas.save();
              myCanvas.arc(60, 60, 48, 0, 2 * Math.PI), myCanvas.clip();
              var imagePath = res.path;
              if (imagePath.indexOf("tmp") < 0) {
                imagePath = "../../" + imagePath;
              }
              myCanvas.drawImage(imagePath, 12, 12, 96, 96);
              myCanvas.restore();
              myCanvas.beginPath();
              myCanvas.arc(60, 60, 48, 0, 2 * Math.PI);
              myCanvas.setStrokeStyle("#ffffff");
              myCanvas.setLineWidth(2);
              myCanvas.stroke();
              myCanvas.beginPath();
              myCanvas.arc(102, 102, 18, 0, 2 * Math.PI);
              myCanvas.setFillStyle("#F2C858");
              myCanvas.fill();
              myCanvas.setFillStyle("#8B572A");
              myCanvas.setFontSize(16);
              myCanvas.draw(!1, function() {
                wx.canvasToTempFilePath({
                  width: 120,
                  height: 160,
                  destWidth: 120,
                  destHeight: 160,
                  quality: 1,
                  canvasId: "myCanvas",
                  success: function(t) {
                    var markers = self.data.markers;
                    if (markers && markers[i].iconPath) {
                      markers[i].iconPath = t.tempFilePath;
                      self.setData({
                        markers: markers
                      });
                    } else {
                      clearTimeout(o);
                    }
                  }
                });
              });
            }
          });
        }, 500 * (i + 1));
      })(i);
  },
  getRad: function(t) {
    return (t * Math.PI) / 180;
  },
  getDistance: function(t, a, e, i) {
    var n = this.getRad(t);
    var r = this.getRad(e);
    var s = n - r,
      o = this.getRad(a) - this.getRad(i);
    var c =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(s / 2), 2) +
            Math.cos(n) * Math.cos(r) * Math.pow(Math.sin(o / 2), 2)
        )
      );
    return (c *= 6378137), (c = (Math.round(1e4 * c) / 1e4) * 0.001);
  },
  getMarkerTip: function() {
    this.data.screenRatio;
    var t = [
        "hi",
        "Here",
        "Hello",
        "咦？",
        "嗨",
        "啊",
        "唔~",
        "你好呀",
        "你也在？",
        "恩？",
        "你在偷看我？",
        "哇！",
        "被你发现了",
        "yeah~",
        "哟！",
        "skr~skr~"
      ],
      a = t.length;
    return {
      content: t[Math.floor(Math.random() * a)],
      color: "#FFFFFF",
      fontSize: 12,
      borderRadius: 6,
      bgColor: "#666",
      padding: 6,
      display: "ALWAYS"
    };
  },
  getUserAvatarBg: function(e) {
    var image = "../../images/pos_";
    if (e == "1") {
      image += "male.png";
    } else if (e == "0") {
      image += "female.png";
    } else {
      image += "unknown.png";
    }
    return image;
  },
  swiperChange: function(t) {
    this.handleCurMarker(t.detail.current);
  },
  // 跳转至查看动态详情
  TopicDetail: function(e) {
    var sid = e.currentTarget.id,
      url = "../socialdetail/socialdetail?id=" + sid;
    wx.navigateTo({
      url: url
    });
  }
});
