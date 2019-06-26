const path = require('path');

module.exports = {
    publicPath: './',
    outputDir: path.resolve(__dirname, '../static'),
    devServer: {
        proxy: {
            '/data': {
                target: 'http://192.168.2.197:8000'
            }
        }
    }
}