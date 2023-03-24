/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					ie8: false,
					safari10: false,
					mangle: false,
					compress: {
						unsafe: true,
					},
					mangle: true,
					keep_fnames: true,
					keep_classnames: true,
				},
			}),
		],
	},
	context: path.resolve("__dirname", "../"),
	resolve: {
		extensions: ["", ".webpack.js", ".web.js", ".js"],
	},
	entry: {
		sshnake: "../client/src/index.js",
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "../client/public"),
	},
	module: {
		rules: [
			// All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, "src", "client")],
				use: [
					{
						loader: "babel-loader",
						options: {
							plugins: [["import", { libraryName: "antd", style: true }, "antd"]],
						},
					},
				],
			},
		],
	},
};
