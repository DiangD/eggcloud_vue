import moment from "moment/moment";

/**
 * formatSize
 * @param {*} size
 */
export function formatSize(size) {
  if (size === 0) {
    return '-'
  } else if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + 'k'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(1) + 'M'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(1) + 'G'
  }
}

/***
 * 计算字符串长度(英文占1个字符，中文汉字占2个字符)
 * @param str
 * @returns {number}
 */
export function strLength(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
}

/***
 * 截取字符串前n位
 * @param str
 * @param n
 * @returns {string}
 */
export function substring(str, n) {
  let len = 0;
  let res = '';
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
    if (len <= n) {
      res += str[i];
    }
  }
  return res;
}

/**
 * @param {string} modifyAt
 * @returns {string}
 */
export function formatTime(modifyAt) {
  const diff = moment().unix() - moment(modifyAt).unix()
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return parseInt(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return parseInt(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 30) {
    return parseInt(diff / (3600 * 24)) + '天前'
  } else if (diff <= 3600 * 24 * 30 * 12) {
    return parseInt(diff / (3600 * 24 * 30)) + '个月前'
  } else {
    return parseInt(diff / (3600 * 24 * 30 * 12)) + '年前'
  }
}

export function formatExpireAt(expireAt) {
  const diff = moment(expireAt).unix() - moment().unix()
  if (diff < 60) {
    return '马上失效'
  } else if (diff < 3600) {
    // less 1 hour
    return parseInt(diff / 60) + '分钟'
  } else if (diff < 3600 * 24) {
    return parseInt(diff / 3600) + '小时'
  } else if (diff < 3600 * 24 * 30) {
    return parseInt(diff / (3600 * 24)) + '天'
  } else if (diff <= 3600 * 24 * 30 * 12) {
    return parseInt(diff / (3600 * 24 * 30)) + '个月'
  } else {
    return parseInt(diff / (3600 * 24 * 30 * 12)) + '年'
  }
}
