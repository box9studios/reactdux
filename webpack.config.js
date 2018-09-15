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
    path: `${__dirname}dist`,
    filename: 'index.js',
  },
};