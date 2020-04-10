import * as webpack from "webpack";

const config: webpack.Configuration = {
	devtool: 'source-map',
	mode: 'development',
	entry: ['./src/index.ts'],
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
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
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	}
};

export default config;
