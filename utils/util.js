/*
 * 
 * 微慕小程序
 * author: jianbo
 * organization:  微慕 www.minapper.com 
 * 技术支持微信号：Jianbo
 * Copyright (c) 2018 https://www.minapper.com All rights reserved.
 */

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function datefomate(time,format) {
  var t = new Date(time*1000);
  var tf = function(i){return (i < 10 ? '0' : '') + i};
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a){
      switch(a){
          case 'yyyy':
              return tf(t.getFullYear());
              break;
          case 'MM':
              return tf(t.getMonth() + 1);
              break;
          case 'mm':
              return tf(t.getMinutes());
              break;
          case 'dd':
              return tf(t.getDate());
              break;
          case 'HH':
              return tf(t.getHours());
              break;
          case 'ss':
              return tf(t.getSeconds());
              break;
      }
  })
    };

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getYear() {
    var date = new Date();
    var year = date.getFullYear(); 
    return year
}  

function  formatDate (dt,fmt) {
  var o = {
      "M+": dt.getMonth() + 1, //月份 
      "d+": dt.getDate(), //日 
      "H+": dt.getHours(), //小时 
      "m+": dt.getMinutes(), //分 
      "s+": dt.getSeconds() //秒 
      // "q+": dt.floor((dt.getMonth() + 3) / 3), //季度 
      // "S": dt.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


function obj2uri(obj) {
  return Object.keys(obj).map(function (k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
  }).join('&');
}


function getDateDiff(dateStr) {    
    var publishTime = Date.parse(dateStr.replace(/-/gi, "/"))/ 1000,
        d_seconds,
        d_minutes,
        d_hours,
        d_days,
        timeNow = parseInt(new Date().getTime() / 1000),
        d,
        date = new Date(publishTime * 1000),
        Y = date.getFullYear(),
        M = date.getMonth() + 1,
        D = date.getDate(),
        H = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
    //小于10的在前面补0
    if (M < 10) {
        M = '0' + M;
    }
    if (D < 10) {
        D = '0' + D;
    }
    if (H < 10) {
        H = '0' + H;
    }
    if (m < 10) {
        m = '0' + m;
    }
    if (s < 10) {
        s = '0' + s;
    }

    d = timeNow - publishTime;
    d_days = parseInt(d / 86400);
    d_hours = parseInt(d / 3600);
    d_minutes = parseInt(d / 60);
    d_seconds = parseInt(d);

    if (d_days > 0 && d_days < 3) {
        return d_days + 'كۈن بۇرۇن';
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + 'سائەت بۇرۇن';
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + 'مېنۇت بۇرۇن';
    } else if (d_seconds < 60) {
        if (d_seconds <= 0) {
            return '';
        } else {
            return d_seconds + 'سېكونىت بۇرۇن';
        }
    } else if (d_days >= 3 && d_days < 30) {
        return M + '-ئاينىڭ' + D +'-كۈنى';
    } else if (d_days >= 30) {
        return Y + '-يىلى' + M + '-ئاينىڭ' + D + '-كۈنى';
    }
}

function getDateOut(dateStr) {
    var publishTime = Date.parse(dateStr.replace(/-/gi, "/")) / 1000; 
    var timeNow = parseInt(new Date().getTime() / 1000);
    var result=false;
    var d = timeNow - publishTime;
    var d_days = parseInt(d / 86400);
    if (d_days > 7) {
        result=true;
    }
    return result;
}

function cutstr(str, len,flag) {
        var str_length = 0;
        var str_len = 0;
        var str_cut = new String();
        var str_len = str.length;
        for (var i = 0; i < str_len; i++) {
            var a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4  
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length >= len) {
              if (flag == 0){
                str_cut = str_cut.concat("...");

              }              
                
                return str_cut;
            }
           
        }
        //如果给定字符串小于指定长度，则返回源字符串；  
        if (str_length < len) {
            return str;
        }
    }

  function removeHTML (s) {
    var str=s.replace(/<\/?.+?>/g,"");    
    str = str.replace(/[\r\n]/g, ""); //去掉回车换行    
    return str.replace(/ /g,"");
  }

  function formatDateTime(s)
  {
    //var str = s.replace("t", " ");
    return s.replace("T", " ");

  }

  var compare = function (prop) {
    return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop]; if (val1 > val2) {
        return -1;
      } else if (val1 < val2) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  /* 
 * 判断图片类型 
 */  
function checkImgType(filePath){  
  if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(filePath)) {
       return false;
  }
  else{
    return true;
  }   
}

