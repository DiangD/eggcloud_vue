import request from "@/utils/request";

const qs = require('qs')

export default {
  menuTree(params) {
    return request({
      url: '/u/menus',
      method: 'get',
      params
    })
  },
  menuList(params) {
    return request({
      url: '/menu/list',
      method: 'get',
      params
    })
  },
  allMenu(params) {
    return request({
      url: '/menu/all',
      method: 'get',
      params
    })
  },
  add(params) {
    return request({
      url: '/menu/add',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  update(params) {
    return request({
      url: '/menu/edit',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  delete(params) {
    return request({
      url: '/menu/delete',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  permissions(params) {
    return request({
      url: '/menu/permission',
      method: 'get',
      params
    })
  }
}
