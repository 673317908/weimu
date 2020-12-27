/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */
//--------------------------------------
// 文章列表数据
function loadArticles(args, appPage, api, isPullDown, isSwitchCate) {
  var page = args.page;
  var pageCount = args.pageCount;
  var pageData = {};
  var listName = args.listName ? args.listName : "articlesList";
  appPage.setData({
    isLoading: true
  });
  api.getPosts(args).then(res => {
    if (res.length && res.length > 0) {
      if (res.length < pageCount) {
        pageData.isLastPage = true;
      }
      if (listName == "articlesList") {
        pageData.articlesList = [].concat(appPage.data.articlesList, res)
        if (res.length > 0 && args.isTag) {
          if (res[0].tagscover) {
            pageData.categoryImage = res[0].tagscover;
          } else {
            pageData.categoryImage = "../../images/uploads/default_image.jpg";
          }

        }
        pageData.isArticlesList = true;
        // 当文章列表样式为“瀑布流”时，调用渲染瀑布流的方法
        var listStyle = wx.getStorageSync('listStyle');
        if (listStyle === "waterFlowArticle") {
          // 渲染瀑布流
          var refresh = false
          if (isPullDown) {
            refresh = true;
          }
          if (isSwitchCate) {
            refresh = true;
          }
          wx.lin.renderWaterFlow(res, refresh, () => {})
        }
      } else if (listName == "productsList") {
        pageData.productsList = [].concat(appPage.data.productsList, res);
        pageData.isProductsList = true;

      } else if (listName == "newsList") {
        pageData.newsList = [].concat(appPage.data.newsList, res);
        pageData.isNewsList = true;

      } else if (listName == 'billboardList') {
        pageData.billboardList = [].concat(appPage.data.billboardList, res);
        pageData.isBillboardList = true;
      } else if (listName == 'productcaseList') {
        pageData.productcaseList = [].concat(appPage.data.productcaseList, res);
        pageData.isPoductcaseList = true;
      } else if (listName == 'userpostsList') {
        pageData.userpostsList = [].concat(appPage.data.userpostsList, res);
        pageData.isUserpostsList = true;
      }

      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }
      pageData.page = page;
      pageData.isLoading = false;
      appPage.setData(pageData);

    } else if (res.code == 'rest_post_invalid_page_number') {
      appPage.setData({
        isLastPage: true
      });
      wx.showToast({
        title: 'بۇ ئەڭ ئاخىرقى بەت',
        mask: false,
        icon: "none",
        duration: 1e3
      });
    } else {

    }

  }).catch(err => {
    appPage.setData({
      isLoading: false,
      isPull: false,
      isArticlesList: false,
      isProductsList: false,
      isNewsList: false,
      isError: true,
      isUserpostsList: false
    })
    wx.stopPullDownRefresh()
  })
}

//--------------------------------------
// 获取文章或页面详细内容
function loadArticleDetail(args, appPage, WxParse, api, util, innerAudioContext, ctx) {
  var postType = args.postType;
  api.getPostOrPageById(args).then(res => {
      if (res.raw_goods_name != '') {
        appPage.setData({
          displaygoods: true
        })
      }

      if (res.raw_weixinmp_type == '2') {
        appPage.setData({
          displaymp: true
        })
      }


      if (res.title.rendered) {
        var openAdLogs = wx.getStorageSync('openAdLogs') || [];
        var openAded = res.excitationAd == 1 ? false : true;
        if (openAdLogs.length > 19) {
          openAded = true;
        } else if (openAdLogs.length > 0 && res.excitationAd == 1) {
          for (var i = 0; i < openAdLogs.length; i++) {
            if (openAdLogs[i].id == res.id) {
              openAded = true;
              break;
            }


          }
        }
        appPage.setData({
          detail: res,
          display: true,
          commentCounts: res.total_comments,
          detailSummaryHeight: openAded ? '' : '400rpx'
        });
        if (res.mylike == "1") {
          appPage.setData({
            likeIcon: "../../images/entry-like-on.png"
          });
        }
        if (appPage.data.isPull) {
          wx.stopPullDownRefresh()
        }

        if (res.category_name) {
          wx.setNavigationBarTitle({
            title: res.category_name
          });
        } else {
          wx.setNavigationBarTitle({
            title: res.title.rendered
          });

        }


        if (res.audios[0] && postType == "post") {
          InitializationAudio(innerAudioContext, res.audios[0].src, appPage);
          loadAudio(innerAudioContext, appPage);
          appPage.setData({
            displayAudio: "block"
          });
        }

        if (res.content.rendered) {
          WxParse.wxParse('article', 'html', res.content.rendered, appPage, 5)

          let onlyVideo = res.format === 'video'
          appPage.setData({
            onlyVideo
          })
        }

        if (res.excitationAd == 1 && postType == "post") {
          appPage.loadInterstitialAd(res.excitationAdId);
        }

      }

      // if (postType == "post" && res.post_full_image) {
      //   wx.getImageInfo({
      //     src: res.post_full_image,
      //     success: (rs) => {
      //       var shareImagePath = util.clipImage(rs.path, rs.width, rs.height, appPage, ctx);
      //     }
      //   })
      // }
      return res;
    })
    .then(res => {
      appPage.fristOpenComment();
      //appPage.onReachBottom();

      // 调用API从本地缓存中获取阅读记录并记录
      var logs = wx.getStorageSync('readLogs') || [];
      // 过滤重复值
      if (logs.length > 0) {
        logs = logs.filter(function (log) {
          return log["id"] !== res.id;
        });
      }
      // 如果超过指定数量
      if (logs.length > 19) {
        logs.pop(); //去除最后一个
      }
      var titleRendered = {
        "rendered": res.title.rendered
      };
      var log = {
        "id": res.id,
        "date": res.date,
        "post_date": res.post_date,
        "postType": "post",
        "total_comments": res.total_comments,
        "pageviews": res.pageviews,
        "like_count": res.like_count,
        "title": titleRendered,
        "post_large_image": res.post_large_image,
        "post_medium_image": res.post_medium_image,
        "post_thumbnail_image": res.post_thumbnail_image,
        "post_full_image": res.post_full_image,
        "post_frist_image": res.post_frist_image,
        "author": res.author,
        "tag_name": res.tag_name,
        "author_avatar": res.author_avatar,
        "author_name": res.author_name,
        "post_all_images": res.post_all_images,
        "category_name": res.category_name
      };
      logs.unshift(log);
      wx.setStorageSync('readLogs', logs);
      return res;

    })
    .catch(err => {
      appPage.setData({
        display: false,
        displaygoods: false,
        displaytags: false
      })
      wx.stopPullDownRefresh()
    })

}


//--------------------------------------
// 获取待审核文章或页面详细内容
function loadDetailPending(args, appPage, WxParse, api) {
  api.getPostOrPageById(args).then(res => {

    if (res.title.rendered) {
      appPage.setData({
        detail: res,
        display: true,
        commentCounts: res.total_comments
      });

      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }
      if (res.content.rendered) {
        WxParse.wxParse('article', 'html', res.content.rendered, appPage, 5);

      }

    } else if (res.title) {

      appPage.setData({
        detail: res,
        display: true
      })

      if (res.content) {
        WxParse.wxParse('article', 'html', res.content, appPage, 5);

      }

    }
  })


}


function getFormField(args, appPage, api) {
  api.getFormField(args).then(res => {
    appPage.setData({
      fields: res
    });
  })
}

