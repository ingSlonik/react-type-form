/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [ "style-loader", "css-loader", "sass-loader" ],
            },
        ],
    },
    mode: "development",
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "examples"),
    },
    devServer: {
        contentBase: path.join(__dirname, "examples"),
    },
};
