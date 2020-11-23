/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../vendor/wxParse/wxParse.js');

var auth = require('../../utils/auth.js');
import config from '../../utils/config.js'
var app = getApp();

Page({
    data: {
        posterImageUrl:"",
        dialog: {
            title: '',
            content: '',
            hidden: true
        },



    },
    onLoad: function (options) {
        var self = this;
        
        wx.setNavigationBarTitle({
            title: '海报',
            success: function (res) {
                // success
            }
        });
        self.setData({
            posterImageUrl: options.posterImageUrl
        });
        
        
    }, 
    savePosterImage:function()
    {
        var self=this;
        wx.downloadFile({
            url: self.data.posterImageUrl,
            success: function (res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success(result) {
                        wx.showModal({
                            title: '提示',
                            content: '二维码海报已存入手机相册，赶快分享到朋友圈吧',
                            showCancel: false,
                            success: function (res) {
                                if (res.confirm) {
                                    
                                    wx.navigateBack({
                                        delta: 1
                                    })
                                }
                            }
                        })
                    }
                });
            }
        });
    },
    posterImageClick:function(e){
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src],
        });
    }
    
})