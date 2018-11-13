var webpack = require("webpack");
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const workboxPlugin = require('workbox-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

var port = 3333;

var config = {
  mode: isProd ? 'production' : 'development',
  cache: true,
//  devtool: isTest ? 'inline-source-map' : isProd ? 'source-map' : 'source-map',
  devtool: isTest ? 'inline-source-map' : 'eval',

  entry: {
    app: './app/index.js',
  },
  output: {
    path: __dirname + '/dist/',
    filename: 'scripts/[name].js',
    publicPath: isProd ? './' : 'http://localhost:'+port+'/',
//    chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js',
    chunkFilename: 'scripts/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [
            'lodash',
            '@babel/plugin-syntax-dynamic-import',
          ],
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(woff|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      'node_modules': path.resolve(__dirname,'node_modules'),
      'vue$': 'vue/dist/vue.common.js',
      'vuex$': 'vuex/dist/vuex.common.js',
      'bootstrap-vue$': 'bootstrap-vue/dist/bootstrap-vue.common.js',
    },
  },

  plugins: [
    /*
    new webpack.ProvidePlugin({
    }),
   */
    new HtmlWebpackPlugin({
      template: './app/public/index.html',
      inject: 'body',
    }),
    new VueLoaderPlugin(),
  ],
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    }
  },
}

if( isProd ) {
  config.plugins.push(...[
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
    }),
    /*
    */
    new LodashModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: __dirname + '/app/public'
      },
/**
      {
        from: __dirname + '/node_modules/plotly.js/dist/',
        to: __dirname + '/dist/node_modules/plotly.js/dist/',
      },
*/
    ]),
    new workboxPlugin.GenerateSW({
      cacheId: 'cedar-plot',
      swDest: 'sw.js',
      globDirectory: '.',
      globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
      clientsClaim: true,
      skipWaiting: true,
      /*
      runtimeCaching: [
        {
          urlPattern: new RegExp('/'),
          handler: 'staleWhileRevalidate',
        },
      ]
      */
    }),
  ]);
}

config.devServer = {
  contentBase: './',
  stats: 'minimal',
  port: port,
}

module.exports = config
