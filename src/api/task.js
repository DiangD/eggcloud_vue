import request from "@/utils/request"

const qs = require('qs')

export default {
  taskList(params) {
    return request({
      url: '/task/list',
      method: 'get',
      params
    })
  },
  add(params) {
    return request({
      url: '/task/add',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  update(params) {
    return request({
      url: '/task/edit',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  status(params) {
    return request({
      url: '/task/status',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  run(params) {
    return request({
      url: '/task/run',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  deleteTask(params) {
    return request({
      url: '/task/delete',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  }
}