// 是否为空对象
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

function CheckImgExists(imgurl) {
  var ImgObj = new Image(); //判断图片是否存在  
  ImgObj.src = imgurl;
  //没有图片，则返回-1  
  if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
    return true;
  } else {
    return false;
  }
}

function GetUrlFileName(url,domain) {    
    var filename = url.substring(url.lastIndexOf("/") + 1);
    if (filename == domain || filename =='')
    {
        filename="index";
    }
    else
    {
        filename = filename.substring(0, filename.lastIndexOf("."));
    }
    
    return filename;
}

function checkSessionExpire(sessionExpire)
{
  var curTime = new Date();
  var expiretime = new Date(Date.parse(sessionExpire));
  return (curTime>expiretime);

}


function json2Form(json) {
    var str = [];
    for (var p in json) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
    }
    return str.join("&");
}

function getymd(dateStr, type) {
    dateStr = dateStr.replace("T", " ");
    var date = new Date(Date.parse(dateStr.replace(/-/g, "/")));
    var mm = date.getMonth() + 1;
    //月
    var dd = date.getDate();
    //日
    var yy = date.getFullYear();
    //年
    if (type == "d") {
        return dd;
    } else if (type == "md") {
        return mm + "-" + dd;
    } else if (type == "ymd") {
        return yy + "-" + mm + "-" + dd;
    }
}

function mapHttpToHttps(rawUrl) {
  if (rawUrl.indexOf(':') < 0) {
      return rawUrl;
  }
  const urlComponent = rawUrl.split(':');
  if (urlComponent.length === 2) {
      if (urlComponent[0] === 'http') {
          urlComponent[0] = 'https';
          return `${urlComponent[0]}:${urlComponent[1]}`;
      }
  }
  return rawUrl;
}

