import * as webpack from "webpack";

const config: webpack.Configuration = {
	devtool: 'source-map',
	mode: 'development',
	entry: ['./src/index.ts'],
	output: {
		path: __dirname + '/dist',
		publicPath: './',
		filename: 'main.js'
	},
	devServer: {
		contentBase: './dist'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader'
				}
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name]-[hash].[ext]'
						}
					}
				]
			},
			{
				test: /\.(wav|mp3|ogg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'sounds/[name]-[hash].[ext]'
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	}
};

export default config;