const path = require('path');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
};