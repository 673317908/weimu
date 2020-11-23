//  * 微慕小程序
//  * author: jianbo
//  * organization:  微慕 www.minapper.com 
//  * 技术支持微信号：Jianbo
//  * Copyright (c) 2018 https://www.minapper.com All rights reserved.


// 配置域名
// 如果wordpress没有安装在网站根目录请加上目录路径,例如："www.minapper.com/blog"
const getDomain = "haobalang.cn";
//显示小红点的tabbar的位置，第一个用0，第二个用1 以此类推。
const getTabBarRedDotIndex=3

// 默认文章列表样式：1 左图 2 右图 3 大图 4 多图 5 瀑布流 6 无图
const articleStyle = 4


export default {
  getDomain,
  getTabBarRedDotIndex,
  articleStyle
}