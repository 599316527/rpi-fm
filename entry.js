


const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const schedule = require('./lib/schedule');

let app = new Koa();
app.use(koaBody({jsonLimit: '50kb'}));
app.use(koaStatic(path.join(__dirname, 'static')));

['data'].forEach(function (routerName) {
    let router = require(path.join(__dirname, 'routers', routerName));
    app.use(router.routes()).use(router.allowedMethods());
});

let port = process.env.PORT || 8000;
let host = process.env.HOST || '0.0.0.0';
app.listen(port, host, function () {
    console.log(`Server is running on ${host}:${port}`);
});


