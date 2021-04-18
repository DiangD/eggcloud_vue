import userApi from '@/api/user'
import menuApi from '@/api/menu'
import {getToken, getUserId, removeToken, removeUserId, setToken, setUserId} from "@/utils/auth";
import router, {resetRouter} from "@/router";
import Layout from '@/layout'
import ParentView from '@/components/ParentView'

const getDefaultState = () => {
  return {
    userId: getUserId(),
    token: getToken(),
    userDetail: {},
    avatar: '',
    username: '',
    nickname: '',
    menuList: []
  }
}

const state = getDefaultState()

const mutations = {
  clearState: (state) => {
    Object.assign(state, getDefaultState())
  },
  setUserId: (state, userId) => {
    state.userId = userId
  },
  setToken: (state, token) => {
    state.token = token
  },
  setUserDetail: (state, userDetail) => {
    state.userDetail = userDetail
  },
  setAvatar: (state, avatar) => {
    state.avatar = avatar
  },
  setUsername: (state, username) => {
    state.username = username
  },
  setNickname: (state, nickname) => {
    state.nickname = nickname
  },
  setMenuList: (state, menuList) => {
    state.menuList = menuList
  }
}

const actions = {
  async setMenuList({commit, state}) {
    return new Promise(((resolve, reject) => {
      menuApi.menuTree({userId: state.userId}).then((res) => {
        state.menuList = getMenuTree(res.data)
        commit('setMenuList', state.menuList)
        resetRouter(state.menuList)
        router.options.routes = router.options.routes.concat(state.menuList);
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    }))
  },

  login({commit}, loginInfo) {
    return new Promise((resolve, reject) => {
      userApi.login(loginInfo).then(resp => {
        const {data} = resp
        commit('setToken', data.token)
        setToken(data.token)
        commit('setUserId', data.user.userId)
        setUserId(data.user.userId)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getUserInfo({commit, state}) {
    return new Promise((resolve, reject) => {
      userApi.getUserInfo(getUserId()).then(resp => {
        const {data} = resp
        if (!data) {
        }
        const {userId, avatar, username, nickname} = data
        commit('setUserId', userId)
        commit('setAvatar', avatar)
        commit('setUsername', username)
        commit('setNickname', nickname)
        commit('setUserDetail', data)
        sessionStorage.setItem('store', JSON.stringify(state))
        resolve(data)
      })
    })
  },

  logout({commit, state}) {
    return new Promise((resolve, reject) => {
      userApi.logout().then(() => {
        removeToken()
        removeUserId()
        resetRouter()
        commit('clearState')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  resetToken({commit}) {
    return new Promise(resolve => {
      removeToken()
      removeUserId()
      commit('clearState')
      resolve()
    })
  }
}

function findChildren(childrenMenu) {
  let children = []
  childrenMenu = childrenMenu.filter(menu => menu.menuType !== 1)
  childrenMenu.forEach(menu => {
    let router = {
      path: menu.path,
      name: menu.name,
      component: !menu.component || menu.component.length === 0 ? ParentView : loadView(menu.component),
      meta: {title: menu.name, icon: menu.icon, menuType: menu.menuType},
      hidden: menu.hide,
      menuType: menu.menuType
    }
    if (menu.children && menu.children.length) {
      if (!menu.component || menu.component.length === 0) {
        router.children = findChildren(menu.children)
      }
    }
    children = children.concat(router)
  })
  return children;
}

function getMenuTree(menuList) {
  menuList = menuList.filter(menu => menu.menuType !== 1)
  return menuList.map(menu => {
    let router = {}
    if (menu.children && menu.children.length) {
      router.meta = {title: menu.name, icon: menu.icon, menuType: menu.menuType}
      router.hidden = menu.hide
      router.children = findChildren(menu.children)
    }
    if (menu.component && menu.component.length > 0) {
      router.children = [
        {
          path: '',
          name: menu.name,
          component: loadView(menu.component),
          meta: {title: menu.name, icon: menu.icon, menuType: menu.menuType},
          hidden: menu.hide
        }
      ]
    }
    router.path = menu.path
    router.component = Layout
    router.menuType = menu.menuType
    return router
  })
}

export const loadView = (view) => {
  return (resolve) => require([`@/views${view}`], resolve)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
