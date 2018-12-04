const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'index.ts'),
  output: {
    filename: 'ucc-js-dom.min.js',
    path: path.join(__dirname, 'dist'),
    library: 'UCCJSDOM',
    libraryTarget: 'umd',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?|tsx?$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
};
