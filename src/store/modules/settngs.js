import defaultSettings from '@/settings'

const {showSettings, fixedHeader, sidebarLogo} = defaultSettings

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo
}

const mutations = {
  changeSetting: (state, {key, value}) => {
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({commit}, data) {
    commit('changeSetting', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