//--------------------------------------
// 获取特定的页面
function loadPagesDetail(args, appPage, api, WxParse) {
  api.getPages(args).then(res => {
      appPage.setData({
        pageDetail: res,
        display: 'block'
      });

      wx.setNavigationBarTitle({
        title: res.post_title
      });

      WxParse.wxParse('article', 'html', res.post_content, appPage, 5);
      return res;

    }).then(res => {

      if (res.raw_latitude && res.raw_longitude) {
        var marker = {};
        var markers = [];
        marker.latitude = parseFloat(res.raw_latitude);
        marker.longitude = parseFloat(res.raw_longitude);
        marker.id = 1
        marker.title = res.post_title;
        marker.display = "ALWAYS";
        markers.push(marker);
        appPage.setData({
          markers: markers
        });
      }
    })
    .catch(err => {
      wx.stopPullDownRefresh()
    });
}
//加载分类
function loadCategories(args, appPage, api, isloadArticles, isPullDown) {
  api.getCategories(args).then(res => {

    wx.stopPullDownRefresh()
    if (res.length && res.length > 0) {
      var categoryIds = '';
      var i = 0
      for (let category of res) {
        if (i == 0) {
          categoryIds += category.ids;
        } else {
          categoryIds += "," + category.ids;
        }
        i++;
      }
      appPage.setData({
        categoryIds: categoryIds
      });

      if (categoryIds == "") {
        args.isCategory = false;
      } else {
        args.isCategory = true;
        args.categoryIds = categoryIds;
        args.categoryId = 0;
        args.page = 1;
      }

      if (!args.isTree) {
        if (args.cateType == 'all') {
          var columns = [];
          var column = {};
          column = {
            "id": "0",
            "name": "ئەڭ يېڭى",
            "ids": categoryIds
          }
          columns = columns.concat(column);
          columns = columns.concat(res);
          appPage.setData({
            columns: columns,
            isCategory: args.isCategory,
            categoryId: args.categoryId,
            categoryIds: args.categoryIds
          });

        } else if (args.cateType == 'subscribe') {
          appPage.setData({
            popupShow: true,
            columns: res
          })

          // column = {
          //   "id": "0",
          //   "name": "最新",
          //   "ids": categoryIds
          // }
        }

      }


      if (isloadArticles) {
        loadArticles(args, appPage, api, isPullDown);
      }

      // Tab栏分类页面数据处理
      if (args.isTree) {
        let list = res.map(item => {
          if (!item.children.length) {
            item.children[0] = {
              ...item,
              children: []
            }
          }
          return item
        })

        var index = appPage.data.activeIndex;
        appPage.setData({
          categoriesList: list,
          cateSubList: list[index].children
        })
      }
    } else {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: res.message,
        duration: 1500
      })
    }
  }).catch(err => {
    wx.stopPullDownRefresh()
  })
}

function loadTags(args, appPage, api) {
  var pageData = {};
  var pageCount = args.pageCount;
  var page = args.page;
  appPage.setData({
    isLoading: true
  })
  api.getTags(args).then(res => {
    if (res.length && res.length > 0) {

      pageData.isTags = true;
      if (res.length < pageCount) {
        pageData.isLastPage = true;
      }

      pageData.tagsList = appPage.data.tagsList.concat(res.map(function (item) {
        if (item.tag_thumbnail_image == "") {
          item.tag_thumbnail_image = "../../images/uploads/default_image.jpg";
        }
        return item;
      }));

      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }
      pageData.page = page;
      pageData.isLoading = false;
      appPage.setData(pageData);

    } else if (res.code == 'rest_post_invalid_page_number') {
      appPage.setData({
        isLastPage: true
      });
      wx.showToast({
        title: 'ئەڭ ئاخىرقى بەت',
        mask: false,
        icon: "none",
        duration: 1e3
      });
    }
  }).catch(err => {
    appPage.setData({
      isLoading: false,
      isPull: false,
      isTags: false
    })
    wx.stopPullDownRefresh()
  })

}

function loadComments(args, appPage, api) {
  var page = args.page;
  var pageData = {};
  appPage.setData({
    isLoading: true
  })
  api.getCommentsReplay(args).then(res => {
    if (res.comments) {

      if (res.comments.length < args.limit) {
        appPage.setData({
          isLastPage: true
        })
      }
      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }
      pageData.commentsList = [].concat(appPage.data.commentsList, res.comments);
      pageData.page = page + 1;
      pageData.isLoading = false;
      appPage.setData(pageData);

    }
  }).catch(err => {
    appPage.setData({
      isLoading: false,
      isPull: false
    })
    wx.stopPullDownRefresh();
  })
  wx.hideLoading();

}

function loadCommentsPending(args, appPage, api) {
  appPage.setData({
    isLoading: true
  });
  api.commentsPending(args).then(res => {
    if (res.code == 'error') {
      // wx.showToast({
      //   title: res.message,
      //   mask: false,
      //   icon: "none",
      //   duration: 3000
      // });

      appPage.setData({
        showerror: 'block',
        showallDisplay: 'none',
        isLoading: false
      });

    } else {
      appPage.setData({
        commentsList: res,
        showerror: 'none',
        showallDisplay: 'block'
      });
      wx.hideLoading();
    }
  }).catch(err => {
    appPage.setData({
      isLoading: false,
      isPull: false
    });
    wx.hideLoading();
  })
}

function getNewComments(appPage, api, util) {
  var pageData = {};
  api.getNewComments().then(res => {
    if (res.length > 0) {

      pageData.readLogs = appPage.data.readLogs.concat(res.map(function (item) {
        item[0] = item.post;
        item[1] = util.removeHTML(item.content.rendered + '(' + item.author_name + ')');
        item[2] = "0";
        return item;
      }));

      appPage.setData(pageData);
      appPage.setData({
        showallDisplay: "block"
      });

    } else {
      wx.showToast({
        title: 'يېڭى ئىنكاس يوق',
        mask: false,
        icon: "none",
        duration: 1e3
      });
    }

  }).catch(err => {
    appPage.setData({
      showerror: "block",
      showallDisplay: "none"
    });

  })
  wx.hideLoading();
}

function loadBBTopics(args, appPage, api) {
  var page = args.page;
  var pageCount = args.pageCount;
  var pageData = {};
  appPage.setData({
    isLoading: true
  })
  if (args.isCategory && args.forumId == '0') {
    api.getBBTopicsByID(args).then(res => {
      if (res.topics) {
        if (res.topics.length < pageCount) {
          pageData.isLastPage = true;
        }
        pageData.topicsList = [].concat(appPage.data.topicsList, res.topics);
        if (appPage.data.isPull) {
          wx.stopPullDownRefresh()
        }
        pageData.page = page;
        pageData.topiclistAdId = res.topiclistAdId,
          pageData.topiclistAd = res.topiclistAd,
          pageData.topiclistAdEvery = res.topiclistAdEvery
        pageData.videoAdId = res.videoAdId
        pageData.isLoading = false;
        appPage.setData(pageData);
      }
    }).catch(err => {
      appPage.setData({
        isLoading: false,
        isPull: false,
        isError: true
      })
      wx.stopPullDownRefresh()
    })
  } else {
    api.getBBTopics(args).then(res => {
      if (res.topics) {
        if (res.topics.length < pageCount) {
          pageData.isLastPage = true;
        }
        pageData.topicsList = [].concat(appPage.data.topicsList, res.topics);
        pageData.category = res;
        if (!args.isSearch) {
          pageData.categoryImage = res.category_thumbnail_image;
        }

        if (appPage.data.isPull) {
          wx.stopPullDownRefresh()
        }

        if (args.isCategory) {
          pageData.forumId = res.id;
        }
        pageData.raw_default_videoposter_image = res.raw_default_videoposter_image;
        pageData.publishTopicUserRight = res.publishTopicUserRight;
        pageData.min_posttopic_user_memberName = res.min_posttopic_user_memberName;
        if (res.raw_enable_newtopic_option == "1") {
          pageData.showAddbtn = true;
        }
        pageData.page = page;
        appPage.setData(pageData);
      }

    }).catch(err => {
      appPage.setData({
        isLoading: false,
        isPull: false,
        isError: true
      })
      wx.stopPullDownRefresh()
    })
  }
}

function loadMyfollowAuthorTopics(args, appPage, api) {
  var authorPage = args.authorPage;
  var pageCount = args.per_page;
  var pageData = {};
  appPage.setData({
    isLoading: true
  })
  api.getMyFollowAuthorTopics(args).then(res => {
    if (res.topics) {
      if (res.topics.length < pageCount) {
        pageData.isLastAuthorPage = true;
      }
      pageData.authorTopicsList = [].concat(appPage.data.authorTopicsList, res.topics);
      pageData.authorPage = authorPage;
      pageData.isLoading = false
      appPage.setData(pageData);
      wx.stopPullDownRefresh()
    } else {
      wx.stopPullDownRefresh()
    }

  }).catch(err => {
    wx.stopPullDownRefresh();
    appPage.setData({
      isLoading: false
    })
  })
}

function loadAuthorList(args, appPage, api) {
  var authorlistPage = args.authorlistPage;
  var pageCount = args.per_page;
  var pageData = {};
  appPage.setData({
    isLoading: true
  })
  api.getAuthorList(args).then(res => {
    if (res) {
      if (res.length < pageCount) {
        pageData.isLastAuthorListPage = true;
      }
      pageData.authorList = [].concat(appPage.data.authorList, res);
      pageData.authorlistPage = authorlistPage;
      pageData.isLoading = false;
      appPage.setData(pageData);
    }
  }).catch(err => {
    appPage.setData({
      isLoading: false
    })
  })
  wx.stopPullDownRefresh()
}

function loadReplayTopic(args, appPage, api) {
  var page = args.page;
  var pageData = {};
  appPage.setData({
    isLoading: true
  });
  api.getReplayTopicById(args).then(res => {
    if (!res.code) {
      if (res.length < args.per_page) {
        appPage.setData({
          isLastPage: true
        })

      }

      if (appPage.data.isPull) {
        wx.stopPullDownRefresh()
      }

      pageData.repliesList = [].concat(appPage.data.repliesList, res);
      pageData.page = page + 1;
      pageData.isLoading = false;
      appPage.setData(pageData);
    }
  }).catch(err => {
    appPage.setData({
      isLoading: false
    })
  })
}

