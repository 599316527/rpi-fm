const delay = require('delay');
const gpio = require('rpi-gpio');
const gpiop = gpio.promise;
const SerialPort = require('serialport');
const AsyncLock = require('async-lock');

const defaultRpiSerialPort = '/dev/ttyAMA0';
const serialLocker = new AsyncLock({timeout: 5000});
const serialLockKey = 'serial-sending-data';


const fmPowerControlPin = 23;
const pinNumberModeMapping = {
    [fmPowerControlPin]: gpio.DIR_OUT
};
const atKeyMapping = {
    volume: 'VOL',
    freq: 'FRE',
    backLightDelay: 'BANK',
    isCampusOff: 'CAMPUS'
};

let currentFMStatus = {
    isPowerOn: false,

    freq: 875,
    volume: 10,
    isPause: false,
    backLightDelay: 0,
    isCampusOff: true
};

let serialPort;



async function init() {
    return Promise.all(Object.entries(pinNumberModeMapping).map((pin, mode) => gpiop.setup(pin, mode)));
}

async function powerOn() {
    if (currentFMStatus.isPowerOn) return;
    await setPower(true);
    await delay(500);
    serialPort = await createSerialPort();
}
async function powerOff() {
    if (!currentFMStatus.isPowerOn) return;
    serialPort = undefined;
    await setPower(false);
    await delay(100);
}
async function setPower(val) {
    await gpiop.write(fmPowerControlPin, val);
}

async function createSerialPort() {
    return new Promise(function (resolve, reject) {
        let port = new SerialPort(defaultRpiSerialPort, {
            baudRate: 38400
        }, err => err ? reject(err) : resolve(port));
    });
}


async function getCurrentStatus() {
    let isPowerOn = await gpiop.read(fmPowerControlPin);
    currentFMStatus.isPowerOn = isPowerOn;
    if (!isPowerOn) {
        return currentFMStatus;
    }
    let status = await getFMStatus();
    return Object.assign(currentFMStatus, status);
}



async function setFreq(val) {
    return await setValue('freq', val, val => val >= (currentFMStatus.isCampusOff ? 870 : 760) && val <= 1080);
}

async function setVolume(val) {
    return await setValue('volume', val, val => val >= 0 && val <= 30);
}

async function setBackLightDelay(val) {
    return await setValue('backLightDelay', val, val => val >= 0 && val <= 99);
}

async function setValue(key, val, validator) {
    val = parseInt(val, 10);
    if (!validator(val)) {
        throw new Error(`Illegal ${key} value`);
    }
    let result = await sendSerialData(`AT+${atKeyMapping[key]}=${val}`);
    if (result === 'ERR') {
        throw new Error(`Set ${key} fail`);
    }
    currentFMStatus[key] = val;
    return result;
}

async function setCampus(val) {
    let result = await sendSerialData(`AT+CAMPUS=${val ? 1 : 0}`);
    currentFMStatus.isCampusOff = result === 'CAMPUS_OF';
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
    currentFMStatus.isPause = result === 'PAUS';
}

async function reset() {
    let result = await sendSerialData(`AT+CR`);
    if (result !== 'OK') {
        throw new Error('Clear settings fail');
    }
    result = await getFMStatus();
    Object.assign(currentFMStatus, result);
}

async function getFMStatus() {
    let result = await sendSerialData(`AT+RET`);
    console.log(result);
    // TODO
    return {};
}

async function sendSerialData(val) {
    if (!serialPort) {
        throw new Error('No serial connection available');
    }
    return serialLocker.acquire(serialLockKey, function () {
        return new Promise(function (resolve, reject) {
            serialPort.once('data', function (data) {
                resolve(data.toString('utf8').trim());
            });
            serialPort.once('error', function (err) {
                reject(err);
            });
            serialPort.write(val);
        });
    });
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