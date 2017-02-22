var path = require('path');
var webpack = require('webpack')

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        app: [ 
            'webpack-dev-server/client?http://0.0.0.0:2001', // WebpackDevServer host and port
            'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
            'babel-polyfill',
            './client/app/app.js',
        ],
        auth: [
            'webpack-dev-server/client?http://0.0.0.0:2001', // WebpackDevServer host and port
            'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
            'babel-polyfill',
            './client/auth/app.js', 
        ],
    },
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js',
        path: path.join(__dirname, 'public'),
        publicPath: '/static/'
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
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                // include: path.join(__dirname, 'client')
            },
            { test: /\.coffee/, loaders: ['coffee-loader'] },
            { test: /\.json/, loaders: ['json'] },
            { test: /\.s?css$/, loaders: ['style', 'css', 'sass'] },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader?name=[path][name]" },
            { test: /\.svg/, loader: "file-loader" }
        ]
    },
    sassLoaders: {
        includePaths: [
            path.resolve(__dirname, './client/scss'),
            path.resolve(__dirname, './public'),
        ]
    },
}
