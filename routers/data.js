
const Router = require('koa-router');

let router = new Router({
    prefix: '/data'
});
module.exports = router;

router.post('/status', async (ctx, next) => {


});
