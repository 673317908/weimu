/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */


import config from 'config.js'

var domain = config.getDomain;
var confgPageCount = 10
var HOST_URI = 'https://' + domain + '/wp-json/wp/v2/';
var HOST_URI_MINAPPER = 'https://' + domain + '/wp-json/minapper/v1/';
var BBP_API = 'https://' + domain + '/wp-json/bbp-api/v1/';
const API = require('./request.js')

module.exports = {
  // 获取文章列表数据
  getPosts: function (args) {
    var url = '';
    var pageCount = confgPageCount;
    var postype = "post";
    if (args.postype) {
      postype = args.postype;
    }
    if (args.pageCount != null) {
      pageCount = args.pageCount;
    }
    if (args.isCategory) {
      url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + args.page;
      if (args.listName == 'articlesList' || args.listName == null) {
        url += '&categories=' + args.categoryIds;
      }
      else if (args.listName == 'productsList') //获取产品
      {
        url = HOST_URI_MINAPPER + 'posts/procucts?per_page=' + pageCount + '&page=' + args.page;

      }
      else if (args.listName == 'newsList')//获取资讯
      {
        url = HOST_URI_MINAPPER + 'posts/news?per_page=' + pageCount + '&page=' + args.page;

      }
      else if (args.listName == 'billboardList')//获取公告
      {
        url = HOST_URI_MINAPPER + 'posts/billboard?per_page=' + pageCount + '&page=' + args.page;

      }
      else if (args.listName == 'productcaseList')//获取产品案例
      {
        url = HOST_URI_MINAPPER + 'posts/productcase?per_page=' + pageCount + '&page=' + args.page;

      }
      else if (args.listName == 'userpostsList' && args.userId)//获取用户文章和话题
      {

        url = HOST_URI_MINAPPER + 'posts/userposts?userid=' + args.userId + '&sessionid=' + args.sessionId + '&postype=' + postype + '&per_page=' + pageCount + '&page=' + args.page;

      }

    }
    else if (args.isSearch) {
      url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + args.page;
      url += '&search=' + encodeURIComponent(args.searchKey);
    }
    else if (args.isTag) {
      url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + args.page;
      url += '&tags=' + args.tag;
    }
    else {
      url = HOST_URI + 'posts?per_page=' + pageCount + '&orderby=date&order=desc&page=' + args.page;
    }
    return API.get(url, {});
  },


  // 获取搜索文章列表
  getSearchPosts: function (args) {
    let url = HOST_URI + 'posts?per_page=' + args.pageCount + '&orderby=date&order=desc&page=' + args.page + '&search=' + encodeURIComponent(args.searchKey)

    return API.get(url, {})
  },


  getPages: function (args) {
    var url = '';
    // 获取特定页面
    if (args.postType == 'about') {
      url += HOST_URI_MINAPPER + 'pages/about';
    }
    else
    {

      url = HOST_URI + 'pages?per_page=' + args.pageCount + '&orderby=date&order=desc&page=' + args.page;
    }
    return API.get(url, {});

  },

  publishPost: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'posts';
    return API.post(url, args);

  },

  //文章自定义表单
  publishForm: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'form';
    return API.post(url, args);

  },
  //获取我的留言
  getMymesage: function (args) {
    var url = HOST_URI_MINAPPER;
    var sessionId = args.sessionId;
    var userId = args.userId;
    url += 'form/mymessage?sessionid=' + sessionId + "&userid=" + userId;
    return API.get(url, {});

  },

  //获取自定义字段
  getFormField: function (args) {
    var url = HOST_URI_MINAPPER;
    var category = args.category;
    var displayType = args.displayType;
    url += 'form/fields';
    if (category != '' && displayType != '') {
      url += '?displayType=' + displayType + '&category=' + category;
    }

    return API.get(url, {});

  },
  
  
  // 获取标签列表
  getTags: function (args) {
    var url = HOST_URI + 'tags?per_page=' + args.pageCount + '&orderby=count&order=desc&page=' + args.page;
    return API.get(url, {});

  },
  //获取推荐标签
  getRecommendTags: function (tagtype) {
    var url = HOST_URI_MINAPPER+ 'tags?tagtype='+tagtype;
    return API.get(url, {});

  },

  //获取首页滑动文章
  getSwiperPosts: function () {
    var url = HOST_URI_MINAPPER;
    url += 'posts/slide';
    return API.get(url);
  },

  //获取动态滑动文章
  getSwiperTopics: function () {
    var url = HOST_URI_MINAPPER;
    url += 'topics/slide';
    return API.get(url);
  },

  //获取随机文章
  getRandPosts: function () {
    var url = HOST_URI_MINAPPER;
    url += 'posts/rand';
    return API.get(url);
  },
  // 获取特定slug的文章内容
  getPostBySlug: function (slug) {
    var url = HOST_URI + 'posts?slug=' + slug;
    return API.get(url);

  },
  //文章点赞
  postLike: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'posts/like';
    return API.post(url, args);
  },


  // 获取文章内容
  getPostById: function (id) {
    var url = HOST_URI + 'posts/' + id;
    return API.get(url);
  },

  //获取文章或页面的内容
  getPostOrPageById: function (args) {
    var url = HOST_URI;
    if (args.postType == "post") {

      url += 'posts/' + args.id;
      if (args.userId) {
        url += "?userid=" + args.userId;
      }

      if (args.sessionId) {
        url += "&sessionid=" + args.sessionId;

      }


    }
    else if (args.postType == "page") {
      url += 'pages/' + args.id;
    }
    else if (args.postType == "postPending") {
      url = HOST_URI_MINAPPER + 'posts/' + args.id + '/pending?userid=' + args.userId + "&sessionid=" + args.sessionId;
    }
    else if (args.postType == "topicPending") {
      url = HOST_URI_MINAPPER + 'topics/' + args.id + '/pending?userid=' + args.userId + "&sessionid=" + args.sessionId;

    }
    return API.get(url);
  },
  //删除文章
  deletePostById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'posts/' + args.id + '/delete';
    return API.post(url, args);

  },
  //审核文章
  approvePostById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'posts/' + args.id + '/approve';
    return API.post(url, args);

  },

  //提交搜索
  submitPageById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'posts/' + args.id + '/submitpage';
    return API.post(url, args);

  },
  //删除文章评论
  deleteCommentById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'comments/' + args.id + '/delete';
    return API.post(url, args);

  },
  //审核文章评论
  approveCommentById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'comments/' + args.id + '/approve';
    return API.post(url, args);

  },
  commentsPending: function (args) {
    var url = HOST_URI_MINAPPER;
    if (args.posttype == "post") {
      url += 'comments/pending';

    }
    else if (args.posttype == "topic") {
      url += 'replies/pending';
    }

    url += "?userid=" + args.userid + "&sessionid=" + args.sessionid;
    return API.get(url, args);

  },
  //（去掉）评论点赞
  commentLike: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'comments/' + args.id + '/like';
    return API.post(url, args);

  },
  //删除话题
  deleteTopicById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics/' + args.id + '/delete';
    return API.post(url, args);

  },
  //审核话题
  approveTopicById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics/' + args.id + '/approve';
    return API.post(url, args);

  },
  //删除话题回复
  deleteReplyById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'replies/' + args.id + '/delete';
    return API.post(url, args);

  },
  //审核话题
  approveReplyById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'replies/' + args.id + '/approve';
    return API.post(url, args);

  },
  //获取分类列表
  getCategories: function (args) {
    //var url =url = HOST_URI + 'categories?per_page=100&orderby=count&order=desc';
    var cateType = args.cateType;

    var url = HOST_URI_MINAPPER + 'categories';
    if (cateType && (cateType == "topic" ||cateType == "subscribe" )) {

      url += "/" + cateType;

    }

    var userId = args.userId;
    var sessionId = args.sessionId

    if(userId && sessionId)
    {
      url = url + '?userid=' + userId + "&sessionid=" + sessionId;    

    }
    
    return API.get(url, {});
  },
  //获取某个分类信息
  getCategoryById: function (args) {
    var userId = args.userId;
    var sessionId = args.sessionId      
    
    var url = HOST_URI + 'categories/' + args.categoryIds;
    url = url + '?userid=' + userId + "&sessionid=" + sessionId;  
    return API.get(url);
  },
  //获取文章评论及其回复
  getCommentsReplay: function (args) {
    var url = HOST_URI_MINAPPER;

    if (args.flag == 'postcomment') {
      url += 'comments?postid=' + args.postId + '&limit=' + args.limit + '&page=' + args.page + '&order=desc';

      if(args.userId && args.sessionId)
      {
        url += "&userid="+args.userId+"&sessionid="+args.sessionId;

      }
    }
    else if (args.flag == 'newcomment') {
      url = url + 'comments/new?limit=' + args.limit + '&page=' + args.page;
    }
    return API.get(url);
  },

  getMyCommentsReplays: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId
    url = url + 'comments/myself?limit=' + args.limit + '&page=' + args.page+'&userid=' + userId + '&sessionid=' + sessionId;
    return API.get(url);
  },
  //获取我的评论文章
  getMyComments: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId
    url = url + 'posts/mycomments?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  

  //获取我的点赞文章
  getMyLikes: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId
    url = url + 'posts/mylikes?userid=' + userId + "&sessionid=" + sessionId+"&limit=" + args.limit + "&page=" + args.page;
    return API.get(url);
  },
  //获取我鼓励的文章
  getMyPraises: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId
    url = url + 'posts/mypraises?userid=' + userId + "&sessionid=" + sessionId+"&limit=" + args.limit + "&page=" + args.page;
    return API.get(url);
  },

  //提交文章评论及回复
  postCommentsReplay: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'comments';
    return API.post(url, args);
  },
  //回复模板消息
  postRepalyMessage: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'templatemessage/send';
    return API.post(url, args);
  },
  //鼓励模板消息
  sentMessage: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'templatemessage/send';
    return API.post(url, args);
  },
  //用户登录
  userLogin: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "users/login";
    return API.post(url, args);
  },

  //获取用户手机号
  getPhoneMumber: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "users/getphonenumber";
    return API.post(url, args);
  },

  //获取会员信息
  getMemberUserInfo: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "users/session";
    return API.get(url, args);
  },

  //获取用户信息
  getUserInfo: function (args) {
    var url = HOST_URI_MINAPPER;
    var id = args.userId;
    var userId = args.curLoginUserId;
    var sessionId = args.curLoginSessionId;
    url += "users/" + id + "?userid=" + userId + "&sessionid=" + sessionId;
    return API.get(url, args);
  },

  //更新信息
  updateSession: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url += "users/updatesession?userid=" + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },


  //生成海报
  creatPoster: function (id) {
    var url = HOST_URI_MINAPPER;
    url += "posts/" + id + "/qrcode";
    return API.get(url);
  },

  //提交支付
  postPayment: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "payment";
    return API.post(url, args);

  },
  //消耗积分阅读
  postIntegral: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "payment/integral";
    return API.post(url, args);

  },

  getProducts: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "products?postid=" + args.postId + "&categoryid=" + args.categoryId;
    return API.get(url);

  },

  //上传文件
  uploadFile: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "attachments";
    return API.uploadFile(url, args);

  },

  //删除文件
  deleteFile: function (args) {
    var url = HOST_URI_MINAPPER;
    var postid = args.id;
    url += "attachments/" + postid + '/delete';
    return API.post(url, args);

  },



  //获取设置项
  getSettings: function () {
    var url = HOST_URI_MINAPPER;
    url += "settings";
    return API.get(url);

  },

  //获取设置项
  changeSettings: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "settings/change";
    return API.post(url, args);

  },

  //更新订单状态
  updateOrderStatus: function (args) {
    var url = HOST_URI_MINAPPER;
    url += "orders";
    return API.post(url, args);

  },

  //更新订单状态
  getMyOrders: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'orders/myorders?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);

  },
  //获取热点文章
  getTopHotPosts(tabtype) {
    var url = HOST_URI_MINAPPER;
    url += "posts/hot?type=" + tabtype;
    return API.get(url);
  },

  //获取热点话题
  getTopHotTopics(tabtype) {
    var url = HOST_URI_MINAPPER;
    url += "topics/hot?type=" + tabtype;
    return API.get(url);
  },

  //获取BBPress板块列表
  getBBForums: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'forums'
    if(args.userId &&  args.sessionId)
    {
      url += "?userid=" + args.userId + "&sessionid=" + args.sessionId;
    }
    return API.get(url);
  },
  //获取BBPress板块列表
  getBBForumsById: function (args) {
    var url = HOST_URI_MINAPPER;
    var id = args.categoryIds;
    url += 'forums/' + id
    return API.get(url);
  },
  //获取动态圈按类别的列表
  getBBTopics: function (args) {
    var url = HOST_URI_MINAPPER;
    if (args.isCategory) {
      url += 'forums/' + args.forumId + '?page=' + args.page + '&per_page=' + args.pageCount;
      if (args.userId && args.sessionId) {
        url += "&userid=" + args.userId + "&sessionid=" + args.sessionId;
      }

    }
    else if (args.isSearch) {
      url += 'topics/search?s=' + encodeURIComponent(args.searchKey) + '&page=' + args.page + '&per_page=' + args.pageCount;
      if (args.userId && args.sessionId) {
        url += "&userid=" + args.userId + "&sessionid=" + args.sessionId;
      }
    }

    else if (args.isTag) {
      url += 'topics/tag/' + args.tag + '?page=' + args.page + '&per_page=' + args.pageCount;
      if (args.userId && args.sessionId) {
        url += "&userid=" + args.userId + "&sessionid=" + args.sessionId;
      }
    }
    return API.get(url);
  },

  // 获取动态圈首页列表
  getBBTopicsByID: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics';
    if (args.forumId != 0) {
      url += '/' + args.forumId;
      if (args.userId && args.sessionId) {
        url += "&userid=" + args.userId + "&sessionid=" + args.sessionId;
      }
    }
    else {
      url += '?page=' + args.page + '&per_page=' + args.pageCount;
      if (args.userId && args.sessionId) {
        url += "&userid=" + args.userId + "&sessionid=" + args.sessionId;
      }
    }
    return API.get(url);
  },

  // 获取动态圈详情
  getBBTopicByID: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics';
    if (args.topicId != 0) {

      url += '/' + args.topicId;

      if (args.userId) {
        url += "?userid=" + args.userId;
      }

      if (args.sessionId) {
        url += "&sessionid=" + args.sessionId;

      }
    }



    return API.get(url);
  },

  //提交话题
  postBBTopic: function (id, args) {
    var url = HOST_URI_MINAPPER;
    url += 'forums/' + id;
    return API.post(url, args);
  },


  //提交话题回复
  replyBBTopicByID: function (id, args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics/' + id;
    return API.post(url, args);
  },

  getReplayTopicById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'topics/getReplayTopicById?id=' + args.topicId + "&page=" + args.page + "&per_page=" + args.per_page;
    if(args.userId && args.sessionId)
    {
      url += "&userid="+args.userId+"&sessionid="+args.sessionId;

    }
    return API.get(url);
  },

  getMylikeTopics: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url += 'topics/mylike?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  getMyreplayTopics: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url += 'topics/myreplay?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  getPraisesTopics: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url += 'topics/mypraises?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  // 获取BBPress搜索数据
  getBBTopicsBySearch: function (obj) {
    var url = HOST_URI_MINAPPER;
    url = url + 'topics/search?s=' + encodeURIComponent(obj.search);
    return url;
  },

  // 签到
  signin: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'users/signin?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  // 获取我的任务状态
  myTask: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'users/mytask?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  //我的任务观看激励视频
  openAdVideo: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'users/openAdVideo?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  //我的分享任务
  shareApp: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'users/shareapp?userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);
  },

  //我的积分
  myIntegral: function (args) {
    var url = HOST_URI_MINAPPER;
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'users/myIntegral?userid=' + userId + "&sessionid=" + sessionId + "&page=" + args.page + "&per_page=" + args.per_page;;

    return API.get(url);
  },

  integralRanking: function () {
    var url = HOST_URI_MINAPPER;
    url = url + 'users/integralRanking';
    return API.get(url);
  },

  followRanking: function () {
    var url = HOST_URI_MINAPPER;
    url = url + 'users/followRanking';
    return API.get(url);
  },

  getUsersLocations: function () {
    var url = HOST_URI_MINAPPER;
    url = url + 'users/locations';
    return API.get(url);
  },
  //获取网站的最新评论
  getNewComments: function (args) {
    //var url=  HOST_URI + 'comments?parent=0&per_page=30&orderby=date&order=desc';
    var url = HOST_URI_MINAPPER;
    url = url + 'comments/new?limit=' + args.limit + '&page=' + args.page;
    return API.get(url);
  },

  //获取视频信息
  getVideoInfo: function (args) {
    //var url=  HOST_URI + 'comments?parent=0&per_page=30&orderby=date&order=desc';
    var url = HOST_URI_MINAPPER + 'media/';
    var userId = args.userId;
    var sessionId = args.sessionId;
    if (args.infoType == "video_douyin") {
      url = url + 'douyin?url=' + args.infoUrl + '&userid=' + userId + "&sessionid=" + sessionId;;
    }

    return API.get(url);

  },

  getWeibo: function (args) {
    var url = HOST_URI_MINAPPER + 'media/';
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'weibo?url=' + args.infoUrl + '&userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);

  },

  getToutiao: function (args) {
    var url = HOST_URI_MINAPPER + 'media/';
    var userId = args.userId;
    var sessionId = args.sessionId;
    url = url + 'toutiao?url=' + args.infoUrl + '&userid=' + userId + "&sessionid=" + sessionId;
    return API.get(url);

  },

  followAuthor: function (args) {
    var url = HOST_URI_MINAPPER + 'users/';
    var id = args.id;
    var flag = args.flag
    var data = {};
    data.sessionid = args.sessionId;
    data.userid = args.userId;
    if (!flag) {
      url += id + "/follow";
    }
    else {
      url += id + "/unfollow";

    }
    return API.post(url, data);

  },

  getMyFollowAuthor: function (args) {
    var url = HOST_URI_MINAPPER + 'users/myFollowAuthors';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.page + "&per_page=" + args.per_page;
    return API.get(url);

  },
  getFollowmeAuthors: function (args) {
    var url = HOST_URI_MINAPPER + 'users/followmeAuthors';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.page + "&per_page=" + args.per_page;
    return API.get(url);

  },

  getAuthorList: function (args) {
    var url = HOST_URI_MINAPPER + 'users/authorlist';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.authorlistPage + "&per_page=" + args.per_page;;
    return API.get(url);

  },
  //圈子关注朋友的话题列表
  getMyFollowAuthorTopics: function (args) {
    var url = HOST_URI_MINAPPER + 'topics/myFollowAuthors';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.authorPage + "&per_page=" + args.per_page;
    return API.get(url);

  },
  getAttachments: function (args) {
    // var url = HOST_URI_MINAPPER + 'users/attachments';
    var url = HOST_URI_MINAPPER + 'attachments';
    if (args.usertype == "my") {
      url += '/myattachments';
      url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.page + "&per_page=" + args.per_page;

      if (args.filetype) {
        url += '&filetype=' + args.filetype;
      }
    }
    else {
      if (args.filetype) {
        url += '?filetype=' + args.filetype+ "&page=" + args.page + "&per_page=" + args.per_page;
      }
    }
    return API.get(url);
  },

  getMedia: function (args) {
    var url = HOST_URI_MINAPPER + 'attachments/media';
    url += "?page=" + args.page + "&per_page=" + args.per_page;
    var userId = args.userId;
    var sessionId = args.sessionId;
    var mediatype=args.mediatype;
    if(userId && sessionId)
    {
      url = url + '&userid=' + userId + "&sessionid=" + sessionId;    

    }
    if(mediatype)
    {

      url = url + '&mediatype='+ mediatype;

    }
    return API.get(url);
  },

  getMyFollowAuthorsTopics: function (args) {
    var url = HOST_URI_MINAPPER + 'topics/myfollowAuthors';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId + "&page=" + args.page + "&per_page=" + args.per_page;
    return API.get(url);

  },



  getMyzanImage: function (args) {
    var url = HOST_URI_MINAPPER + 'users/myZanImage';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId;
    return API.get(url);

  },

  getPostPending: function (args) {
    var url = HOST_URI_MINAPPER + 'posts/pending';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId;
    return API.get(url);

  },
  getTopicPending: function (args) {
    var url = HOST_URI_MINAPPER + 'topics/pending';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId;
    return API.get(url);
  },
  subscribeMessage:function(args)
  {
    var url = HOST_URI_MINAPPER + 'users/subscribeMessage';
    return API.post(url, args);
    
  },
  sendSubscribeMessage:function(args)
  {
    var url = HOST_URI_MINAPPER + 'templatemessage/sendSubscribeMessage';
    return API.post(url, args);
    
  },  
  getliveinfo:function()
  {
    var url = HOST_URI_MINAPPER + 'live/getliveinfo';
     return API.get(url);
    
  },
  updateLive:function(args)
  {
    var url = HOST_URI_MINAPPER + 'live/refreshliveinfo';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId;
     return API.get(url);
    
  },
  //获取我的所有未读消息
  getMessageCount:function(args)
  {
    var url = HOST_URI_MINAPPER + 'message/count';
    url += '?userid=' + args.userId + "&sessionid=" + args.sessionId+"&messagetype="+args.messagetype;
     return API.get(url);
    
  },  
  //获取我的消息（未读或已读）
  getMyMessages:function(args)
  {
    var url = HOST_URI_MINAPPER + 'message/my';
    url += '?userid=' + args.userId + "&sessionid="+ args.sessionId +
    "&messagetype="+args.messagetype+ 
    "&page="+args.page+
    "&per_page="+args.per_page;
     return API.get(url);    
  },

  //删除消息
  deleteMessageById: function (args) {
    var url = HOST_URI_MINAPPER;
    url += 'message/' + args.id + 'delete';
    return API.post(url, args);

  },
  //获取我的消息（未读或已读）
  getPendingCount:function(args)
  {
    var url = HOST_URI_MINAPPER + 'message/pendingcount';
    url += '?userid=' + args.userId + "&sessionid="+ args.sessionId
     return API.get(url);    
  },

  // 获取配置数据
  getConfig() {
    let url =  HOST_URI_MINAPPER + "settings";
    return API.get(url)
  },

  // 获取配置数据
  getHomeConfig() {
    let url =  HOST_URI_MINAPPER + "settings/homeconfig";
    return API.get(url)
  },

  // 获取商品列表
  getShopProducts(args) {
    let url =  HOST_URI_MINAPPER + "shop/products";

    url += '?page='+args.page+'&page_size='+args.page_size;
    if(args.cat)
    {
      url += '$cat='+args.cat;
    }
    return API.get(url);
  },

   // 获取商品列表
   getEnableExchangePhone(args) {
    let url =  HOST_URI_MINAPPER + "settings/getenableexchangephone";
    url += '?userid='+args.userId+'&sessionid='+args.sessionId;
    return API.get(url);
  }
};