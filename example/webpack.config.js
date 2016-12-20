var webpack = require('webpack')
var path = require('path')
var autoprefixer = require('autoprefixer')


module.exports = {
    entry: {
        app: __dirname + '/app.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: './',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: 'wapper-css-loader!postcss-loader'
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: function () {
                    return [autoprefixer];
                },
            }
        })
    ]
}