function loadBBTopic(args, appPage, WxParse, api, util) {
  api.getBBTopicByID(args).then(res => {
    if (!res.code && res.id) {
      if (res.mylike == "1") {
        appPage.setData({
          likeIcon: "../../images/entry-like-on.png"
        })
      }
      WxParse.wxParse('article', 'html', res.content, appPage, 5)
      var qqvideoSrc = res.qqvideoList.length > 0 ? res.qqvideoList[0].src : ""
      var vid = qqvideoSrc == "" ? "" : util.GetQueryString(qqvideoSrc, "vid")

      appPage.setData({
        detail: res,
        topicId: res.id,
        link: res.permalink,
        display: 'block',
        vid: vid,
        total_replies: res.total_replies
      })
      wx.setNavigationBarTitle({
        title: res.forum_title
      })

      appPage.fristOpenComment();

      // 调用API从本地缓存中获取阅读记录并记录
      var logs = wx.getStorageSync('readLogs') || [];
      // 过滤重复值
      if (logs.length > 0) {
        logs = logs.filter(function (log) {
          return log["id"] !== res.id;
        });
      }
      // 如果超过指定数量
      if (logs.length > 19) {
        logs.pop(); //去除最后一个
      }
      var titleRendered = {
        "rendered": res.title
      };


      var log = {
        "id": res.id,
        "date": res.post_date,
        "post_date": res.post_date,
        "postType": "topic",
        "total_comments": res.total_replies,
        "pageviews": res.pageviews,
        "like_count": res.like_count,
        "title": titleRendered,
        "post_large_image": res.post_large_image,
        "post_medium_image": res.post_medium_image,
        "post_thumbnail_image": res.post_thumbnail_image,
        "post_full_image": res.post_full_image,
        "post_frist_image": res.post_frist_image,
        "author": res.author,
        "tag_name": res.tag_name,
        "author_avatar": res.author_avatar,
        "author_name": res.author_name,
        "post_all_images": res.post_all_images,
        "category_name": res.forum_title
      };
      logs.unshift(log);
      wx.setStorageSync('readLogs', logs)
    }
  })
}

function postBBTopic(id, agrs, api, appPage, util) {
  var new_comment_message_id = appPage.data.settings.new_comment_message_id

  api.postBBTopic(id, agrs).then(res => {
    if (res.success) {
      // 订阅消息模板不存在，直接返回
      if (!new_comment_message_id) {
        setTimeout(function () {
          util.navigateBack({
            prevPageData: {
              isPostSuccess: true
            }
          })
        }, 1000)
        return
      }

      var postStatus = res.postStatus
      appPage.setData({
        postStatus: postStatus
      })
      wx.z.showDialog({
        title: "ئەسكەرتىش",
        confirmText: "يوللاش",
        content: res.message + "تەستىقلانغانلىق ئۇچۇرىنى قوبۇل قىلامسىز؟",
        isCoverView: true,
        success: (data) => {
          if (data.confirm) {
            //that.postsub(postId,subscribemessagesid,postStatus);  
            var extid = res.new_topic_id;
            var subscribetype = 'topicCommentSubscribe';
            var subscribemessagesid = new_comment_message_id;
            subscribeMessage(appPage, subscribetype, api, subscribemessagesid, extid, util);
          } else if (data.cancel) {
            if (postStatus == "publish") {
              setTimeout(function () {
                util.navigateBack({
                  prevPageData: {
                    isPostSuccess: true
                  }
                })
              }, 1000)
            } else {
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1000)
            }
          }
        }
      })
    } else {

      var message = res.message
      if (res.code == '87014') {
        message = "مەزمۇن قانۇن نىزامغا ماس كەلمەپتۇ،قايتا يېزىڭ";

      }
      wx.showToast({
        title: message,
        icon: "none",
        duration: 2000,
        success: function () {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      })
    }
  }).catch(err => {
    wx.showToast({
      title: "يوللانمىدى",
      icon: "none",
      duration: 2000
    })
  })
}

function replyBBTopic(id, args, appPage, WxParse, api, util) {
  var parentId = args.parentid;
  var new_replay_message_id = appPage.data.detail.new_replay_message_id;
  api.replyBBTopicByID(id, args).then(res => {
    if (res.success) {
      wx.lin.showDialog({
        type: "confirm",
        title: "تېما",
        showTitle: false,
        confirmText: "يوللاش",
        confirmColor: "#f60",
        content: res.message + "مۇشتەرى بۇلامسىز؟",
        success: (data) => {
          if (data.confirm) {
            var extid = res.replay.id;
            var subscribetype = 'topicReplaySubscribe';
            var subscribemessagesid = new_replay_message_id;
            subscribeMessage(appPage, subscribetype, api, subscribemessagesid, extid, util);
          }
          appPage.setData({
            content: '',
            placeholder: "ئىككى كەلىمە سۆزلەي",
            parentId: "0",
            focus: false,
          });

          if (res.post_status == "publish") {
            var repliesList = appPage.data.repliesList;
            var reply = {};
            reply.author_avatar = res.replay.author_avatar;
            reply.author_id = res.replay.author_id;
            reply.author_name = res.replay.author_name
            reply.content = res.replay.content;
            reply.child = [];

            reply.id = res.replay.id;
            reply.post_date = res.replay.post_date;
            reply.reply_to_id = parentId;
            reply.title = res.replay.title;
            reply.topic_id = res.replay.topic_id;

            if (parentId == "0") {
              repliesList.unshift(reply);
            } else {
              repliesList = inertComment(repliesList, reply, parentId)
            }

            var total_replies = parseInt(appPage.data.total_replies) + 1;
            appPage.setData({
              total_replies: total_replies

            });

            appPage.setData({
              repliesList: repliesList
            });
          }
        }
      })
    } else {

      var message = res.message
      if (res.code == '87014') {
        message = "مەزمۇن قانۇن- نىزامغا خىلاپكەن،قايتا يېزىڭ";

      }

      wx.showToast({
        title: message,
        icon: "none",
        duration: 2000
      })


    }
  }).catch(err => {
    wx.showToast({
      title: "ئىنكاس قايتۇرۇش مەغلۇپ بولدى",
      icon: "none",
      duration: 2000
    })
  })
}



//يوللاش评论
function submitComment(e, appPage, app, api, util) {

  var content = e.detail.value.inputComment;
  var postId = e.detail.value.inputPostID;
  var formId = e.detail.formId;

  var parentId = appPage.data.parentId;

  var new_replay_message_id = appPage.data.detail.new_replay_message_id;

  var toUserId = appPage.data.toUserId; //回复的userid
  var commentdate = appPage.data.commentdate;


  var userId = appPage.data.userSession.userId; //当前用户的userid
  var sessionId = appPage.data.userSession.sessionId; //当前用户的sessionid
  if (content.length === 0) {
    appPage.setData({
      'dialog.hidden': false,
      'dialog.title': 'ئەسكەرتىش',
      'dialog.content': 'ئىنكاس مەزمۇنىنى يازماپسىز'

    });
  } else if (content.length > 1000) {
    appPage.setData({
      'dialog.hidden': false,
      'dialog.title': 'ئەسكەرتىش',
      'dialog.content': 'خەت سانى ئىشىپ كېتىپتۇ'

    });

  } else {

    if (appPage.data.userSession) {
      var authorName = appPage.data.userInfo.nickName;
      var authorUrl = appPage.data.userInfo.avatarUrl;
      var authorEmail = appPage.data.userSession.sessionId + "@qq.com";
      var sessionId = appPage.data.userSession.sessionId;
      var fromUser = appPage.data.userInfo.nickName;
      var posttype = "post";
      var data = {
        postid: postId,
        authorname: authorName,
        authoremail: authorEmail,
        content: content,
        authorurl: authorUrl,
        parentid: parentId,
        sessionid: sessionId,
        userid: userId,

      };

      api.postCommentsReplay(data).then(res => {
        if (res.success) {
          appPage.setData({
            content: '',
            parentId: "0",
            placeholder: "ئىنكاس...",
            focus: false
          });

          wx.lin.showDialog({
            type: "confirm",
            title: "تېما",
            showTitle: false,
            confirmText: "يوللاش",
            confirmColor: "#f60",
            content: res.message + "。تەستىقلانغانلىق ئۇچۇرىنى قوبۇل قىلامسىز؟",
            success: (data) => {
              if (data.confirm) {
                var extid = res.comment.comment_ID;
                var subscribetype = 'postReplaySubscribe';
                var subscribemessagesid = new_replay_message_id;
                subscribeMessage(appPage, subscribetype, api, subscribemessagesid, extid);
              } else if (data.cancel) {}

              if (res.comment_approved == "1") {
                var comment = {};
                comment.author_name = res.comment.comment_author
                comment.author_url = res.comment.comment_author_url;
                comment.content = res.comment.comment_content;
                comment.child = [];
                comment.date = res.comment.comment_date;
                comment.userid = res.comment.comment_author;
                comment.id = res.comment.comment_ID;

                var commentsList = appPage.data.commentsList;

                if (parentId == "0") {
                  commentsList.unshift(comment);
                } else {
                  commentsList = inertComment(commentsList, comment, parentId)
                }
                appPage.setData({
                  commentsList: commentsList
                });
              }
            }
          })
          var commentCounts = parseInt(appPage.data.commentCounts) + 1;
          appPage.setData({
            commentCounts: commentCounts

          });
        } else {
          var message = res.message
          var code = res.code;
          if (res.code == '87014') {
            message = "مەزمۇن قانۇن- نىزامغا خىلاپكەن،قايتا يېزىڭ";

          }

          wx.showToast({
            title: message,
            icon: "none",
            duration: 5000,
            success: function () {

            }
          })


        }

        appPage.hiddenBar();

      })


    }

  }

}

