var path = require('path')

module.exports = {
  entry: './ext.js',
  output: {
    filename: 'meed-ext.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      { enforce: 'pre', test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/ },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
  },
}
