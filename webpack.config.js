var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });
//console.log(nodeModules);

module.exports = {
  entry: ['babel-polyfill', './src/main.js'],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  debug: true,
  node: {
    fs: "empty",
    child_process: "empty"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  },
  externals: nodeModules
/*
  externals: {
    sqlite3: 'commonjs sqlite3',
  }
*/
};
