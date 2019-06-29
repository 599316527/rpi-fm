const delay = require('delay');
const Router = require('koa-router');
const fm = require('../lib/fm');
const schedule = require('../lib/schedule');

let router = new Router({});
module.exports = router;

router.get('/fm/status', async (ctx, next) => {
    ctx.body = await fm.getCurrentStatus(true);
});

router.post('/fm/status', async (ctx, next) => {
    ctx.body = await fm.getCurrentStatus();
});

router.put('/fm/:key/:value', async (ctx, next) => {
    let {key, value} = ctx.params;

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
    ctx.body = {
        currentPlayName: schedule.getCurrentPlayName(),
        ...schedule.status()
    };
});

router.put('/job/:key/:value', async (ctx, next) => {
    let {key, value} = ctx.params;

    if (key === 'schedule') {
        if (value === 'on') {
            await schedule.start();
        }
        else {
            schedule.stop();
        }
    }
    else if (key === 'run') {
        await schedule.runJob(parseInt(value, 10));
    }
    else if (key === 'stop') {
        schedule.stopJob(parseInt(value, 10));
    }

    ctx.body = {
        currentPlayName: schedule.getCurrentPlayName(),
        ...schedule.status()
    };
});

router.get('/player/current', async (ctx, next) => {
    ctx.body = {
        currentPlayName: schedule.getCurrentPlayName()
    };
});
router.post('/player/next', async (ctx, next) => {
    schedule.playNext();
    await delay(500);
    ctx.body = {
        currentPlayName: schedule.getCurrentPlayName()
    };
});





