const jobs = require('../conf/jobs');
const fm = require('./fm');

let currentPlayer;
let currentRunningJobIndex = -1;
let checkTimer;

function runJob(index) {
    stopJob();
    currentRunningJobIndex = index;
    currentPlayer = jobs[index].runner();
    currentPlayer.play();
}

function stopJob() {
    currentPlayer && currentPlayer.stop();
    currentRunningJobIndex = -1;
}


await function start() {
    console.log('Initing');
    await fm.init();

    console.log('Schedule started');
    function loop() {
        console.log((new Date()));
        clearTimeout(checkTimer);
        for (let i = 0; i < jobs.length; i++) {
            let {name, timeMatch} = jobs[i];
            if (timeMatch()) {
                console.log(`Time matched: ${name}`);
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
    console.log('Schedule stoped');
    clearTimeout(checkTimer);
    stopJob();
}

function status() {
    return {
        isRunning: currentRunningJobIndex >= 0
    };
}


module.exports = {start, stop, status};


