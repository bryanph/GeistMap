var path = require('path');
var webpack = require('webpack')

module.exports = {
    // devtool: 'cheap-module-eval-source-map',
    devtool: 'inline-eval-cheap-source-map',

    entry: {
        app: [ 
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'babel-polyfill',
            './client/app/app.js',
        ],
        auth: [
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'babel-polyfill',
            './client/auth/app.js', 
        ],
        landing: [
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'babel-polyfill',
            './client/landing/app.js', 
        ],
    },
    // output: {
    //     path: path.join(__dirname, 'public'),
    //     filename: 'bundle.js',
    //     publicPath: 'http://localhost:3000/static/'
    // },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js',
        path: path.join(__dirname, 'public'),
        publicPath: 'http://localhost:3000/static/'
        // publicPath: '/static/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['react-hot', 'babel-loader'],
                exclude: /(node_modules|bower_components)/,
                // include: path.join(__dirname, 'client')
            },
            // {
            //     test: /(\.js|\.jsx)$/,
            //     loaders: ['react-hot', 'babel-loader'],
            //     include: path.join(__dirname, 'client')
            // },
            { test: /\.coffee/, loaders: ['coffee-loader'] },
            { test: /\.json/, loaders: ['json'] },
            // { test: /\.s?css$/, loaders: ['style', 'css', 'sass'] },
            { test: /\.css$/, loaders: ['style', 'css'] },
            { test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader?name=[path][name]" },
            { test: /\.svg/, loader: "file-loader" }
        ]
    },

  // Tell babel that we want to hot-reload
  babelQuery: {
    presets: ['react-hmre'],
  },
  // TODO: get rid of this shit - 2016-08-09
  resolve: {
        alias: {
            styles: path.join(__dirname, './client/scss') 
        },
    },
  sassLoaders: {
        includePaths: [
            path.resolve(__dirname, './client/scss'),
            path.resolve(__dirname, './public'),
        ]
    },
}
