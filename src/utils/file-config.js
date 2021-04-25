import fileApi from '@/api/file'

export default {
  baseUrl: '/api',

  previewUrl: function (userId, file, token) {
    if (token) {
      return `${this.baseUrl}/preview/${userId}/${file.id}/${file.name}?token=${token}`
    }
    return `${this.baseUrl}/preview/${userId}/${file.id}/${file.name}`
  },

  preview: function (userId, file, token) {
    let url = this.previewUrl(userId, file, token)
    window.open(url, '_blank')
  },

  thumbnailUrl: function (userId, file, token) {
    let fileId = ''
    if (!file.id) {
      fileId = file.fileId
    } else {
      fileId = file.id
    }

    if (token) {
      return `${this.baseUrl}/thumbnail/${userId}/${fileId}?token=${token}`
    }
    return `${this.baseUrl}/thumbnail/${userId}/${fileId}`
  },

  publicThumbnailUrl: function (accessKey, file) {
    return `${this.baseUrl}/public/thumbnail/${accessKey}/${file.id}`
  },

  download: function (userId, file, token) {
    const url = `${this.baseUrl}/ff/download/${userId}/${file.id}?token=${token}`
    window.open(url, '_self')
  },

  packageDownload: function (userId, fileIds, token) {
    let url = `${this.baseUrl}/ff/packageDownload?userId=${userId}&fileIds=${fileIds}&token=${token}`
    window.open(url, '_self')
  },

  publicDownloadUrl: function (accessKey, file) {
    return window.location.origin +`${this.baseUrl}/s/public/download?accessKey=${accessKey}&fileId=${file.id}`
  },
  publicDownload: function (accessKey, file) {
    let url = this.publicDownloadUrl(accessKey, file);
    window.open(url, '_self')
  },
  publicPackageDownloadUrl: function (accessKey, fileIds) {
    return window.location.origin +`${this.baseUrl}/s/public/packageDownload?accessKey=${accessKey}&fileIds=${fileIds}`
  },

  publicPackageDownload: function (accessKey, fileIds) {
    let url = this.publicPackageDownloadUrl(accessKey,fileIds)
    window.open(url, '_self')
  },
  publicPreviewUrl:function (accessKey,fileId) {
    return `${this.baseUrl}/public/preview?accessKey=${accessKey}&fileId=${fileId}`
  }
}
