const path = require("path");
const webpack = require("webpack");

const CopyrightNotice = `Copyright (c) Jayly. All rights reserved.
Licensed under the Apache License, Version 2.0.
The LICENSE file in the root directory of this source tree.`;
const filename = "Main.js";

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: "./src/Main.ts",
  devtool: "source-map",
  mode: "production",
  target: ["es2020"],
  // ------ ^
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new webpack.BannerPlugin(CopyrightNotice),
    new webpack.SourceMapDevToolPlugin({
      filename: filename + '.map',
      moduleFilenameTemplate: '[absolute-resource-path]',
    }),
  ],
  optimization: {
    minimize: false,
  },
  output: {
    filename: filename,
    path: path.resolve(__dirname, "behavior_pack/scripts"),
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true,
  },
  externalsType: "module",
  externals: {
    "@minecraft/server": "@minecraft/server",
    "@minecraft/server-ui": "@minecraft/server-ui",
    "@minecraft/server-net": "@minecraft/server-net",
    "@minecraft/server-admin": "@minecraft/server-admin",
    "@minecraft/server-editor": "@minecraft/server-editor",
    "@minecraft/server-gametest": "@minecraft/server-gametest",
    "@minecraft/server-editor-bindings": "@minecraft/server-editor-bindings",
  },
};