function inertComment(commentsList, commet, parentId) {
  var _commentsList = [];
  commentsList.forEach(element => {
    if (element.id == parentId) {
      element.child.push(commet);
    } else if (element.id != parentId) {
      var childComments = element.child;
      if (childComments && childComments.length != 0) {

        var child = inertChildComment(childComments, commet, parentId)
        element.child = child;

      }
    }
    _commentsList.push(element);

  });

  return _commentsList;
}

function inertChildComment(childComments, commet, parentId) {
  var _childcommentsList = [];
  childComments.forEach(childelement => {

    if (childelement.id == parentId) {
      childelement.child.push(commet);
    } else if (childelement.id != parentId) {
      var childComments = childelement.child;
      if (childComments && childComments.length != 0) {

        var child = inertChildComment(childComments, commet, parentId)
        childelement.child = child;

      }

    }
    _childcommentsList.push(childelement)
  })

  return _childcommentsList;

}
// 跳转至查看文章详情
function redictDetail(e, posttype) {
  var id = e.currentTarget.id;
  var weixinmpurl = e.currentTarget.dataset.weixinmpurl;
  var weixinmptype = e.currentTarget.dataset.weixinmptype;
  var url = "";
  if (posttype == "post") {

    url = '../detail/detail?id=' + id;
    if (weixinmptype == "1") {
      url = "../webview/webview?url=" + weixinmpurl;
    }
  } else if (posttype == "topic") {
    url = '../socialdetail/socialdetail?id=' + id;

  }
  wx.navigateTo({
    url: url
  })
}

function postLike(id, appPage, app, api, postType) {

  var userId = appPage.data.userSession.userId; //当前用户的userid
  var sessionId = appPage.data.userSession.sessionId; //当前用户的sessionid
  var postId = id;

  var data = {
    userid: userId,
    postid: postId,
    sessionid: sessionId
  };

  api.postLike(data).then(res => {
    if (res.success) {
      wx.showToast({
        title: res.message,
        icon: "none",
        duration: 3000,
        success: function () {

          if (postType == "postDetail" || postType == "topicDetail") {

            var myLikeList = [];
            var myLike = appPage.data.userInfo.avatarUrl;
            myLikeList.push(myLike);
            var avatarurls = myLikeList.concat(appPage.data.detail.avatarurls);
            var likeCount = parseInt(appPage.data.detail.like_count) + 1;
            var detail = appPage.data.detail;
            detail.avatarurls = avatarurls;
            detail.like_count = likeCount;
            appPage.setData({
              detail: detail
            });

            appPage.setData({
              likeIcon: "../../images/entry-like-on.png"
            })

          } else if (postType == "topicList") {
            var topicsList = [];
            appPage.setData({
              topicsList: topicsList.concat(appPage.data.topicsList.map(function (item) {
                if (item.id == postId) {
                  var count = parseInt(item.like_count);
                  count++;
                  item.like_count = count;

                  var myAvatarUrl = appPage.data.userInfo.avatarUrl;
                  var avatarurls = item.avatarurls
                  if (avatarurls.length > 14) {
                    avatarurls.pop();
                  }
                  var _avatarurls = [];
                  _avatarurls.push(myAvatarUrl);
                  var avatarurlList = _avatarurls.concat(avatarurls);
                  item.avatarurls = avatarurlList;

                }
                return item;
              }))
            });
          } else if (postType == "media-list") {
            var mediaList = [];
            appPage.setData({
              mediaList: mediaList.concat(appPage.data.mediaList.map(function (item) {
                if (item.post_parent_id == postId) {
                  var count = parseInt(item.like_count);
                  count++;
                  item.like_count = count;
                  item.mylike = "1";
                }
                return item;
              }))
            });
          } else if (postType == "authorTopicsList") {
            var authorTopicsList = [];
            appPage.setData({
              authorTopicsList: authorTopicsList.concat(appPage.data.authorTopicsList.map(function (item) {
                if (item.id == postId) {
                  var count = parseInt(item.like_count);
                  count++;
                  item.like_count = count;

                  var myAvatarUrl = appPage.data.userInfo.avatarUrl;
                  var avatarurls = item.avatarurls
                  if (avatarurls.length > 14) {
                    avatarurls.pop();
                  }
                  var _avatarurls = [];
                  _avatarurls.push(myAvatarUrl);
                  var avatarurlList = _avatarurls.concat(avatarurls);
                  item.avatarurls = avatarurlList;

                }
                return item;
              }))
            });
          }

        }
      })


    } else {
      toast(res.message, 2000);

      if (res.message == "ياقتۇرۇلدى") {
        appPage.setData({
          likeIcon: "../../images/entry-like-on.png"
        });

      }


    }

  });

}


function toast(message, duration) {
  wx.showToast({
    title: message,
    icon: "none",
    duration: duration
  });
}

function copyLink(url, message) {
  //this.ShowHideMenu();
  wx.setClipboardData({
    data: url,
    success: function (res) {
      wx.getClipboardData({
        success: function (res) {
          // toast('链接已复制')
          toast(message, 3000);

        }
      })
    }
  })
}

function gotoWebpage(enterpriseMinapp, url) {
  var link = '../webview/webview';
  if (enterpriseMinapp == "1") {

    wx.navigateTo({
      url: link + '?url=' + url
    })
  } else {
    copyLink(url, "ئادرىس كۆچۈرۈلدى،تور كۆرگۈچكە چاپلاپ كۆرۈڭ");

  }

}

