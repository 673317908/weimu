// 商品组件

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: Object
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转
    toDetail(e) {
      let { id } = e.currentTarget.dataset
      //../../../__plugin__/wx34345ae5855f892d/pages/productDetail/productDetail?productId= 此为页面跳转方式
      let url = "plugin-private://wx34345ae5855f892d/pages/productDetail/productDetail?productId=" + id
      wx.navigateTo({
        url: url
      })
    }
  }
})
