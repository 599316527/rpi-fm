const path = require('path');

const devProxyTarget = 'http://192.168.2.197:8000';

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
            },
            '/player': {
                target: devProxyTarget
            }
        }
    }
}