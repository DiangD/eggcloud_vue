import request from "@/utils/request";

const qs = require('qs')

export default {
  menuTree(params) {
    return request({
      url: '/u/menus',
      method: 'get',
      params
    })
  }
}