function creatArticlePoster(appPage, app, api, util, modalView, postype, poster) {

  var postId = appPage.data.detail.id;
  var title = appPage.data.detail.title
  if (postype == "post") {
    title = appPage.data.detail.title.rendered;
  }

  var excerpt = appPage.data.detail.excerpt ? appPage.data.detail.excerpt : '';
  if (postype == "post") {
    excerpt = appPage.data.detail.excerpt.rendered;
  }

  if (excerpt && excerpt.length != 0 && excerpt != '') {
    excerpt = util.removeHTML(excerpt);
  }


  var postImageUrl = ""; //海报图片地址
  var posterImagePath = "";
  var qrcodeImagePath = ""; //二维码图片的地址
  var flag = false;
  var imageInlocalFlag = false;
  var downloadFileDomain = appPage.data.downloadFileDomain;
  // var logo = appPage.data.logo;
  var defaultPostImageUrl = appPage.data.postImageUrl;
  var postImageUrl = appPage.data.detail.post_full_image;


  //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
  if (postImageUrl) {
    var n = 0;
    for (var i = 0; i < downloadFileDomain.length; i++) {

      if (postImageUrl.indexOf(downloadFileDomain[i]) != -1) {
        n++;
        break;
      }
    }
    if (n == 0) {
      imageInlocalFlag = true;
      postImageUrl = defaultPostImageUrl;
    }
  } else {
    postImageUrl = defaultPostImageUrl;
  }
  var posterConfig = {
    width: 750,
    height: 1300,
    backgroundColor: '#fff',
    debug: false

  }
  var blocks = [{
      width: 690,
      height: 908,
      x: 30,
      y: 183,
      // borderWidth: 2,
      // borderColor: '#f0c2a0',
      // borderRadius: 20,
    },
    {
      width: 634,
      height: 74,
      x: 59,
      y: 680,
      backgroundColor: '#fff',
      opacity: 0,
      zIndex: 100,
    }
  ]
  var texts = [];
  if (postype == "post") {

    texts = [{
        x: 160,
        y: 100,
        baseLine: 'middle',
        text: appPage.data.userInfo.nickName,
        fontSize: 32,
        color: '#4c4c4c',
        width: 570,
        lineNum: 1
      },
      {
        x: 60,
        y: 170,
        baseLine: 'top',
        text: 'بۇ يازما يامان ئەمەس تۇرىدۇ،كۆرۈپ باقامسىز؟',
        fontSize: 33,
        color: '#959595',
      },
      {
        x: 60,
        y: 860,
        baseLine: 'middle',
        text: title,
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4c4c4c',
        marginLeft: 30,
        width: 630,
        lineNum: 2,
        lineHeight: 60
      },
      {
        x: 60,
        y: 960,
        baseLine: 'middle',
        // text: excerpt,
        text: '',
        fontSize: 28,
        color: '#929292',
        width: 630,
        lineNum: 1,
        lineHeight: 50
      },
      {
        x: 60,
        y: 1100,
        baseLine: 'top',
        text: 'چىڭ بېسىپ كىرىپ تەپسىلاتىنى كۆرۈڭ',
        fontSize: 30,
        color: '#080808',
        width: 350,
        lineNum: 2,
        lineHeight: 50
      }
    ];
  } else if (postype == 'topic') {

    blocks = [{
        width: 690,
        height: 908,
        x: 30,
        y: 183
        // borderWidth: 2,
        // borderColor: '#f0c2a0',
        // borderRadius: 20,
      },
      {
        width: 634,
        height: 74,
        x: 59,
        y: 680,
        backgroundColor: '#fff',
        opacity: 0,
        zIndex: 100,
      }
    ];

    texts = [{
        x: 160,
        y: 100,
        baseLine: 'middle',
        text: appPage.data.userInfo.nickName,
        fontSize: 32,
        color: '#4c4c4c',
        width: 570,
        lineNum: 1
      },
      {
        x: 60,
        y: 170,
        baseLine: 'top',
        text: 'چىڭ بېسىپ كىرىپ تەپسىلاتىنى كۆرۈڭ',
        fontSize: 33,
        color: '#959595',
      },
      {
        x: 60,
        y: 860,
        baseLine: 'middle',
        text: title,
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4c4c4c',
        marginLeft: 30,
        width: 630,
        lineNum: 2,
        lineHeight: 60
      },
      {
        x: 60,
        y: 1100,
        baseLine: 'top',
        text: 'چىڭ بېسىپ كىرىپ تەپسىلاتىنى كۆرۈڭ',
        fontSize: 30,
        color: '#080808',
        width: 350,
        lineNum: 2,
        lineHeight: 50
      }
    ];

  }

  posterConfig.blocks = blocks; //海报内图片的外框
  posterConfig.texts = texts; //海报的文字
  api.creatPoster(postId).then(res => {
    if (res.success) {
      qrcodeImagePath = res.qrcodeurl;


      var images = [{
          width: 80,
          height: 80,
          x: 60,
          y: 60,
          borderRadius: 80,
          url: appPage.data.userInfo.avatarUrl, //用户头像
        },
        {
          width: 750,
          height: 562,
          x: 0,
          y: 240,
          url: postImageUrl, //海报主图
        },
        {
          width: 160,
          height: 160,
          x: 530,
          y: 1060,
          url: qrcodeImagePath, //二维码的图
        }
      ];

      posterConfig.images = images; //海报内的图片
      appPage.setData({
        posterConfig: posterConfig
      }, () => {
        poster.create(true); //生成海报图片
      });

    } else {
      toast(res.message, 2000);
    }
  });
}

function creatPoster(appPage, app, api, util, modalView, postype) {
  var postId = appPage.data.detail.id;
  var title = appPage.data.detail.title
  if (postype == "post") {
    title = appPage.data.detail.title.rendered;
  }

  var excerpt = appPage.data.detail.excerpt;
  if (postype == "post") {
    excerpt = appPage.data.detail.excerpt.rendered;
  }

  if (excerpt && excerpt.length != 0 && excerpt != '') {
    excerpt = util.removeHTML(excerpt);
  }
  var postImageUrl = "";
  var posterImagePath = "";
  var qrcodeImagePath = "";
  var flag = false;
  var imageInlocalFlag = false;
  var downloadFileDomain = appPage.data.downloadFileDomain;
  var logo = appPage.data.logo;
  var defaultPostImageUrl = appPage.data.postImageUrl;
  var postImageUrl = appPage.data.detail.post_full_image;

  //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
  if (postImageUrl) {
    var n = 0;
    for (var i = 0; i < downloadFileDomain.length; i++) {

      if (postImageUrl.indexOf(downloadFileDomain[i].domain) != -1) {
        n++;
        break;
      }
    }
    if (n == 0) {
      imageInlocalFlag = true;
      postImageUrl = defaultPostImageUrl;

    }

  } else {
    postImageUrl = defaultPostImageUrl;
  }
  api.creatPoster(postId).then(res => {
    if (res.success) {
      //下载二维码
      const downloadTaskQrcodeImage = wx.downloadFile({
        url: res.qrcodeurl,
        success: res => {
          if (res.statusCode === 200) {
            qrcodeImagePath = res.tempFilePath;

            if (imageInlocalFlag) {
              createPosterLocal(appPage, postImageUrl, qrcodeImagePath, title, excerpt, logo, modalView)
            } else {
              const downloadTaskForPostImage = wx.downloadFile({
                url: postImageUrl,
                success: res => {
                  if (res.statusCode === 200) {
                    posterImagePath = res.tempFilePath;

                    flag = true;
                    if (posterImagePath && qrcodeImagePath) {
                      createPosterLocal(appPage, posterImagePath, qrcodeImagePath, title, excerpt, logo, modalView);
                    } else {
                      wx.hideLoading();
                      toast("چۈشۈرۈش مەغلوب بولدى", 2000);

                    }
                  } else {
                    wx.hideLoading();
                    toast("چۈشۈرۈش مەغلۇپ بولدى" + res, 2000);
                  }
                }
              });
              downloadTaskForPostImage.onProgressUpdate((res) => {})
            }
          } else {

            toast(res.message, 2000);

          }

        }
      });
      downloadTaskQrcodeImage.onProgressUpdate((res) => {})


    } else {
      toast(res.message, 2000);
    }
  })


}

//将canvas转换为图片保存到本地，然后将路径传给image图片的src
function createPosterLocal(appPage, postImageLocal, qrcodeLoal, title, excerpt, logo, modalView) {

  wx.showLoading({
    title: "سەل ساقلاڭ",
    mask: true,
  });
  var context = wx.createCanvasContext('mycanvas');
  context.setFillStyle('#ffffff'); //填充背景色
  context.fillRect(0, 0, 600, 970);
  context.drawImage(postImageLocal, 0, 0, 600, 400); //绘制首图
  context.drawImage(qrcodeLoal, 210, 670, 180, 180); //绘制二维码
  // context.drawImage(logo, 350, 740, 130, 130); //画logo 
  //const grd = context.createLinearGradient(30, 690, 570, 690)//定义一个线性渐变的颜色
  //grd.addColorStop(0, 'black')
  //grd.addColorStop(1, '#118fff')
  //context.setFillStyle(grd)
  context.setFillStyle("#959595");
  context.setFontSize(20);
  context.setTextAlign('center');
  context.fillText("چىڭ بېسىپ كىرىپ تەپسىلاتىنى كۆرۈڭ", 300, 900);
  //context.setStrokeStyle(grd)
  context.setFillStyle("#959595");
  //分割线 context.beginPath()
  // context.moveTo(30, 690)
  // context.lineTo(570, 690)
  // context.stroke();
  // this.setUserInfo(context);//用户信息        
  drawTitleExcerpt(context, title, excerpt); //文章تېما
  context.draw();
  //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
  setTimeout(function () {
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        wx.hideLoading();
        appPage.showModal(res.tempFilePath);
      }
    });
  }, 900);
}

//绘制文字：文章题目、摘要、扫码阅读
function drawTitleExcerpt(context, title, excerpt) {
  context.setFillStyle("#333");
  context.setTextAlign('left');
  if (getStrLength(title) <= 14) {
    //14字以内绘制成一行，美观一点
    context.font = "bold 36rpx arial";
    context.fillText(title, 60, 480);
  } else {
    //   //题目字数很多的，只绘制前36个字（如果题目字数在15到18个字则也是一行，不怎么好看）
    context.font = "bold 36rpx arial";
    context.fillText(title.substring(0, 14), 60, 460);
    context.fillText(title.substring(14, 26) + "...", 60, 510);
  }

  context.setFontSize(22);
  context.setTextAlign('left');
  context.setGlobalAlpha(0.6);
  for (var i = 0; i <= 30; i += 23) {
    //摘要只绘制前50个字，这里是用截取字符串
    if (getStrLength(excerpt) > 30) {
      if (i == 40) {
        context.fillText(excerpt.substring(i, i + 23), 60, 570 + i * 2);

      } else {
        context.fillText(excerpt.substring(i, i + 23), 60, 570 + i * 2);
      }

    } else {
      context.fillText(excerpt.substring(i, i + 22), 60, 570 + i * 2);
    }
  }

  context.stroke();
  context.save();
}

