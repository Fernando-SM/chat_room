const { defineConfig } = require('@vue/cli-service')
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5030', // Backend (servidor Express)
        changeOrigin: true,
        pathRewrite: { '^/api': '' }, // Omitir '/api' si no existe en el backend
      },
    },
  },
};
