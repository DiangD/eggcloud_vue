import request from "@/utils/request"

const qs = require('qs')

export default {
  login(params) {
    return request({
      url: 'login',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  register(params) {
    return request({
      url: '/register',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  getVerifyCode(email) {
    return request({
      url: 'verify/code',
      method: 'post',
      params: {
        "email": email
      }
    })
  },
  isExistUsername(username) {
    return request({
      url: 'exist/username',
      method: 'post',
      params: {
        "username": username
      },
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  getUserInfo(userId) {
    return request({
      url: 'u/info',
      method: 'get',
      params: {
        "userId": userId
      }
    })
  },
  logout() {
    return request({
      url: 'logout',
      method: 'get',
    })
  },
  renewPassword(params) {
    return request({
      url: 'u/pwd',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  updateUserInfo(params) {
    return request({
      url: 'u/update',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
}
