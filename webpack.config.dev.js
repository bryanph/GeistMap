var path = require('path');
var webpack = require('webpack')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var UnusedFilesWebpackPlugin = require("unused-files-webpack-plugin").UnusedFilesWebpackPlugin;

module.exports = {
    // devtool: 'source-map',
    devtool: 'cheap-module-source-map',

    entry: {
        app: [ 
            'webpack-dev-server/client?http://localhost:3000',
            'react-hot-loader/patch',
            './client/app/app.js',
        ],
        auth: [
            'webpack-dev-server/client?http://localhost:3000',
            'react-hot-loader/patch',
            './client/auth/app.js', 
        ],
        landing: [
            'webpack-dev-server/client?http://localhost:3000',
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
            pattern: 'client/**/*.*',
            globOptions: {
                ignore: [ "node_modules/**/*","client/**/*.test.js", '**/test/*' ]
            }
        }),
        new webpack.LoaderOptionsPlugin({
            // test: /\.xxx$/, // may apply this only for some modules
            options: {
                context: '/',
                sassLoader: {
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
			{ test: /\.(png|jpg)$/, loader: 'file-loader?name=images/[name].[hash].[ext]' },
			{ test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'},
			{ test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,loader: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/font-woff'},
			{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=fonts/[name].[hash].[ext]&mimetype=application/octet-stream'},
			{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=fonts/[name].[hash].[ext]'},
			{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=images/[name].[hash].[ext]&mimetype=image/svg+xml' }

        ]
    },
    resolve: {
        alias: {
            styles: path.join(__dirname, './client/scss'),
            util: path.join(__dirname, './client/util'),
            QueryLink: path.join(__dirname, './client/util/QueryLink.js'),
            // 'draft-js': path.resolve(__dirname, './repos/draft-js')
        },
    },
}
