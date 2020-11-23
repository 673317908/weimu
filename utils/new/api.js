import http from './http'
import config from '../config.js'

const domain = config.getDomain
const wp = `https://${domain}/wp-json/wp/v2/`
const wm = `https://${domain}/wp-json/minapper/v1/`


// ===================================================== 用户
//用户登录|post
export const login = params => http.post(`${wm}users/login`, params)

//获取会员信息|get
export const getMemberUserInfo = params => http.get(`${wm}users/session`, params)

//获取用户信息|get (参数：userid sessionid)
export const getUserInfo = params => http.get(`${wm}users/${params.id}`, params)

//更新信息|get (参数：userid sessionid)
export const updateSession = params => http.get(`${wm}users/updatesession`, params)

// ===================================================== 小店
// 精选、热门和轮播商品|get
export const getShopSetting = params => http.get(`${wm}shop/setting`, params)

// 订单列表|get
export const getOrderList = params => http.get(`${wm}shop/orders`, params)

// 订单详情|get
export const getOrderDetail = params => http.get(`${wm}shop/orders/${params.id}`, params)

// 快递公司列表|get
export const getExpressList = params => http.get(`${wm}shop/companys`, params)

// 订单发货|post
export const submitDeliver = params => http.post(`${wm}shop/orders/senddelivery`, params)

// 商品分类|get
export const getGoodsCate = params => http.get(`${wm}shop/products/cate`, params)

// 商品列表|get
export const getGoodsList = params => http.get(`${wm}shop/products`, params)

// 优惠券列表|get
export const getCouponList = params => http.get(`${wm}shop/coupons`, params)

// 领取优惠券|post
export const pullPushCoupon = params => http.post(`${wm}shop/coupons/pullpush`, params)

// ===================================================== 文章详情
// 阅读获取积分|get
export const getReadPoints = params => http.get(`${wm}posts/readpostintegral`, params)