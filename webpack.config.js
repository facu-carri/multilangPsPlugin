const path = require('path')

const config = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: './main.js',
        pathinfo: true,
    },
    resolve: {
        extensions: [".js"],
    },
}
module.exports = config