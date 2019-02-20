import HtmlWebpackPlugin from "html-webpack-plugin"
import path from "path";
import webpack from "webpack";
import ExtractTextPlugin from "extract-text-webpack-plugin";

module.exports = {
    entry: [
      './src/js/main',
      './src/css/main.less'
    ],
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'main.js',
    },
    resolveLoader: {
      modules: ['closure-loader', path.resolve(__dirname, 'node_modules')]
    },
    module: {
      rules: [
        {
          test: /google-closure-library\/closure\/goog\/base/,
          loaders: [
            'imports-loader?this=>{goog:{}}&goog=>this.goog',
            'exports-loader?goog',
          ],
        },
        // Loader for closure library
        {
          test: [/google-closure-library\/closure\/goog\/.*\.js/, /\/closure\/.*\.js$/],
          loader: 'closure-loader',
          options: {
            paths: [
              path.resolve(__dirname, 'node_modules/google-closure-library/closure/goog'),
              path.resolve(__dirname, 'src/js/closure'),
            ],
            es6mode: true,
            watch: false
          },
          exclude: [/google-closure-library\/closure\/goog\/base\.js$/],
        },
        // Loader for project js files
        {
            test: /\/src\/.*\.js/,
            loader: 'babel-loader',
            options: {
                presets: ['env'],
            },
            exclude: [/node_modules/, /test/],
        },
        {
          test: /\.coffee$/,
          loader: 'coffee-loader',
          options: {
            transpile: {
              presets: ['env'],
              sourceMap: true
            }
          }
        },
        {
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            use: [{
                loader: "css-loader"
            }, {
                loader: "less-loader"
            }],
            // use style-loader in development
            fallback: "style-loader"
          })
        },

          // Load images
        { test: /\.jpg/, use: "url-loader?limit=10000&mimetype=image/jpg" },
        { test: /\.gif/, use: "url-loader?limit=10000&mimetype=image/gif" },
        { test: /\.png/, use: "url-loader?limit=10000&mimetype=image/png" },
        { test: /\.svg/, use: "url-loader?limit=10000&mimetype=image/svg" },

        // Load fonts
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.woff[0-9]$/, use: "url-loader?limit=10000&mimetype=application/font-woff" },
        { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: "file-loader" },
      ]
    },
    resolve: {
        modules: [
          "node_modules",
          path.resolve(__dirname, "src/js")
        ],
        extensions: [".coffee", ".js"]
    },
    plugins: [
      new webpack.ProvidePlugin({
        goog: 'google-closure-library/closure/goog/base',
      }),
      new ExtractTextPlugin("main.css"),
      new webpack.ProvidePlugin({
          jQuery: 'jquery',
          $: 'jquery',
          jquery: 'jquery'
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: {
            warnings: false,
            comparisons: false,  // don't optimize comparisons. It causes problems in mapboxgl
        },
      })
    ],
    devtool: 'source-map'
};
