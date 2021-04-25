import router from './router'
import store from './store'
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css'
import {isAuth} from "./utils/auth" // 进度条样式

NProgress.configure({showSpinner: false})

const whiteList = ['/login', '/register', '/s']

function findPath(menuList, to, parentPath) {
  for (let i = 0; i < menuList.length; i++) {
    const menu = menuList[i]
    if (menu.menuType === 1) {
      continue
    }
    if (menu.children && menu.children.length > 0) {
      if (findPath(menu.children, to, menu.path)) {
        return true
      }
    }
    if (parentPath) {
      menu.path = parentPath + '/' + menu.path
    }
    if (menu.path === to) return true
  }
  return false
}

function setMenuList(next, to) {
  if (store.getters.menuList.length === 0) {
    store.dispatch('user/setMenuList').then((res) => {
      const to = window.location.pathname
      if (findPath(res.data, to)) {
        next(window.location.pathname + window.location.search)
      } else {
        if (to.path !== '/s') {
          next(window.location.pathname + window.location.search)
        } else {
          next({path: store.getters.menuList[0].path})
        }
      }
    })
  } else {
    next(to)
  }
}

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  if (isAuth()) {
    if (to.path === '/login' || to.path === '/register') {
      // 登录页面
      // 如果已登录，则重定向到主页
      setMenuList(next, {path: '/'})
      NProgress.done()
    } else {
      const hasUserDetail = store.getters.username
      if (hasUserDetail) {
        // 存在用户信息
        setMenuList(next)
      } else {
        // 不存在用户信息
        try {
          // 获取用户信息
          await store.dispatch('user/getUserInfo')
          setMenuList(next)
        } catch (error) {
          // 删除token，然后转到登录页面重新登录
          await store.dispatch('user/resetToken')
          if (to.path === '/404') {
            to.path = '/'
          }
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      //  没有token但是在白名单中，直接进入
      next()
    } else {
      // 其他没有token重定向到登录页面。
      if (window.location.pathname === '/404') {
        window.location.pathname = '/'
      }
      next(`/login?redirect=${window.location.pathname}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // 完成进度条
  NProgress.done()
})
