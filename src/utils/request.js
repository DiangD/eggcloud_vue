import axios from "axios";
import {MessageBox, Message} from 'element-ui'
import {getToken, removeToken, removeUserId} from "@/utils/auth";


const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 50000,
})

service.interceptors.request.use(config => {
    if (getToken() && getToken() !== '') {
      config.headers.Authorization = getToken()
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = Object.prototype.toString.call(response.data) === "[object String]" ? JSON.parse(response.data) : response.data;
    if (res.status !== 200) {
      switch (res.status) {
        case 5000: {
          Message({
            message: res.message || '服务器开小差了...',
            type: "warning",
            duration: 2 * 1000
          })
          break
        }
        case 4004: {
          setTimeout(function () {
            MessageBox.confirm('当前账号未登录，请进行登录', 'Hi', {
              confirmButtonText: '前往登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              removeToken()
              removeUserId()
              location.replace('/')
            })
          }, 200)
          break
        }
        case 3000: {
          setTimeout(function () {
            MessageBox.confirm('Token已过期，请重新登录', '确认登出', {
              confirmButtonText: '重新登录',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              removeToken()
              removeUserId()
              location.replace('/')
            })
          }, 200)
          break
        }
        default: {
          let message = ''
          if (res.message) {
            message = res.message.toString()
          }
          if (message !== 'true') {
            Message({
              message: res.message,
              type: 'warning',
              duration: 1000
            })
          }
          break
        }
      }
      return Promise.reject()
    } else {
      // let message = ''
      // if (res.message) {
      //   message = res.message.toString()
      // }
      // if (message !== 'true') {
      //   Message({
      //     message: res.message,
      //     type: 'success',
      //     duration: 1000
      //   })
      // }
      return res
    }
  },
  error => {
    Message({
      message: '哎呀！服务器出错了，请稍后再试！',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
