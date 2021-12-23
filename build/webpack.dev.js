const webpack = require('webpack');
const {merge} = require('webpack-merge');
// const path = require('path');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'development',
  // 开发环境本地启动的服务配置
  devServer: {
    port: 9001,
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    allowedHosts:[
      '.tf56.com',
      'tf56.com'
    ],
    // 接口代理转发
    proxy: [{
        context: ['/testapi'], 
        target: 'https://www.fastmock.site/mock/39fda63262c36091b0d1424433b9d2e1/admin',
        changeOrigin: true,
        secure: false,
        // pathRewrite: { '^/testapi': '' },
      },
      {
        context: [
          '/businessWeb',
          '/scmOmsWeb',
          '/operationPlatform',
          '/antColonyUmsApi',
          '/scmOpAdmin',
        ],
        target: 'http://10.77.1.17',
        // target: 'http://10.50.10.5:8080/',
        changeOrigin: true,
      },
    ],
  },
  plugins: [ new webpack.HotModuleReplacementPlugin()],
  devtool: 'eval-source-map',
  // optimization: {
  //   moduleIds: 'named',
  // },
});
