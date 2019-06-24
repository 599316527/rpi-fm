
const Router = require('koa-router');
const fm = require('../lib/fm');
const schedule = require('../lib/schedule');

let router = new Router({
    prefix: '/data'
});
module.exports = router;

router.get('/status', async (ctx, next) => {
    ctx.body = await fm.getCurrentStatus(true);
});

router.post('/status', async (ctx, next) => {
    ctx.body = await fm.getCurrentStatus();
});

router.put('/:key/:value', async (ctx, next) => {
    let {key, value} = ctx.request.params;

    if (key === 'power') {
        await (value === 'on' ? fm.powerOn() : fm.powerOff());
    }
    else if (key === 'freq') {
        await fm.setFreq(parseInt(value, 10));
    }
    else if (key === 'volume') {
        await fm.setVolume(parseInt(value, 10));
    }
    else if (key === 'light') {
        await fm.setBackLightDelay(parseInt(value, 10));
    }
    else if (key === 'campus') {
        await fm.setCampus(parseInt(value, 10));
    }
    else if (key === 'play') {
        await (parseInt(value, 10) ? fm.play() : fm.pause());
    }
    else if (key === 'reset') {
        await fm.reset();
    }

    ctx.body = await fm.getCurrentStatus(true);
});



router.get('/job/status', async (ctx, next) => {
    ctx.body = schedule.status();
});

router.put('/job/:key/:value', async (ctx, next) => {
    let {key, value} = ctx.request.params;

    if (key === 'schedule') {
        if (value === 'on') {
            await schedule.start();
        }
        else {
            schedule.stop();
        }
    }
    else if (key === 'run') {
        schedule.runJob(parseInt(value, 10));
    }
    else if (key === 'stop') {
        schedule.stopJob();
    }

    ctx.body = 'OK';
});







