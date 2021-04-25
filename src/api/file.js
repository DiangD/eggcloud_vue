import request from '@/utils/request'

const qs = require('qs')

export default {
  // 文件列表
  fileList: function (params) {
    return request({
      url: 'ff/page',
      method: 'get',
      params
    })
  },
  //获取dir path
  folderPrePath: function (params) {
    return request({
      url: 'ff/pre/dir',
      method: 'get',
      params
    })
  },
  rename: function (params) {
    return request({
      url: 'ff/rename',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  newFolder(params) {
    return request({
      url: 'folder/new',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  deleteFiles(params) {
    return request({
      url: 'ff/delete',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  queryFolderTree: function (params) {
    return request({
      url: 'folder/tree',
      method: 'get',
      params
    })
  },
  move: function (params) {
    return request({
      url: 'ff/move',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  copy: function (params) {
    return request({
      url: 'ff/copy',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  //查找文件
  searchFile: function (params) {
    return request({
      url: 'ff/search',
      method: 'get',
      params
    })
  },

  //todo
  searchFileAndOpenDir: function (params) {
    return request({
      url: 'ff/search/open',
      method: 'get',
      params
    })
  },
  share: function (params) {
    return request({
      url: 's/create',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params)
      }
    })
  },
  shareList: function (params) {
    return request({
      url: 's/list',
      method: 'get',
      params
    })
  },
  cancelShare: function (params) {
    return request({
      url: 's/cancel',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  deletedFileList: function (params) {
    return request({
      url: 'ff/trash/list',
      method: 'get',
      params
    })
  },
  removeFile: function (params) {
    return request({
      url: 'ff/remove',
      method: 'delete',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  restoreFile: function (params) {
    return request({
      url: 'ff/restore',
      method: 'post',
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  },
  accessShare: function (params) {
    return request({
      url: 's/public',
      method: 'get',
      params,
    })
  },
  accessShareOpenDir: function (params) {
    return request({
      url: 's/public/dir',
      method: 'get',
      params
    })
  }
}
