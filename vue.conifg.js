const resolve = dir => require('path').join(__dirname, dir);


module.exports = {
  resolve: {
    alias: {
      '@': resolve('/src')
    }
  },

  // 配置跨域请求
  devServer: {
    port: 8081,
    host: 'localhost',
    open: true,
    https: false,
    proxy: {
      [process.env.BASE_API]: {
        target: 'http://localhost:8088',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    }

  }

}
