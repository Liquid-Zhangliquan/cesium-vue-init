const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const cesiumBuild = './node_modules/cesium/Build/Cesium';
module.exports = {
  publicPath: './',
  devServer: {
    open: true
  },
  lintOnSave: false,
  productionSourceMap: true,
  chainWebpack: config => {
    config.performance.set('hints', false);
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{ from: path.join(__dirname, cesiumBuild), to: 'Cesium' }]),
    ],
    module: {
      rules: [
      ],
    },
  },
}
