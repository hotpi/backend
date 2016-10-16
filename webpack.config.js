var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var nodeModules = {};

// note the path.resolve(__dirname, ...) part
// without it, eslint-import-resolver-webpack fails
// since eslint might be invoked with different cwd
// fs.readdirSync(path.resolve(__dirname, 'node_modules'))
//     .filter(x => ['.bin'].indexOf(x) === -1)
//     .forEach(mod => { nodeModules[mod] = `commonjs ${mod}`; });

fs.readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;    
    });

module.exports =

{
    // The configuration for the server-side rendering
    name: 'server',
    target: 'node',
    entry: [
      /*'webpack/hot/poll?1000',*/
      './index'
    ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'backend.js',
        publicPath: '/static/'
    },
    externals: nodeModules,
    module: {
        loaders: [
            { 
              test: /\.js$/,
              loader: 'babel'
            },
            { 
              test: /\.json$/,
              loader: 'json-loader'
            },
        ]
    },
    plugins: [
      new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
    ],
    devtool: 'sourcemap'
};