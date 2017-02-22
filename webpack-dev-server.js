var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config.dev');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  headers: { 'Access-Control-Allow-Origin': '*' },
}).listen(2001, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Webpack dev server listening on port 2001');
});
