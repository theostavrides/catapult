const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    publicPath: '/catapult/',
    filename: '[name].js',
    chunkFilename: '[name].js?cacheBust=[chunkhash]',
  }
}); 