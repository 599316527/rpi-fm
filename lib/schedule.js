const path = require('path');
const fse = require('fs-extra');
const jobs = require('../conf/jobs');
const fm = require('./fm');
const Player = require('./player');
const cronParser = require('cron-parser');
const debug = require('debug')('RPIFM:schedule');

let currentPlayer;
let currentRunningJobIndex = -1;
let checkTimer;

async function runJob(index) {
    debug(`Starting to run job ${index}`);
    stopJob();
    let job = jobs[index];
    if (!job) return;
    let runner = getJobRunner(job);
    if (!runner) return;
    currentPlayer = await runner(job);
    debug(`Player ready for [${job.type}]${job.name}(${index})`);
    currentRunningJobIndex = index;
    try {
        currentPlayer.play();
    }
    catch (err) {
        debug('Player.play error', err);
    }
    fm.powerOn();
}

function stopJob() {
    debug(`Stopping job ${currentRunningJobIndex}`);
    if (currentPlayer) {
        try {
            currentPlayer.stop();
        }
        catch (err) {
            debug('Player.stop error', err);
        }
    }
    currentRunningJobIndex = -1;
    fm.powerOff();
}

function getJobRunner(job) {
    if (job.type === 'custom') {
        return job.runner;
    }
    else if (job.type === 'playlist') {
        return async function (job) {
            let relPath = path.dirname(job.file);
            let content = await fse.readFile(job.file, 'utf8');
            let audios = content.split('\n')
                            .map(line => line.trim())
                            .filter(line => line && !line.startsWith('#'))
                            .map(name => name.startsWith('/') ? name : path.resolve(relPath, name));
            return new Player(audios, job.playerOptions);
        };
    }
}


async function start() {
    debug('Schedule Initing');
    // await fm.init();

    debug('Schedule started');
    function loop() {
        debug(`Current time: ${new Date()}`);
        clearTimeout(checkTimer);
        for (let i = 0; i < jobs.length; i++) {
            let {name, trigger} = jobs[i];
            if (isMatchTime(trigger.spec, trigger.duration)) {
                debug(`Time matched for ${name}: "${trigger.spec}" ${trigger.duration}`);
                if (currentRunningJobIndex !== i) {
                    runJob(i);
                }
                break;
            }
            else if (currentRunningJobIndex === i) {
                stopJob();
            }
        }

        // 匹配到 0 秒
        checkTimer = setTimeout(loop, secondsToNextMinute() * 1000);
    }
    loop();
}

function secondsToNextMinute() {
    let date = new Date();
    return 60 - date.getSeconds();
}

function isMatchTime(spec, duration) {
    let interval = cronParser.parseExpression(spec);
    let prevDate = interval.prev();
    let startTimestamp = prevDate.getTime() / 1000;
    let endTimestamp= startTimestamp + duration;
    let now = Date.now() / 1000;
    return now >= startTimestamp && now < endTimestamp;
}

function stop() {
    debug('Schedule stoped');
    clearTimeout(checkTimer);
    checkTimer = undefined;
    stopJob();
}

function status() {
    let resultJobs = jobs.map(function (job, index) {
        return {
            name: job.name,
            type: job.type,
            at: job.trigger.spec,
            duration: job.trigger.duration,
            isRunning: currentRunningJobIndex === index
        };
    });

    return {
        scheduled: !!checkTimer,
        jobs: resultJobs
    };
}

function getCurrentPlayName() {
    return currentPlayer.current && currentPlayer.current();
}

function playNext() {
    return currentPlayer.next && currentPlayer.next();
}

module.exports = {
    start, stop, status, runJob, stopJob,
    getCurrentPlayName, playNext
};


