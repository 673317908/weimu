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
import config from '../../utils/config.js'

var app = getApp();
Page({
  data: {
    userInfo: {},
    userSession: {},
    wxLoginInfo: {},
    memberUserInfo: {},
    isUseIntegral: false,
    tabid: "1",
    pageName: "payment",
    activeIndex: null
  },

  /**
   * 进入页面
   */
  onLoad: function (options) {

    var self = this;
    Auth.checkSession(app, API, self, 'isLoginLater', util);
    var postId = options.postid;
    var categoryId = options.categoryid;
    var data = {};
    data.postId = postId;
    data.categoryId = categoryId;
    var postTitle = options.posttitle;
    var system = 'Android';
    wx.getSystemInfo({
      success: function (t) {
        system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        var isIpx = t.model.indexOf('iPhone X') != -1 ? true : false;
        self.setData({
          system: system,
          platform: t.platform,
          isIpx: isIpx
        });
      }
    })

    if (system == 'iOS') {
      self.setData({
        isUseIntegral: true
      })
    }

    Auth.setUserMemberInfoData(self);
    API.getProducts(data).then(res => {
      var catYearProduct = res.catyearproduct;
      var postProduct = res.postproduct;

      if (catYearProduct == null && postProduct != null) {
        self.setData({
          itemCount: '1'
        })

        //postProduct.productname='单篇购买：'+postProduct.productname;
      } else if (catYearProduct != null) {
        catYearProduct.productname = 'توپلام سېتىۋىلىش:' + catYearProduct.productname;
        self.setData({
          itemCount: '2'
        })
      }

      postProduct.productname = 'ماقالە سېتىۋىلىش:' + postTitle;
      postProduct.productid = postId;
      self.setData({
        catYearProduct: catYearProduct,
        postProduct: postProduct,
        selectedProductId: '1',
        productPrice: postProduct.price,
        productName: postProduct.productname,
        productype: postProduct.productype,
        productId: postProduct.productid,
        totalfee: postProduct.price,
        originalprice: postProduct.originalprice,
        postId: postId,
        vipArr: postProduct.vip
      })

    })

  },
  onShow: function () {
    if (this.data.userSession.sessionId) {
      Auth.checkGetMemberUserInfo(this.data.userSession, this, API);

    }
  },
  changeSelectedProduct: function (e) {
    var tabid = e.currentTarget.dataset.tabid;
    var Id = e.currentTarget.dataset.productId;
    var originalprice = e.currentTarget.dataset.originalprice;
    var productPrice = e.currentTarget.dataset.price;
    var productName = e.currentTarget.dataset.productname;
    var productype = e.currentTarget.dataset.productype;
    var productId = e.currentTarget.dataset.itemid;
    var isUseIntegral = this.data.isUseIntegral;
    if (originalprice == "") {
      isUseIntegral = false;
    }
    if (originalprice != "" && productPrice == "") {
      isUseIntegral = true;

    }

    this.setData({
      selectedProductId: tabid,
      productPrice: productPrice,
      totalfee: productPrice,
      productName: productName,
      productype: productype,
      productId: productId,
      totalfee: productPrice,
      originalprice: originalprice,
      isUseIntegral: isUseIntegral,
      tabid: tabid,
      activeIndex: null
    });
  },

  handlVip: function (e) {
    const {
      index,
      item
    } = e.currentTarget.dataset
    this.setData({
      activeIndex: index,
      vipItem: item,
      selectedProductId: 2,
      productPrice: item.price,
      productName: item.productname,
      productype: item.productype,
      productId: item.productid,
      originalprice: item.originalprice,
      totalfee: item.price,
    })
  },

  /**
   * 选中鼓励金额
   */
  payment: function (e) {
    var self = this;
    var totalfee = self.data.productPrice;
    if (totalfee == "") {
      Adapter.toast("支付金额不能为空", 2000);
      return;
    }
    Adapter.prodcutPayment(self, app, API, util);


  },

  userIntegral: function (e) {

    var self = this;
    var system = self.data.system;
    if (e.detail.value) {
      self.setData({
        isUseIntegral: true
      });

    } else {

      if (self.data.productPrice != "" && system != 'iOS') {
        self.setData({
          isUseIntegral: false
        });

      } else {
        Adapter.toast("جۇغلانما نۇمۇرغىلا سېتىۋالالايسىز", 2000);
        self.setData({
          isUseIntegral: true
        });

      }


    }
  },
  postIntegral: function () {
    var self = this;
    var userId = self.data.userSession.userId;
    var sessionId = self.data.userSession.sessionId;
    var postId = self.data.postId;
    var productId = self.data.productId;
    var originalprice = self.data.originalprice;
    var tabid = self.data.tabid;
    var productype = self.data.productype;



    var args = {}
    args.sessionid = sessionId;
    args.extid = productId;
    args.userid = userId;
    args.integral = originalprice;
    args.extype = "postIntegral";

    if (tabid == "2") {
      args.extype = "catsubscribeIntegral";
    }

    var originalprice = originalprice;
    var userIntegral = parseInt(self.data.memberUserInfo.integral);
    if (userIntegral < originalprice) {

      wx.lin.showDialog({
        type: "confirm",
        title: "ماۋزۇ",
        showTitle: false,
        confirmText: "ماقۇل",
        confirmColor: "#f60",
        content: "جۇغلانما نۇمۇر يىتىشمىدى، جۇغلانما نۇمۇر يىغامسىز؟",
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../earnIntegral/earnIntegral'
            });
          }


        }
      })
      return;

    }

    wx.lin.showDialog({
      type: "confirm",
      title: "ماۋزۇ",
      showTitle: false,
      confirmText: "ماقۇل",
      confirmColor: "#f60",
      content: "جەمئىي " + originalprice + " جۇغلانما كىتىدۇ",
      success: (res) => {
        if (res.confirm) {
          API.postIntegral(args).then(res => {

            if (res.code == 'error') {
              wx.showToast({
                title: res.message,
                mask: false,
                icon: "none",
                duration: 3000
              });
            } else {
              wx.lin.showToast({
                title: '积分支付成功',
                icon: 'success',
                duration: 3000,
                mask: true,
                placement: 'right',
                success: (res) => {
                  util.navigateBack({
                    prevPageData: {
                      isPaySuccess: true
                    }
                  })
                }
              })
            }
          })
        }
      }
    })

  }
})