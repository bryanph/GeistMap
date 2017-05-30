var path = require('path');
var webpack = require('webpack')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var UnusedFilesWebpackPlugin = require("unused-files-webpack-plugin").UnusedFilesWebpackPlugin;

module.exports = {
    // devtool: 'source-map',
    devtool: 'cheap-module-eval-source-map',

    entry: {
        app: [ 
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'react-hot-loader/patch',
            './client/app/app.js',
        ],
        auth: [
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'react-hot-loader/patch',
            './client/auth/app.js', 
        ],
        landing: [
            'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
            'react-hot-loader/patch',
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new UnusedFilesWebpackPlugin({
            pattern: 'client/**/*.*'
        }),
        new webpack.LoaderOptionsPlugin({
            // test: /\.xxx$/, // may apply this only for some modules
            options: {
                sassLoaders: {
                    includePaths: [
                        path.resolve(__dirname, './client/scss'),
                        path.resolve(__dirname, './public'),
                    ]
                }
            }
        })
        // new BundleAnalyzerPlugin({ openAnalyzer: false }),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /(node_modules|bower_components)/,
                // include: path.join(__dirname, 'client')
            },
            { test: /\.json/, loaders: ['json-loader'] },
            { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
            { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader'] },
            { test: /\.png$/, loader: "url-loader?limit=100000" },
            { test: /\.jpg$/, loader: "file-loader?name=[path][name]" },
            { test: /\.svg/, loader: "file-loader" }
        ]
    },
    // TODO: get rid of this shit - 2016-08-09
    resolve: {
        alias: {
            styles: path.join(__dirname, './client/scss') 
        },
    },
}
