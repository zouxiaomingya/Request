const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const resolve = (...arg) => path.join(__dirname, ...arg);
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: resolve('dist'),//定位，输出文件的目标路径
    filename: '[name].js' //文件名[name].js默认，也可自行配置
  },
  // devtool:'source-map',
  devServer:{
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        pathRewrite: {"^/api" : ""}
      }
    }
  },
  plugins:[
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // // css 单独打包的插件
    // new MiniCssExtractPlugin({
    //   filename: "[name].css",
    //   chunkFilename: "[id].css"
    // })
  ],
  module: {
    rules:[
      {
        test: /\.(js|jsx)$/,
        use:[
          {
            loader:"babel-loader",
            options: {
              presets:[
                '@babel/preset-react',
                '@babel/preset-env',
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader','css-loader'],
      },
      { 
        test: /\.less$/, 
        use: ['style-loader', {
          loader:'css-loader',
          options: {
            modules: true
          }
        }, 'less-loader']
      }
    ]
  },
  resolve: {
    // 设置别名
    alias: {
      '@': resolve('src'),
    },
    // 文件后缀补全
    extensions: ['.js', '.jsx'],
    mainFiles :["index"],
  },

}