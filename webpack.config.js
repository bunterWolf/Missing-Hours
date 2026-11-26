const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { Compilation, sources } = require('webpack');

// Inter is bundled (no font CDN, see src/styles/base.css). Its licence, the SIL Open Font
// License 1.1, has to travel with the font files, so it is written next to them.
const INTER_LICENSE = require.resolve('@fontsource/inter/LICENSE');

class InterLicensePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('InterLicensePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'InterLicensePlugin', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          compilation.emitAsset('assets/fonts/Inter-LICENSE.txt', new sources.RawSource(fs.readFileSync(INTER_LICENSE)));
        }
      );
    });
  }
}

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        // Extracted to styles.css (not injected <style> tags), so the CSP can allow styles from 'self' only
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(svg|png)$/,
        type: 'asset/resource',
        generator: { filename: 'assets/[name][ext]' }
      },
      {
        test: /\.(woff2?)$/,
        type: 'asset/resource',
        generator: { filename: 'assets/fonts/[name][ext]' }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new InterLicensePlugin(),
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devtool: 'source-map'
}; 