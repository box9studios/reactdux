const path = require('path');

const ENVIRONMENT = process.env.NODE_ENV || 'development';

module.exports = {
  entry: './src/index.js',
  mode: ENVIRONMENT,
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },
  output: {
    filename: 'reactdux.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
  },
};