//获取文章的第一个图片地址,如果没有给出默认图片
function getContentFirstImage(content) {
    var regex = /<img.*?src=[\'"](.*?)[\'"].*?>/i;
    var arrReg = regex.exec(content);
  var src = "../../images/uploads/default_image.jpg";
    if (arrReg) {
        src = arrReg[1];
    }
    return src;
}
//获取链接的参数值
function GetQueryString(url,name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var num=url.indexOf("?")
    var url=url.substr(num+1);
     var r = url.match(reg);//search,查询？后面的参数，并匹配正则
     if(r!=null)return  unescape(r[2]); return "";

}

function getUrlInfo(url)
{
  var args={};  
  var qqhttp_m = RegExp(/http\:\/\/m\.v\.qq\.com\/(.*?)\//)
  var qqhttps_m = RegExp(/https\:\/\/m\.v\.qq\.com\/(.*?)\//)
  var qqhttps_pc=RegExp(/https\:\/\/v\.qq\.com\/(.*?)\//)
  var miaopai = RegExp(/http\:\/\/n\.miaopai\.com\/media\/(.*?)\.htm/)
  var douyin = RegExp(/https\:\/\/v\.douyin\.com\/(.*?)\//)
  var weibo= RegExp(/https\:\/\/m\.weibo\.cn\/(.*?)\/(.*?)/);

  var toutiaocdn = RegExp(/https\:\/\/m\.toutiaocdn\.com\/(.*?)/)

  var toutiao_m = RegExp(/https\:\/\/m\.toutiao\.com\/(.*?)/)
  var toutiao_pc = RegExp(/https\:\/\/www\.toutiao\.com\/(.*?)/)

  if(qqhttp_m.exec(url) || qqhttps_m.exec(url))
  {
    args.infoType="video_qq_m";
    args.infoDesc="腾讯视频链接"; 
    args.infoUrl=url;

  }
  else if(qqhttps_pc.exec(url) )
  {
    args.infoType="video_qq_pc";
    args.infoDesc="腾讯视频链接"; 
    args.infoUrl=url;

  }
  else  if (miaopai.exec(url)) {
    args.infoType="video_miaopai";
    args.infoDesc="秒拍视频链接"; 
    args.infoUrl=url;
  }  
  else if (douyin.exec(url)) {
    var douyinID = url.match(/https\:\/\/v\.douyin\.com\/(.*?)\//);
    var douyinUrl = "https://v.douyin.com/" + douyinID[1]+"/"    
    args.infoType="video_douyin";
    args.infoDesc="抖音视频链接"; 
    args.infoUrl=douyinUrl; 

  }
  else  if(weibo.exec(url)) 
  {
    args.infoType="weibo";
    args.infoDesc="微博链接"; 
    args.infoUrl=url;
  }

  // else  if(toutiaocdn.exec(url) || toutiao_m.exec(url) || toutiao_pc.exec(url) ) 
  // {
  //   args.infoType="toutiao";
  //   args.infoDesc="头条链接"; 
  //  // url = url.replace("m.toutiao.com","www.toutiao.com");
  //   args.infoUrl=url;
  // }
  
  
  else {
     args.infoUrl="";
     args.infoType="";
     args.infoDesc="";
  }

  return args;

}

/* 裁剪封面，
   src为本地图片路径或临时文件路径，
   imgW为原图宽度，
   imgH为原图高度，   
*/
function clipImage (src, imgW, imgH,appPage,ctx) { 
  let canvasW = 640, canvasH = imgH;
  if (imgW / imgH > 5 / 4) { // 长宽比大于5:4
    canvasW = imgH * 5 / 4;
  }

  // 将图片绘制到画布
  ctx.drawImage(src, (imgW - canvasW) / 2, 0, canvasW, canvasH, 0, 0, canvasW, canvasH) 
// draw()必须要用到，并且需要在绘制成功后导出图片
 ctx.draw(false, () => {
    setTimeout(() => {
      //  导出图片
      wx.canvasToTempFilePath({
        width: canvasW,
        height: canvasH,
        destWidth: canvasW,
        destHeight: canvasH,
        canvasId: 'mycanvas',
        fileType: 'jpg',
        success: (res) => {
          // res.tempFilePath为导出的图片路径
          var imagePath=res.tempFilePath
          appPage.setData({"shareImagePath":imagePath})
        }
      })
      
    }, 3000);
  })
}

function getExtname(filename){
  if(!filename||typeof filename!='string'){
     return false
  };
  let a = filename.split('').reverse().join('');
  let b = a.substring(0,a.search(/\./)).split('').reverse().join('');
  return b
}

function navigateBack(config) {
  let prevPageData = config.prevPageData
  let delta = config.delta || 1
  if (prevPageData) {
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - (delta + 1)]
    prevPage.setData(config.prevPageData)
  }
  wx.navigateBack(config)
}



module.exports = {
  formatTime: formatTime,
  datefomate:datefomate,
  getDateDiff: getDateDiff,
  cutstr:cutstr,
  removeHTML:removeHTML,
  formatDateTime: formatDateTime,
  compare: compare,
  checkImgType: checkImgType,
  isEmptyObject: isEmptyObject,
  CheckImgExists: CheckImgExists,
  GetUrlFileName: GetUrlFileName,
  json2Form: json2Form,
  getymd: getymd,
  getDateOut:getDateOut,
  getYear:getYear,
  getContentFirstImage: getContentFirstImage,
  checkSessionExpire:checkSessionExpire,
  mapHttpToHttps:mapHttpToHttps,
  clipImage:clipImage,
  GetQueryString:GetQueryString,
  getUrlInfo:getUrlInfo,
  getExtname:getExtname,
  formatDate:formatDate,
  navigateBack:navigateBack
  
  
}

