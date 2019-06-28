const path = require('path');

const devProxyTarget = 'http://127.0.0.1:8000';

module.exports = {
    publicPath: './',
    outputDir: path.resolve(__dirname, '../static'),
    devServer: {
        proxy: {
            '/fm': {
                target: devProxyTarget
            },
            '/job': {
                target: devProxyTarget
            }
        }
    }
}