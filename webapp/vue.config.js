const path = require('path');

module.exports = {
    publicPath: './',
    outputDir: path.resolve(__dirname, '../static'),
    devServer: {
        proxy: {
            '/data': {
                target: 'http://127.0.0.1:8002'
            }
        }
    }
}