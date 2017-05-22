var path = require('path');
var webpack = require('webpack')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        landing: [
            'babel-polyfill',
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
        // new webpack.optimize.UglifyJsPlugin({
        //     compressor: {
        //         warnings: false
        //     }
        // })
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        // new BundleAnalyzerPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                // include: path.join(__dirname, 'client')
            },
            // {
            //     test: /(\.js|\.jsx)$/,
            //     loaders: ['react-hot', 'babel-loader'],
            //     include: path.join(__dirname, 'client')
            // },
            { test: /\.json/, loaders: ['json-loader'] },
            // { test: /\.s?css$/, loaders: ['style', 'css', 'sass'] },
            { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
            { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader'] },
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
