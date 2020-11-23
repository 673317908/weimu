const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cateId: 0,
    cateName:'',
    page: 1,
    empty: false,
    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.cateId = parseInt(options.id) || 0;
    this.data.cateName = options.catename || '';
    if(options.catename)
    {
      wx.setNavigationBarTitle({
        title: options.catename
      });

    }
    
    this.getGoodsList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: async function () {
    await this.getGoodsList(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.page = this.data.page + 1
    this.getGoodsList()
  },

  // 获取商品列表
  async getGoodsList(isRefresh) {
    // 是否刷新
    if (isRefresh) this.setData({
      page: 1,
      goodsList: []
    })

    let params = {
      page: this.data.page,
      page_size: 100,
      cateid: this.data.cateId
    }
    const res = await app.$api.getGoodsList(params)
    let list = res.spus || []
    let goodsList = this.data.goodsList
    goodsList.push(...list)
    let empty = !goodsList.length

    this.setData({
      goodsList,
      empty
    })
  }
})