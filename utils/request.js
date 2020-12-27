/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
import config from 'config.js'
/**
 * 统一接口返回数据处理流程
 *
 * 0.全部wx.request的fail回调统一用reject返回的res
 * 
 * 1.普通不需授权的接口
 * 1.1先判断res.data.errcode是否为0, 为0则调用正常, 可传递给下一步继续操作
 * 1.2如果不为0, 则先toast数据中的res.data.errmsg, 然后reject此返回res

 */

const API = {}


API.request = function (url, method = "GET", data = {}, args = { showLoading: false}) {    
        return new Promise(function (resolve, reject) {
            if (args.showLoading) {
                wx.showLoading({
                    title: 'يۈكلىنىۋاتىدۇ...',
                });
            }
            wx.showNavigationBarLoading()
            url =  url;           
            wx.request({
                url: url,
                data: data,
                method: method,
                success: function (res) {
                  if (res.data.code === 'user_parameter_error' || res.code === 'user_parameter_error' || res.message === "ئەزا ئۇچۇرى خاتا،ئەزا مەركىزىدىن قالدۇق تازىلاشنى بىسىڭ") {
                    wx.removeStorageSync('userInfo');
                    wx.removeStorageSync('userSession');
                    wx.removeStorageSync('memberUserInfo');
                    wx.removeStorageSync('wxLoginInfo');
                  }                  
                  if (args.showLoading) {
                          wx.hideLoading();
                      }
                  resolve(res.data);
                  wx.hideNavigationBarLoading()
                },
                fail: function (err) {
                    if (args.showLoading) {
                        wx.hideLoading();
                    }
                    wx.showToast({
                        title: err.errMsg
                    });
                    wx.hideNavigationBarLoading()
                    reject(err);
                }
            })
        });
    
}

API.get = function (url, data = {}, args = { showLoading: false, token: true }) {
    return API.request(url, "GET", data, args);
}

API.post = function (url, data, args = { showLoading: false, token: true }) {
    return API.request(url, "POST", data, args);
}

API.getStorageSync = function (key) {
    if (Date.now() < wx.getStorageSync(key + '_expired_in')) {
        return wx.getStorageSync(key);
    } else {
        return false;
    }
}

API.setStorageSync = function (key, value, cache_time = 3600) {
    wx.setStorageSync(key, value);
    wx.setStorageSync(key + '_expired_in', Date.now() + cache_time * 1000);
}

API.uploadFile=function(url,agrs)
{

    return new Promise(function(resolve, reject) {
        wx.showNavigationBarLoading();
        wx.uploadFile({
          url: url,
          filePath: agrs.imgfile,
          name: 'file',
          formData:agrs.formData,
          success: function(res) {
            resolve(res.data);
            wx.hideNavigationBarLoading()
          },
          fail: function(err) {
            reject(err);
            wx.hideNavigationBarLoading()
          }
        });
      });
}

API.downImage=function(util,imageUrl) {
    return new Promise((resolve, reject) => {
        if (/^http/.test(imageUrl) && !new RegExp(wx.env.USER_DATA_PATH).test(imageUrl)) {
            wx.downloadFile({
                url: util.mapHttpToHttps(imageUrl),
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res.tempFilePath);
                    } else {
                        reject(res.errMsg);
                    }
                },
                fail(err) {
                    reject(err);
                },
            });
        } else {
            // 支持本地地址
            resolve(imageUrl);
        }
    });
},
module.exports = API