function getStrLength(str) {
  return str.replace(/[\u0391-\uFFE5]/g, "aa").length;
}

function postPayment(appPage, app, api) {
  var args = {};
  args.sessionid = appPage.data.userSession.sessionId;
  args.userid = appPage.data.userSession.userId;
  args.totalfee = appPage.data.totalfee;
  args.extid = appPage.data.postId;
  args.extype = 'postpraise';
  var posttypte = appPage.data.posttype;


  api.postPayment(args).then(res => {
    if (res.success) {
      var order = res.order;
      var noncestr = res.nonceStr
      wx.requestPayment({
        'timeStamp': res.timeStamp,
        'nonceStr': res.nonceStr,
        'package': res.package,
        'signType': res.signType,
        'paySign': res.paySign,
        'success': function (res) {
          wx.showToast({
            title: 'رىغبەلەندۇرگىنىڭىزگە رەھمەت',
            uration: 3000,
            success: function () {
              var data = {
                userid: args.userid,
                sessionid: args.sessionid,
                rewordcode: 'raw_praise_integral',
                order: order
              };
              api.updateOrderStatus(data).then(res => {
                wx.navigateBack({
                  delta: 1
                })
              })
            }
          });
        },
        'fail': function (res) {
          toast(res.errMsg, 2000);
        },
        complete: function (res) {
          if (res.errMsg == 'requestPayment:fail cancel') {
            toast("تۆلەش بىكار قىلىندى", 2000);
          }
        }
      });
    } else {
      wx.showToast({
        title: res.message,
        icon: "none",
        duration: 1e3
      })
    }
  })
}

function prodcutPayment(appPage, app, api, util) {
  var args = {};
  args.sessionid = appPage.data.userSession.sessionId;
  args.userid = appPage.data.userSession.userId;
  args.totalfee = appPage.data.totalfee;
  args.extid = appPage.data.productId;
  args.extype = appPage.data.productype;
  var content = appPage.data.productName;
  api.postPayment(args).then(res => {
    console.log(res)
    if (res.success) {
      var order = res.order;
      var noncestr = res.nonceStr
      wx.requestPayment({
        'timeStamp': res.timeStamp,
        'nonceStr': res.nonceStr,
        'package': res.package,
        'signType': res.signType,
        'paySign': res.paySign,
        'success': function (res) {
          wx.lin.showToast({
            title: 'پۇل تۆلەندى',
            icon: 'success',
            duration: 3000,
            mask: true,
            placement: 'right',
            success: (res) => {
              var data = {
                userid: args.userid,
                sessionid: args.sessionid,
                rewordcode: 'raw_payment_integral',
                order: order
              };
              api.updateOrderStatus(data).then(res => {
                if (appPage.data.pageName == "payment") {
                  util.navigateBack({
                    prevPageData: {
                      isPaySuccess: true
                    }
                  })
                } else if (appPage.data.pageName == "list") {
                  var category = appPage.data.category;
                  category.paypequired = "0";
                  appPage.setData({
                    category: category
                  });
                }
              })
            }
          })
        },
        'fail': function (res) {
          toast(res.errMsg, 2000);
        },
        complete: function (res) {
          if (res.errMsg == 'requestPayment:fail cancel') {
            toast("تۆلەش بىكار قىلىندى", 2000);
          }
        }
      });
    } else {
      wx.showToast({
        title: res.message,
        icon: "none",
        duration: 1e3
      })
    }
  });
}

function upLoadImage(count, callback, nodeIndex, sourceType, app, api, appPage) {
  var that = this;
  nodeIndex = typeof (nodeIndex) == 'undefined' ? 0 : parseInt(nodeIndex);
  sourceType = sourceType == null ? ['album', 'camera'] : sourceType;
  wx.chooseImage({
    count: count,
    sourceType: sourceType,
    success: function (res) {
      var filePath = res.tempFilePaths;
      var tempFileSize = Math.ceil((res.tempFiles[0].size) / 1024);
      if (tempFileSize > 2048) {
        wx.showToast({
          title: "رەسىم 2مىگابايىتتىن چوڭكەن",
          mask: false,
          icon: "none",
          duration: 3000
        });
        return;

      }
      if (filePath.length > count) {
        wx.showToast({
          title: 'رەسىم سانى' + count + "پارچىدىن ئىشىپ كەتكەن",
          icon: "none",
          duration: 1e3,
          success: function () {

          }
        })
        return;
      }

      if (filePath.length > 0) {
        for (let k in filePath) {
          var imgfile = filePath[k];
          // 1、默认返回本地图片
          //callback_page(appPage,callback, { code: 0, data: { id: 0, src: imgfile, nodeIndex: nodeIndex, islode: nodeIndex } }, 'local');
          var data = {
            code: 0,
            data: {
              id: 0,
              src: imgfile,
              nodeIndex: nodeIndex,
              islode: nodeIndex
            }
          };
          callback(data, 'local');
          // 2、上传至服务器
          upLoadImageToServer(imgfile, callback, nodeIndex, app, api, appPage);
          // 节点自增
          nodeIndex++;
        }

      }
    }
  })

}

function upLoadImageToServer(imgfile, callback, nodeIndex, app, api, appPage) {
  var sessionId = appPage.data.userSession.sessionId;
  var userId = appPage.data.userSession.userId;

  if (!sessionId || !userId) {
    toast('كىرگەندىن كىيىن مەشغۇلات قىلىڭ', 3000);
    return
  }

  var formData = {
    'sessionid': sessionId,
    'userid': userId
  };
  var args = {};
  args.imgfile = imgfile;
  args.formData = formData;
  api.uploadFile(args).then(res => {
    var jsonData = JSON.parse(res.trim());
    if (jsonData.success) {
      var data = {
        code: 0,
        data: {
          id: nodeIndex,
          src: jsonData.imageurl,
          attachmentPostId: jsonData.attachmentPostId,
          nodeIndex: nodeIndex,
          text: "<img src='" + jsonData.imageurl + "' />",
          islode: -1,
          alt: ''
        }
      };
      callback(data, 'server');

    } else {

      var data = {
        code: 0,
        data: {
          id: nodeIndex,
          src: jsonData.imageurl,
          nodeIndex: nodeIndex,
          attachmentPostId: 0,
          text: "<img src='" + jsonData.imageurl + "' />",
          islode: -2,
          alt: ''
        }
      };
      callback(data, 'server');

    }

    toast(jsonData.message, 2000);
  })

}

function callback_page(appPage, func, res, opt) {
  var that = this;
  if (func && typeof (that.page[func]) == 'function') {
    if (opt && typeof (opt) != 'undefined') {
      that.page[func](res, opt);
    } else {
      that.page[func](res);
    }
  } else if (typeof (that[func]) == 'function') {
    if (opt && typeof (opt) != 'undefined') {
      that[func](res, opt);
    } else {
      that[func](res);
    }
  }
}

function upLoadFile(filePath, app, appPage, api) {
  var sessionId = appPage.data.userSession.sessionId;
  var userId = appPage.data.userSession.userId;
  var jsonData = {};
  if (!sessionId || !userId) {
    toast('كىرگەندىن كىيىن مەشغۇلات قىلىڭ', 3000);
    return
  }

  var formData = {
    'sessionid': sessionId,
    'userid': userId
  };

  var data = {};
  data.imgfile = filePath;
  data.formData = formData;
  api.uploadFile(data).then(res => {
    if (res.code) {
      toast(res.message, 3000);
    } else {
      var jsonData = JSON.parse(res);
      var imageurl = jsonData.imageurl;
      appPage.setData({
        imageObject: appPage.data.imageObject.concat('<img src="' + imageurl + '"/><br/>')
      });
    }

  })

}

function getVideo(agrs, api, appPage) {
  wx.showLoading({
    title: 'يېشىۋاتىدۇ...',
    mask: true
  });
  api.getVideoInfo(agrs).then(res => {

    if (res.code) {
      toast(res.message, 3000);
    } else {

      if (res.videourl == "") {
        toast("فىلىم يېشىلمىدى", 3000);
      }

      appPage.setData({
        linkVideoSrc: res.videourl,
        content: res.desc,
        linkPoster: res.cover,
        linkVideoUrl: agrs.infoUrl,
        videoLocal: false
      });

      appPage.setData({
        linkInfo: ""
      })
    }
    wx.hideLoading();
  }).catch(err => {
    toast(err, 3000);
    wx.hideLoading();
    appPage.setData({
      linkInfo: ""
    })


  })
}

