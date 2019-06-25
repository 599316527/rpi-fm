<template>
<div class="main">
    <h1>RPI FM Console</h1>
    <div class="content">

        <div class="list" :class="{disabled: !powerOn}">
            <!-- <h2>FM Transmitter Settings</h2> -->

            <div class="row">
                <div class="icon" name="power"></div>
                <div class="item">
                    <div class="title">电源</div>
                    <iSwitch v-model="powerOn" />
                </div>
            </div>
            <div class="row">
                <div class="icon" :name="playPauseIconName"></div>
                <div class="item">
                    <div class="title">播放中</div>
                    <iSwitch v-model="isPause" />
                </div>
            </div>
            <div class="row">
                <div class="icon" name="campus"></div>
                <div class="item">
                    <div class="title">校园广播</div>
                    <iSwitch v-model="isCampus" />
                </div>
            </div>
            <div class="row">
                <div class="icon" name="freq"></div>
                <div class="item">
                    <div class="title">频率</div>
                    <FreqInput v-model.number="freq" :min="minFreq" :max="1080" :step="1" />
                </div>
            </div>
            <div class="row">
                <div class="icon" :name="volumeIconName"></div>
                <div class="item">
                    <div class="title">音量</div>
                    <input type="range" v-model.number="volume" min="0" max="30" step="1" />
                </div>
            </div>
            <div class="row has-light">
                <div class="icon" name="light"></div>
                <div class="item">
                    <div class="title">背光</div>
                    <iSwitch v-model="isLightOn" />
                </div>
            </div>
            <div class="row light-delay" v-if="isLightOn">
                <div class="icon" name="time"></div>
                <div class="item" @click="$refs.lightDelayInput.focus()">
                    <div class="title">背光延迟</div>
                    <div>
                        <input type="number" ref="lightDelayInput" v-model.number.trim.lazy="lightDelay" min="2" max="99" step="1" />
                        <small>秒</small>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="icon" name="reset"></div>
                <div class="item">
                    <button @click="handleResetBtnClick">复位</button>
                </div>
            </div>

        </div>
    </div>
    <div class="overlay-loading" v-if="isLoading">
        <Loading />
    </div>
</div>
</template>

<script>
import {debounce} from 'lodash';
import Switch from './Switch';
import FreqInput from './FreqInput';
import Loading from './Loading';

export default {
    name: 'MainPage',
    components: {
        iSwitch: Switch,
        FreqInput,
        Loading
    },
    data() {
        return {
            powerOn: false,
            volume: 30,
            freq: 875,

            isPause: false,
            isCampus: false,

            isLightOn: true,
            lightDelay: 20,

            isLoading: false
        };
    },
    computed: {
        minFreq() {
            return this.isCampus ? 760 : 875;
        },
        playPauseIconName() {
            return !this.isPause ? 'pause' : 'play';
        },
        volumeIconName() {
            return 'volume-' + ['mute', 'low', 'middle', 'high'][Math.ceil(this.volume / 10)];
        },
        debounceSendCommand() {
            return debounce(this.sendCommand, 500);
        }
    },
    watch: {
        powerOn(val) {
            this.debounceSendCommand('power', val ? 'on' : 'off');
        },
        volume(val) {
            this.debounceSendCommand('volume', val);
        },
        freq(val) {
            this.debounceSendCommand('freq', val);
        },
        isPause(val) {
            this.debounceSendCommand('play', val ? 0 : 1);
        },
        isCampus(val) {
            this.debounceSendCommand('campus', val ? 1 : 0);
        },
        isLightOn(val) {
            this.debounceSendCommand('light', val ? this.lightDelay : 0);
        },
        lightDelay(val) {
            this.debounceSendCommand('light', this.isLightOn ? val : 0);
        }
    },
    methods: {
        async sendCommand(key, value) {
            this.isLoading = true;
            let method = value ? 'PUT' : 'POST';
            let requestPath = ['', 'data', key].concat(value || [])
                                .map(item => encodeURIComponent(item)).join('/');
            let data;
            try {
                data = await fetch(requestPath, {method}).json();
            }
            catch (err) {
                alert('Send command fail');
            }
            if (data) {
                Object.assign(this, data);
            }
            this.isLoading = false;
        },
        handleResetBtnClick() {
            if (confirm('Confirm to reset?')) {
                this.debounceSendCommand('reset', 'true');
            }
        }
    },
    mounted() {
        this.sendCommand('status');
    }
}
</script>

<style scoped lang="less">
@border-color: #ccc;
@horizontal-padding: 15px;

h1 {
    margin: 0;
    padding: 20px @horizontal-padding 10px;
    background-color: white;
    border-bottom: 1px solid @border-color;
}

.list {
    margin: 30px 0;
    background-color: white;
    border-top: 1px solid @border-color;
    border-bottom: 1px solid @border-color;

    .row {
        padding-left: @horizontal-padding;
        display: flex;
        align-items: center;
        transition: opacity 100ms;

        .icon {
            width: 24px;
            height: 24px;
            margin-right: @horizontal-padding / 1.5;
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
        }

        .title {
            font-size: 16px;
        }

        .item {
            padding: 6px @horizontal-padding 6px 0;
            display: flex;
            flex-grow: 1;
            justify-content: space-between;
            align-items: center;

            border-top: 1px solid @border-color;
        }

        &:first-child {
            .item {
                border-top: none;
            }
        }
    }

    button {
        color: #3030fb;
        font-size: 0.9em;
        border: none;
        background-color: transparent;
        padding: 0;
        margin: 4px 0;
    }

    &.disabled {
        .row {
            opacity: .5;
        }
        .row:first-child {
            opacity: 1;
        }
    }

    .light-delay {
        input[type=number] {
            padding: 0;
            margin: 0;
            border: none;
            background-color: transparent;
            font-family: monospace;
            font-size: 16px;
            text-align: right;
            width: 50px;
        }
    }

}

.icon[name=power] {
    background-image: url(../assets/icon/shutdown.png);
}
.icon[name=play] {
    background-image: url(../assets/icon/play.png);
}
.icon[name=pause] {
    background-image: url(../assets/icon/pause.png);
}
.icon[name=campus] {
    background-image: url(../assets/icon/nerd.png);
}
.icon[name=freq] {
    background-image: url(../assets/icon/wifi.png);
}
.icon[name=volume-mute] {
    background-image: url(../assets/icon/mute.png);
}
.icon[name=volume-low] {
    background-image: url(../assets/icon/low-volume.png);
}
.icon[name=volume-middle] {
    background-image: url(../assets/icon/voice.png);
}
.icon[name=volume-high] {
    background-image: url(../assets/icon/audio.png);
}
.icon[name=light] {
    background-image: url(../assets/icon/idea.png);
}
.icon[name=time] {
    background-image: url(../assets/icon/time-machine.png);
}
.icon[name=reset] {
    background-image: url(../assets/icon/reset.png);
}

.overlay-loading {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}

</style>
