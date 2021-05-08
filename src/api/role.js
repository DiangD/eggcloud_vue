import request from "@/utils/request"

const qs = require('qs')

export default {
  roleList(params) {
    return request({
      url: '/role/list',
      method: 'get',
      params
    })
  },
  add(params) {
    return request({
      url: '/role/add',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  update(params) {
    return request({
      url: '/role/edit',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  delete(params) {
    return request({
      url: '/role/delete',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  }
}