function getWeibo(args, api, appPage) {


  wx.showLoading({
    title: 'يېشىلىۋاتىدۇ...',
    mask: true
  });
  api.getWeibo(args).then(res => {

    if (res.code) {
      toast(res.message, 3000);
    } else {

      var link_pics_array = new Array();
      var images = res.images;
      for (var i = 0; i < images.length; i++) {
        appPage.data.link_pics.add(images[i]);

      }

      appPage.data.link_pics.toArray().map(path => {
        link_pics_array.push({
          path: path,
          upload: false,
          progress: 0,
          local: false
        })
      })

      appPage.setData({
        linkInfo: ""
      })
      if (res.content == "") {
        toast("يېشىش مەغلۇپ بولدى", 3000);
      }

      appPage.setData({
        linkVideoUrl: args.infoUrl,
        content: res.content,
        title: res.title,
        linkPoster: res.cover,
        videoLocal: false,
        link_pics_array: link_pics_array,
        link_pics: appPage.data.link_pics,
        linkVideoSrc: res.videourl
      });
    }
    wx.hideLoading();
  }).catch(err => {
    toast(err, 3000);
    wx.hideLoading();

  })

}

function getToutiao(args, api, appPage) {

  wx.showLoading({
    title: 'يېشىلىۋاتىدۇ...',
    mask: true
  });
  api.getToutiao(args).then(res => {

    if (res.code) {
      toast(res.message, 3000);
    } else {

      var pics_array = new Array();
      var pics = res.images;
      if (pics.length > 0) {
        pics.map(path => {
          pics_array.push({
            path: path,
            upload: false,
            progress: 0,
            local: false
          })
        })
      }

      appPage.setData({
        linkInfo: ""
      })
      if (res.content == "") {
        toast("يېشىىش مەغلۇپ بولدى", 3000);
      }

      appPage.setData({
        videoUrl: args.infoUrl,
        videoLocal: false,
        content: res.content,
        title: res.title,
        poster: res.cover,
        pics_array: pics_array,
        videoSrc: res.videourl
      });
    }
    wx.hideLoading();
  }).catch(err => {
    toast(err, 3000);
    wx.hideLoading();

  })

}

//初始化播放器，获取duration
function InitializationAudio(innerAudioContext, audiosrc, appPage, ) {
  var self = appPage;
  //设置src
  innerAudioContext.src = audiosrc;
  //运行一次
  //innerAudioContext.play();
  innerAudioContext.autoplay = false;
  innerAudioContext.pause();
  innerAudioContext.onCanplay(() => {
    //初始化duration
    innerAudioContext.duration
    setTimeout(function () {
      //延时获取音频真正的duration
      var duration = innerAudioContext.duration;
      var min = parseInt(duration / 60);
      var sec = parseInt(duration % 60);
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      self.setData({
        audioDuration: innerAudioContext.duration,
        showTime2: `${min}:${sec}`
      });
    }, 1000)
  })

}

function loadAudio(innerAudioContext, appPage) {
  var that = appPage;
  //设置一个计步器
  that.data.durationIntval = setInterval(function () {
    //当歌曲在播放时执行
    if (that.data.isPlayAudio == true) {
      //获取歌曲的播放时间，进度百分比
      var seek = that.data.audioSeek;
      var duration = innerAudioContext.duration;
      var time = that.data.audioTime;
      time = parseInt(100 * seek / duration);
      //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
      var min = parseInt((seek + 1) / 60);
      var sec = parseInt((seek + 1) % 60);
      //填充字符串，使3:1这种呈现出 03：01 的样式
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      var min1 = parseInt(duration / 60);
      var sec1 = parseInt(duration % 60);
      if (min1.toString().length == 1) {
        min1 = `0${min1}`;
      }
      if (sec1.toString().length == 1) {
        sec1 = `0${sec1}`;
      }
      //当进度条完成，停止播放，并重设播放时间和进度条
      if (time >= 100) {
        innerAudioContext.stop();
        that.setData({
          audioSeek: 0,
          audioTime: 0,
          audioDuration: duration,
          isPlayAudio: false,
          showTime1: `00:00`
        });
        return false;
      }
      //正常播放，更改进度信息，更改播放时间信息
      that.setData({
        audioSeek: seek + 1,
        audioTime: time,
        audioDuration: duration,
        showTime1: `${min}:${sec}`,
        showTime2: `${min1}:${sec1}`
      });
    }
  }, 1000);
}

function playAudio(innerAudioContext, appPage) {
  //获取播放状态和当前播放时间  
  var isPlayAudio = appPage.data.isPlayAudio;
  var seek = appPage.data.audioSeek;
  innerAudioContext.pause();
  //更改播放状态
  appPage.setData({
    isPlayAudio: !isPlayAudio
  })
  if (isPlayAudio) {
    //如果在播放则记录播放的时间seek，暂停
    appPage.setData({
      audioSeek: innerAudioContext.currentTime
    });
  } else {
    //如果在暂停，获取播放时间并继续播放
    innerAudioContext.src = appPage.data.detail.audios[0].src;
    if (innerAudioContext.duration != 0) {
      appPage.setData({
        audioDuration: innerAudioContext.duration
      });
    }
    // 解决ios手机开启静音模式，播放没声音
    wx.setInnerAudioOption({
      obeyMuteSwitch: false
    })
    //跳转到指定时间播放
    innerAudioContext.seek(seek);
    innerAudioContext.play();
  }
}

function userFollow(api, appPage, args) {
  var topicsList = [];
  var authorList = [];
  var userId = args.id;
  var flag = args.flag;
  if (flag == 'true') {
    flag = true;
  }
  if (flag == 'false') {
    flag = false
  }
  args.flag = flag;
  var listType = args.listType;
  wx.showLoading({
    title: 'يېڭىلىنىۋاتىدۇ...',
    mask: true
  })
  api.followAuthor(args).then(res => {
    if (res.success) {
      if (listType == 'topicList') {
        appPage.setData({
          topicsList: topicsList.concat(appPage.data.topicsList.map(function (item) {
            if (item.author_id == userId) {
              item.follow = !flag;
            }
            return item;
          }))
        })
      } else if (listType == 'authorList') {
        appPage.setData({
          authorList: authorList.concat(appPage.data.authorList.map(function (item) {
            if (item.post_author == userId) {
              var followmecount = parseInt(item.followmecount);
              if (!flag) {
                followmecount++;
              } else {
                followmecount--;
              }
              item.followmecount = followmecount;
              item.follow = !flag ? "true" : "false";
            }
            return item;
          }))
        });
      } else if (listType == 'author') {
        var userInfo = appPage.data.userInfo;
        var followmecount = parseInt(userInfo.followmecount);
        if (!flag) {
          followmecount++;

        } else {
          followmecount--;
        }
        userInfo.followmecount = followmecount;
        userInfo.follow = !flag;
        appPage.setData({
          userInfo: userInfo
        });
      }


      // wx.showToast({
      //   title: res.message,
      //   icon: "none",
      //   duration: 2000
      // })

      wx.hideLoading()


    } else {

      // wx.showToast({
      //   title: res.message,
      //   icon: "none",
      //   duration: 2000
      // })

      wx.hideLoading()


    }
  })

}

