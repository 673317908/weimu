/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

// 视频进入视图自动播放组件

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propItem: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    videoContext: null
  },

  /**
   * 组件布局完成
   */
  ready() {
    let _this = this
    
    let v = wx.createVideoContext('z' + _this.data.propItem.IDs, _this)
    _this.data.videoContext = v

    let screenHeight = wx.getSystemInfoSync().windowHeight
    let distance = (screenHeight - 80) / 2

    const videoObserve = _this.createIntersectionObserver()
    videoObserve.relativeToViewport({ top: -distance, bottom: -distance })
      .observe(`#z${_this.data.propItem.IDs}`, (res) => {
        let { intersectionRatio } = res

        if (intersectionRatio === 0) {
          //离开视图，停止播放
          _this.data.videoContext.pause()
        } else {
          //进入视图，开始播放
          _this.data.videoContext.play()
        }
      })
  },

  /**
   * 组件的方法列表
   */
  methods: {}
})
