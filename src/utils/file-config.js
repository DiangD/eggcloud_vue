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

  download: function (userId, file, token) {
    const url = `${this.baseUrl}/ff/download/${userId}/${file.id}?token=${token}`
    window.open(url, '_self')
  },

  packageDownload: function (userId, fileIds, token) {
    let url = `${this.baseUrl}/ff/packageDownload?userId=${userId}&fileIds=${fileIds}&token=${token}`
    window.open(url, '_self')
  },

  publicDownloadUrl: function (accessKey) {
    return `${this.baseUrl}/s/public/download/${accessKey}}`
  },
  publicDownload: function (accessKey, file) {
    let url = this.publicDownloadUrl(accessKey);
    window.open(url, '_self')
  }
}
