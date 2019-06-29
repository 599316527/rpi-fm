const path = require('path');
const {shuffle} = require('lodash');
const soundPlayer = require('play-sound')({player: 'play'}); // sox 支持的音频格式比较全
const aplay = soundPlayer.play.bind(soundPlayer);
const debug = require('debug')('RPIFM:player');


class ListPlayer {
    constructor(audios, {
        random = false,
        volume = 1
    } = {}) {
        this.audios = audios;
        this.options = {random, volume};
        debug('Player options: ', this.options);

        this.stopFlag = false;

        if (random) {
            this.audios = shuffle(audios);
        }
    }

    async play() {
        this.stopFlag = false;

        this.currentAudioIndex = 0;
        while (!this.stopFlag) {
            try {
                await new Promise((resolve, reject) => {
                    let audio = this.audios[this.currentAudioIndex];
                    let audioName = path.basename(audio);
                    debug(`Playing ${audioName} (${this.currentAudioIndex + 1}/${this.audios.length})`);
                    // 不能直接 promisify，play 方法同步返回 process 不能丢，要用来强制停止当前播放的声音
                    this.currentPlayProcess = aplay(audio, {
                        play: ['-v', this.options.volume]
                    }, function (err) {
                        if (err) {
                            debug(`Got error while playing ${audioName}`, err);
                            reject(err);
                        }
                        debug(`Finish playing ${audioName}`);
                        resolve();
                    });
                });
            }
            catch (err) {}

            if (++this.currentAudioIndex >= this.audios.length) {
                this.currentAudioIndex = 0;
                // 播放到结尾时回到头上，再随机一次列表
                if (this.options.random) {
                    this.audios = shuffle(this.audios);
                }
            }
        }
    }

    current() {
        let p = this.audios[this.currentAudioIndex];
        return path.basename(p, path.extname(p));
    }

    stop() {
        this.stopFlag = true;
        this.currentPlayProcess.kill();
    }

    next() {
        this.currentPlayProcess.kill();
    }
}


module.exports = ListPlayer;

