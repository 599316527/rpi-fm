const path = require('path');
const fse = require('fs-extra');
const jobs = require('../conf/jobs');
const fm = require('./fm');
const Player = require('./player');
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
    currentPlayer.play();
    fm.powerOn();
}

function stopJob() {
    debug(`Stopping job ${currentRunningJobIndex}`);
    currentPlayer && currentPlayer.stop();
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
            return new Player(audios, {random: !!job.random});
        };
    }
}


async function start() {
    debug('Schedule Initing');
    await fm.init();

    debug('Schedule started');
    function loop() {
        debug(`Current time: ${new Date()}`);
        clearTimeout(checkTimer);
        for (let i = 0; i < jobs.length; i++) {
            let {name, timeMatch} = jobs[i];
            if (timeMatch()) {
                debug(`Time matched: ${name}`);
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
            isRunning: currentRunningJobIndex === index
        };
    });

    return {
        scheduled: !!checkTimer,
        jobs: resultJobs
    };
}


module.exports = {start, stop, status, runJob, stopJob};


