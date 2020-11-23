// 获取上一页面实例
export function getPrevPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 2] || {}
}

// 刷新上一页面数据
export function refreshtPrevPage(data = {}) {
  // TODO: 测试发现 onLoad 执行后 computed 值还没更新，所以要延迟一下执行 NND
  const prevPage = getPrevPage()
  // const fn = prevPage[method] // 须前置获取方法：todo 还是会出现未定义
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        prevPage.onLoad && prevPage.onLoad(data)
        resolve(data)
      } catch (r) {
        console.warn('刷新上一页面数据出错：' + r)
        reject(r)
      }
    }, 500)
  })
}