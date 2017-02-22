var path = require('path');
var webpack = require('webpack')

module.exports = {
    devtool: 'source-map',
    entry: {
        app: [
            'babel-polyfill',
            './client/app/app.js',
        ],
        auth: [
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
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
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
            { test: /\.jpg$/, loader: "file-loader" },
            { test: /\.svg/, loader: "file-loader" }
        ]
    },
    sassLoaders: {
        includePaths: [
            path.resolve(__dirname, './client/scss'),
            path.resolve(__dirname, './public'),
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}
