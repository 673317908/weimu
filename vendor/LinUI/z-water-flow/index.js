// demo.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: Object
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转至查看文章详情
    redictDetail: function (e) {
      var id = e.currentTarget.id;
      var url = '../detail/detail?id=' + id;
      wx.navigateTo({
        url: url
      })
    }
  }
})