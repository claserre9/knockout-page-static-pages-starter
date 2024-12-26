import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import autoprefixer from "autoprefixer";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
	const isProduction = argv.mode === "production";

	const paths = {
		src: path.resolve(__dirname, "src"),
		public: path.resolve(__dirname, "public"),
		output: path.resolve(__dirname, "dist"),
	};

	return {
		entry: {
			app: path.join(paths.src, "index.ts"),
		},

		mode: isProduction ? "production" : "development",

		devtool: isProduction ? false : "source-map",
		cache: {
			type: "filesystem",
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: {
						loader: "ts-loader",
						options: {
							configFile: isProduction
								? "tsconfig.prod.json"
								: "tsconfig.dev.json",
						},
					},
					exclude: /node_modules/,
				},
				{
					test: /\.(scss|css)$/,
					use: [
						isProduction ? MiniCssExtractPlugin.loader : "style-loader",
						{
							loader: "css-loader",
							options: {
								importLoaders: 1,
								sourceMap: !isProduction,
							},
						},
						{
							loader: "postcss-loader",
							options: {
								sourceMap: !isProduction,
								postcssOptions: {
									plugins: [autoprefixer()],
								},
							},
						},
						"sass-loader",
					],
				},
			],
		},
		resolve: {
			extensions: [".ts", ".js"],
		},
		output: {
			filename: isProduction ? "[name].[contenthash].js" : "[name].js",
			path: paths.output,
			publicPath: "/",
			clean: true,
		},
		optimization: {
			minimize: isProduction,
			minimizer: [
				new CssMinimizerPlugin(),
				new TerserPlugin({
					terserOptions: {
						compress: {
							drop_console: true,
							drop_debugger: true,
							passes: 2,
							pure_funcs: ["console.info", "console.debug"],
						},
						mangle: true,
						output: {
							comments: false,
						},
					},
					extractComments: false,
					parallel: true,
				}),
			],
			splitChunks: {
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: "vendors",
						chunks: "all",
					},
				},
			},
			runtimeChunk: "single",
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: path.join(paths.src, "index.html"),
				filename: "index.html",
				minify: isProduction
					? {
						collapseWhitespace: true,
						removeComments: true,
						removeRedundantAttributes: true,
						useShortDoctype: true,
						removeEmptyAttributes: true,
						removeStyleLinkTypeAttributes: true,
						keepClosingSlash: true,
						minifyJS: true,
						minifyCSS: true,
					}
					: false,
			}),
			new MiniCssExtractPlugin({
				filename: isProduction
					? "css/[name].[contenthash].css"
					: "css/[name].css",
			}),
		],
		devServer: {
			static: {
				directory: paths.public,
			},
			port: 8081,
			compress: true,
			open: true,
			historyApiFallback: true,
		},
		stats: {
			warnings: false,
		},

		performance: {
			hints: isProduction ? "warning" : false,
		},
	};
};