const {promisify} = require('util');
const delay = require('delay');
const gpio = require('rpi-gpio');
const gpiop = gpio.promise;
const SerialPort = require('serialport');
const AsyncLock = require('async-lock');
const debug = require('debug')('RPIFM:fm');
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');

const rpiSerialPort = '/dev/ttyAMA0';
const rpiSerialBaudRate = 38400;
const serialLocker = new AsyncLock({timeout: 5000});
const serialLockKey = 'serial-sending-data';


const fmPowerControlPin = parseInt(process.env.FM_POWER_CTRL_PIN || 24, 10);
debug(`FM Power Control Pin: ${fmPowerControlPin}`);

let currentFMStatus = {
    isPowerOn: false,

    freq: 875,
    volume: 30,
    isPause: false,
    backLightDelay: 20,
    isCampusOff: true
};

let serialPort;
let serialPortParser;
let powerOffTimer;
let isGpioInited;

async function init() {
    debug('FM module initing');
    if (isGpioInited) {
        debug('Gpio has inited');
        return;
    }

    debug('Gpio initing');
    gpio.setMode(gpio.MODE_BCM);
    return Promise.all(Object.entries({
        [fmPowerControlPin]: gpio.DIR_OUT
    }).map((pin, mode) => gpiop.setup(pin, mode)));
}




async function powerOn() {
    debug('Start power on');
    debug(`clearTimeout: ${powerOffTimer}`);
    clearTimeout(powerOffTimer);
    if (currentFMStatus.isPowerOn) {
        debug('Has powered on');
        return;
    }
    await setPower(true);
    await delay(2000);
    debug('End power on');
    [serialPort, serialPortParser] = await createSerialPort();
}
async function powerOff() {
    debug('Start power off');
    serialPort = undefined;
    serialPortParser = undefined;
    debug(`clearTimeout: ${powerOffTimer}`);
    clearTimeout(powerOffTimer);
    debug('Scheduled power off');
    powerOffTimer = setTimeout(function () {
        setPower(false);
        debug('End power off');
    }, 1000);
    debug(`setTimeout: ${powerOffTimer}`);
    currentFMStatus.isPowerOn = false;
}
async function setPower(val) {
    await gpiop.write(fmPowerControlPin, val ? 1 : 0);
}
async function getPower() {
    return await gpiop.read(fmPowerControlPin);
}

async function createSerialPort() {
    return new Promise(function (resolve, reject) {
        debug('Creating serial port connection');
        let parser = new InterByteTimeout({interval: 300});
        let port = new SerialPort(rpiSerialPort, {
            baudRate: rpiSerialBaudRate
        }, function (err) {
            if (err) {
                debug('Create serial port error', err);
                reject(err);
            }
            else {
                debug('Serial port connection created');
                port.pipe(parser);
                resolve([port, parser]);
            }
        });
    });
}





async function getCurrentStatus(cached = false) {
    if (cached) return currentFMStatus;

    let isPowerOn = await getPower();
    currentFMStatus.isPowerOn = isPowerOn;
    debug(`getCurrentStatus isPowerOn: ${isPowerOn ? 'Yes' : 'No'}`);
    if (!isPowerOn) {
        return {isPowerOn};
    }
    let status = await getFMStatus();
    return Object.assign(currentFMStatus, status);
}

async function getFMStatus() {
    let result = await sendSerialData(`AT+RET`);
    result = result.reduce(function (ret, line) {
        let [key, val] = line.split('=').map(item => item.trim());
        ret[key.toLowerCase()] = val ? val : true;
        return ret;
    }, {});
    debug('(M) fm status: ', result);

    let data = {};
    data.volume = parseInt(result.vol, 10);
    data.freq = parseInt(result.fre, 10);
    data.isCampusOff = !!result.campus_off;
    data.isPause = !!result.paus;
    debug('(F) fm status: ', data);
    return data;
}






async function setFreq(val) {
    return await setValue('freq', val, val => val >= (currentFMStatus.isCampusOff ? 870 : 760) && val <= 1080);
}

async function setVolume(val) {
    return await setValue('volume', val, val => val >= 0 && val <= 30);
}

async function setBackLightDelay(val) { // val: 0：长关，1：长开，其他：延迟时间
    return await setValue('backLightDelay', val, val => val >= 0 && val <= 99);
}

async function setValue(key, val, validator) {
    val = parseInt(val, 10);
    if (!validator(val)) {
        throw new Error(`Illegal ${key} value`);
    }
    let result = await sendSerialData(`AT+${getAtCommandByFieldKey(key)}=${val}`);
    if (result[0] === 'ERR') {
        throw new Error(`Set ${key} fail`);
    }
    currentFMStatus[key] = val;
    return result;
}

function getAtCommandByFieldKey(key) {
    return {
        volume: 'VOL',
        freq: 'FRE',
        backLightDelay: 'BANK',
        isCampusOff: 'CAMPUS'
    }[key];
}

async function setCampus(val) {
    let result = await sendSerialData(`AT+CAMPUS=${val ? 1 : 0}`);
    currentFMStatus.isCampusOff = result[0] === 'CAMPUS_OF';
}

async function play() {
    if (!currentFMStatus.isPause) return;
    togglePlayPause();
}
async function pause() {
    if (currentFMStatus.isPause) return;
    togglePlayPause();
}
async function togglePlayPause() {
    let result = await sendSerialData(`AT+PAUS`);
    currentFMStatus.isPause = result[0] === 'PAUS';
}


async function reset() {
    let result = await sendSerialData(`AT+CR`);
    if (result[0] !== 'OK') {
        throw new Error('Clear settings fail');
    }
    result = await getFMStatus();
    return Object.assign(currentFMStatus, result);
}


function sendSerialDataNoQueue(val) {
    return new Promise(function (resolve, reject) {
        serialPortParser.once('data', function (data) {
            let val = data.toString('utf8').trim();
            debug('Recieved data from serialport', val);
            data = parseSerialResponse(val);
            debug('Parsed data', data);
            resolve(data);
        });
        serialPortParser.once('error', function (err) {
            debug('Got error from serialport parser', err);
            reject(err);
        });
        serialPort.once('error', function (err) {
            debug('Got error from serialport', err);
            reject(err);
        });
        debug('Sending command to serialport', val);
        serialPort.write(val);
    });
}


async function sendSerialData(val) {
    if (!serialPort) {
        throw new Error('No serial connection available');
    }
    debug(`Acquiring async-lock: ${serialLockKey}`);
    let result = await serialLocker.acquire(serialLockKey, function () {
        return sendSerialDataNoQueue(val);
    });
    debug(`Releasing async-lock: ${serialLockKey}`);
    return result;
}

function parseSerialResponse(result) {
    return result.split('\n')
        .filter(line => !(['*', '!'].some(c => line.includes(c))))
        .map(line => line.trim())
        .filter(line => line);
}





module.exports = {
    init,

    powerOn,
    powerOff,

    getCurrentStatus,

    setFreq,
    setVolume,
    play,
    pause,
    setCampus,
    setBackLightDelay,

    reset
};




