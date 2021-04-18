import Cookies from 'js-cookie'

const tokenKey = 'eggcloud_token'
const userIdKey = 'userId'


export function getToken() {
  return Cookies.get(tokenKey)
}

export function setToken(token) {
  return Cookies.set(tokenKey, token)
}

export function removeToken() {
  return Cookies.remove(tokenKey)
}

export function getUserId() {
  return Cookies.get(userIdKey)
}

export function setUserId(userId) {
  return Cookies.set(userIdKey, userId)
}

export function removeUserId() {
  return Cookies.remove(userIdKey)
}

export function isAuth() {
  return getToken() && getToken() !== '' && getUserId() && getUserId() !== ''
}


