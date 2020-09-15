var webpack = require("webpack");
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const workboxPlugin = require('workbox-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest')
let FaviconsWebpackPlugin = require('favicons-webpack-plugin')

var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';

var port = 3311;

var config = {
  mode: isProd ? 'production' : 'development',
  cache: true,
//  devtool: isTest ? 'inline-source-map' : isProd ? 'source-map' : 'source-map',
  devtool: isProd ? 'eval' : 'source-map',

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
          presets: [
            '@babel/preset-env',
          ],
          plugins: [
            'lodash',
            '@babel/plugin-syntax-dynamic-import',
//            '@babel/plugin-transform-runtime',
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
      {
        test: /\.glsl$/,
        use: [
          'raw-loader',
          'glslify-loader',
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
      'glslify': 'glslify/index.js',
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
    new WebpackPwaManifest({
      name: 'cedarPlot',
      short_name: 'cedarPlot',
      description: 'particle plot application',
      theme_color: '#6f6f6f',
      background_color: '#29b63c',
      display: 'standalone',
      inject: true,
      ios: {
        'apple-mobile-web-app-title': 'cedarPlot',
        'apple-mobile-web-app-status-bar-style': 'black'
      },
      icons: [
        {
          src: path.resolve('app/favicon/favicon.png'),
          sizes: [120, 152, 167, 180, 1024],
          destination: path.join('icons', 'ios'),
          ios: true
        },
        {
          src: path.resolve('app/favicon/favicon.png'),
          size: 1024,
          destination: path.join('icons', 'ios'),
          ios: 'startup'
        },
        {
          src: path.resolve('app/favicon/favicon.png'),
          sizes: [36, 48, 72, 96, 144, 192, 512, 1024],
          destination: path.join('icons', 'android')
        },
      ],
    }),
    new FaviconsWebpackPlugin({
      logo: path.resolve(__dirname,'app/favicon/favicon.png'),
      prefix: 'icons-[hash]/',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false
      },
    }),
    new workboxPlugin.GenerateSW({
      cacheId: 'cedar-plot',
      swDest: 'sw.js',
      globDirectory: 'dist',
      globPatterns: [
        '**/*.{js,css,html}',
        '**/*.{png,jpg,svg,ico}',
        'manifest.*.json',
      ],
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: new RegExp('/'),
          handler: 'staleWhileRevalidate',
        },
      ]
      /*
      */
    }),
  ]);
}

config.devServer = {
  contentBase: './',
  stats: 'minimal',
//  stats: 'verbose',
  port: port,
}

module.exports = config