function subscribeMessage(appPage, subscribetype, api, subscribeMesagesId, extid, util) {
  var userId = appPage.data.userSession.userId;
  var sessionId = appPage.data.userSession.sessionId;
  var pageName = appPage.data.pageName;
  var postStatus = appPage.data.postStatus ? appPage.data.postStatus : "";
  var args = {};
  args.userid = userId;
  args.extid = extid;
  args.sessionid = sessionId;
  args.subscribetype = subscribetype;

  if (!sessionId) {
    appPage.setData({
      isLoginPopup: true
    });
  }
  wx.requestSubscribeMessage({
    tmplIds: [subscribeMesagesId],
    success: function (res) {
      var scopeSubscribeMessage = "";
      if (res.errMsg === "requestSubscribeMessage:ok") {
        for (var k in res) {
          if (res[k] == 'accept') {
            scopeSubscribeMessage = 'accept';
            break;
          } else if (res[k] == 'reject') {
            scopeSubscribeMessage = 'reject';

            break;
          } else if (res[k] == 'ban') {
            scopeSubscribeMessage = 'ban';
            break;
          }
        }
      }

      if (scopeSubscribeMessage == "accept" || scopeSubscribeMessage == "reject") {
        args.subscribeflag = scopeSubscribeMessage;
        api.subscribeMessage(args).then(res => {
          if (res.error) {
            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 3000
            });
          } else {
            var subscribeCount = res.subscribeCount;
            var memberUserInfo = appPage.data.memberUserInfo;
            if (subscribetype == "newcontent") {
              memberUserInfo.newcontentSubscribeCount = subscribeCount;
              appPage.setData({
                memberUserInfo: memberUserInfo
              });
            } else if (subscribetype == "newreplay") {
              memberUserInfo.newreplaySubscribeCount = subscribeCount;
              appPage.setData({
                memberUserInfo: memberUserInfo
              });
            } else if (pageName == "list") {
              var category = appPage.data.category;
              category.categorySubscribeCount = subscribeCount;
              appPage.setData({
                category: category
              });

            } else if (pageName == "cate") {
              var args = {};
              args.isTree = true;
              args.cateType = 'topic';
              args.userId = appPage.data.userSession.userId
              args.sessionId = appPage.data.userSession.sessionId
              loadCategories(args, appPage, api, false);
            } else if (pageName == "index" || pageName == "detail") {
              var _columns = appPage.data.columns;
              var columns = [];
              _columns.forEach(column => {
                if (column.id == extid) {
                  column.categorySubscribeCount = subscribeCount;
                }
                columns.push(column)
              })
              appPage.setData({
                columns: columns
              });
            } else if (pageName == "sociallist") {
              var category = appPage.data.category;
              category.categorySubscribeCount = subscribeCount;
              appPage.setData({
                category: category
              });
            } else if (pageName == "social" || pageName == "socialdetail") {
              var _forums = appPage.data.forums;
              var forums = [];
              _forums.forEach(forum => {
                if (forum.id == extid) {
                  forum.categorySubscribeCount = subscribeCount;
                }
                forums.push(forum)
              })
              appPage.setData({
                forums: forums
              })
            } else if (pageName == "m-myPublish") {
              var _userpostsList = appPage.data.userpostsList;
              var userpostsList = [];
              _userpostsList.forEach(userposts => {
                if (userposts.id == extid) {
                  userposts.subscribeCount = subscribeCount;
                }
                userpostsList.push(userposts)
              })
              appPage.setData({
                userpostsList: userpostsList
              });
            } else if (pageName == "readlog") {
              var _commentsReplays = appPage.data.commentsReplays;
              var commentsReplays = [];
              _commentsReplays.forEach(comment => {
                if (comment.id == extid) {
                  comment.subscribeCount = subscribeCount;
                }
                commentsReplays.push(comment)
              })
              appPage.setData({
                commentsReplays: commentsReplays
              });
            }

            wx.showToast({
              title: res.message,
              mask: false,
              icon: "none",
              duration: 3000,
              success: function () {
                if ((pageName == "addarticle" || pageName == "postopic")) {
                  if (postStatus == "publish") {
                    setTimeout(function () {
                      util.navigateBack({
                        prevPageData: {
                          isPostSuccess: true
                        }
                      })
                    }, 1000)
                  } else {
                    setTimeout(function () {
                      wx.navigateBack({
                        delta: 1
                      })
                    }, 1000)
                  }
                }
              }
            });
          }
        })
      } else if (scopeSubscribeMessage == "ban") {
        wx.showToast({
          title: "باشقۇرغۇچى تەرىپىدىن چەكلەندى",
          mask: false,
          icon: "none",
          duration: 3000,
          success: function () {
            if (pageName == "addarticle")
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 3000)
          }
        });
      }
      appPage.setData({
        scopeSubscribeMessage: scopeSubscribeMessage
      });
    },
    fail: function (error) {
      appPage.setData({
        scopeSubscribeMessage: ""
      });
      if (error.errorCode == "20004") {
        wx.showToast({
          title: "ئۇچۇر ئۇقۇش ھۇقۇقى ئېچىڭ",
          mask: false,
          icon: "none",
          duration: 3000,
          success: function () {
            if (pageName == "addarticle") {
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 3000)
            }
          }
        })
      } else {
        wx.showToast({
          title: error.errMsg,
          mask: false,
          icon: "none",
          duration: 3000,
          success: function () {
            if (pageName == "addarticle") {
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 3000)
            }
          }
        })
      }
    }
  })
}

function sendSubscribeMessage(appPage, id, author, title, posttype, api) {
  return new Promise(function (resolve, reject) {
    var data = {};
    var userId = appPage.data.userSession.userId;
    var sessionId = appPage.data.userSession.sessionId;
    data.userid = userId;
    data.sessionid = sessionId;
    data.postid = id;
    data.title = title;
    data.author = author;
    data.posttype = posttype;
    api.sendSubscribeMessage(data).then(res => {
      resolve(res);
    })
  })
}

function getMessageCount(appPage, args, api) {
  var count = '';
  var messagetype = args.messagetype;
  api.getMessageCount(args).then(res => {
    if (res.success) {
      if (messagetype == "all" && res.messagesCount) {
        var _allUnReadCount = res.messagesCount[0].count;
        var allUnReadCount = parseInt(_allUnReadCount);
        //设置未读消息ئەسكەرتىش
        if (appPage.data.pageName == "index") {

          if (_allUnReadCount != "0") {
            wx.showTabBarRedDot({
              index: appPage.data.tabBarRedDotIndex
            })
          } else {
            wx.hideTabBarRedDot({
              index: appPage.data.tabBarRedDotIndex
            })
          }

        }

        appPage.setData({
          allUnReadCount: allUnReadCount
        })
      } else if (messagetype == "alloftype") {
        appPage.setData({
          alloftypeMessageList: res.messagesCount
        })
      }
    }
  })
  wx.stopPullDownRefresh()
}

function getSettings(appPage, api) {
  api.getSettings().then(res => {
    appPage.setData({
      Settings: res.settings
    })
  })
}


function getPhoneNumber(e, apppage, api, Auth) {

  wx.showLoading({
    title: "سەل ساقلاڭ...",
    mask: true
  });
  var result = false;
  if (e.detail.errMsg == "getPhoneNumber:fail user deny") {
    apppage.setData({
      showPopPhone: false
    });
    toast("ھوقۇق بىرىشنى رەت قىلدىڭىز", 2000)
    wx.hideLoading();
    return;

  }
  Auth.getPhoneMumber(apppage, api, e.detail.iv, e.detail.encryptedData).then(res => {
    wx.hideLoading();
    if (res.errcode != 'error') {
      var memberUserInfo = apppage.data.memberUserInfo;
      if (memberUserInfo.phone == "") {
        memberUserInfo.phone = res.phoneinfo.purePhoneNumber;
        apppage.setData({
          memberUserInfo: memberUserInfo
        });
        result = true;
        toast("تېلىفۇن نۇمۇرىنى باغلىدىڭىز" + "," + res.message, 2000)

      } else if (memberUserInfo.phone != "" && res.phoneinfo.purePhoneNumber != memberUserInfo.phone) {
        memberUserInfo.phone = res.phoneinfo.purePhoneNumber;
        apppage.setData({
          memberUserInfo: memberUserInfo
        });
        result = true;
        toast("تېلىفۇن نۇمۇرى يىڭلاندى" + "," + res.message, 2000)

      } else if (memberUserInfo.phone != "" && res.phoneinfo.purePhoneNumber == memberUserInfo.phone) {
        toast("تېلفۇن نۇمۇرى يېڭىلانمىدى", 2000)
      }
    } else {

      toast("نۇمۇرىڭىزغا ئىرىشەلمىدى", 2000)
    }
    apppage.setData({
      showPopPhone: false
    });
    return result;
  })

}

module.exports = {
  loadArticles: loadArticles,
  loadArticleDetail: loadArticleDetail,
  loadCategories: loadCategories,
  loadBBTopics: loadBBTopics,
  loadBBTopic: loadBBTopic,
  postBBTopic: postBBTopic,
  replyBBTopic: replyBBTopic,
  loadComments: loadComments,
  submitComment: submitComment,
  postPayment: postPayment,
  prodcutPayment: prodcutPayment,
  redictDetail: redictDetail,
  postLike: postLike,
  toast: toast,
  copyLink: copyLink,
  gotoWebpage: gotoWebpage,
  creatPoster: creatPoster,
  upLoadImage: upLoadImage,
  upLoadFile: upLoadFile,
  loadPagesDetail: loadPagesDetail,
  getFormField: getFormField,
  loadTags: loadTags,
  creatArticlePoster: creatArticlePoster,
  getNewComments: getNewComments,
  loadReplayTopic: loadReplayTopic,
  getVideo: getVideo,
  getWeibo: getWeibo,
  getToutiao: getToutiao,
  InitializationAudio: InitializationAudio,
  loadAudio: loadAudio,
  playAudio: playAudio,
  userFollow: userFollow,
  loadDetailPending: loadDetailPending,
  loadCommentsPending: loadCommentsPending,
  loadMyfollowAuthorTopics: loadMyfollowAuthorTopics,
  loadAuthorList: loadAuthorList,
  subscribeMessage: subscribeMessage,
  sendSubscribeMessage: sendSubscribeMessage,
  getMessageCount: getMessageCount,
  getSettings: getSettings,
  getPhoneNumber: getPhoneNumber
}