var path = require('path');
var webpack = require('webpack')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: "production",
    devtool: 'source-map',
    entry: {
        app: [ 
            './client/app/app.js',
        ],
        auth: [
            './client/auth/app.js', 
        ],
        landing: [
            './client/landing/app.js', 
        ],
    },
    output: {
        filename: '[name].[hash].bundle.js',
        chunkFilename: '[id].[hash].bundle.js',
        path: path.join(__dirname, 'public'),
        publicPath: '/static/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        function() {
            this.plugin("done", function(stats) {
                require("fs").writeFileSync(
                    path.join(__dirname, "stats.json"),
                    JSON.stringify(stats.toJson()));
            });
        },
        new webpack.LoaderOptionsPlugin({
            options: {
                sassLoaders: {
                    includePaths: [
                        path.resolve(__dirname, './client/scss'),
                        path.resolve(__dirname, './public'),
                    ]
                }
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
        // new BundleAnalyzerPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                exclude: /(node_modules|bower_components)/,
                // include: path.join(__dirname, 'client')
            },
            { test: /\.json/, loaders: ['json-loader'] },
            { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }, {
                    loader: "sass-loader",
                    options: {
                        includePaths: [
                            path.resolve(__dirname, './client/scss'),
                            path.resolve(__dirname, './public'),
                        ]
                    }
                }]
            },
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
        },
    },
}
