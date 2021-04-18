import request from '@/utils/request'

const qs = require('qs')

export default {
  storeDetail: function (params) {
    return request({
      url: 'u/store',
      method: 'get',
      params
    })
  }
}
