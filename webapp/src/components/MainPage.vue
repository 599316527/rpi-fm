<template>
<div class="main">
    <h1>树莓FM 设置</h1>
    <div class="content">

        <div class="list fm-settings" :class="{disabled: !powerOn}">
            <div class="row">
                <Icon name="power"/>
                <div class="item">
                    <div class="title">电源</div>
                    <iSwitch v-model="powerOn" @change="handlePowerChange" />
                </div>
            </div>
            <div class="row">
                <Icon :name="playPauseIconName"/>
                <div class="item">
                    <div class="title">播放中</div>
                    <iSwitch v-model="isPause" :disabled="!powerOn" @change="handleIsPauseChange" />
                </div>
            </div>
            <div class="row">
                <Icon name="campus"/>
                <div class="item">
                    <div class="title">校园广播</div>
                    <iSwitch v-model="isCampusOn" :disabled="!powerOn" @change="handleIsCampusOnChange" />
                </div>
            </div>
            <div class="row">
                <Icon name="freq"/>
                <div class="item">
                    <div class="title">频率</div>
                    <FreqInput v-model.number="freq" :min="minFreq" :max="1080" :step="1"
                        :disabled="!powerOn" @change="handleFreqChange" />
                </div>
            </div>
            <div class="row">
                <Icon :name="volumeIconName"/>
                <div class="item">
                    <div class="title">音量</div>
                    <input type="range" v-model.number="volume" min="0" max="30" step="1"
                        :disabled="!powerOn" @change="handleVolumeChange" />
                </div>
            </div>
            <div class="row has-light">
                <Icon name="light"/>
                <div class="item">
                    <div class="title">背光</div>
                    <iSwitch v-model="isLightOn" :disabled="!powerOn" @change="handleIsLightOnChange" />
                </div>
            </div>
            <div class="row light-delay" v-if="isLightOn">
                <Icon name="time"/>
                <div class="item" @click="$refs.lightDelayInput.focus()">
                    <div class="title">背光延迟</div>
                    <div>
                        <input type="number" ref="lightDelayInput" v-model.number.trim.lazy="lightDelay"
                            min="2" max="99" step="1" :disabled="!powerOn"
                            @change="handleLightDelayChange" />
                        <small>秒</small>
                    </div>
                </div>
            </div>
            <div class="row">
                <Icon name="reset"/>
                <div class="item">
                    <button @click="handleResetBtnClick" :disabled="!powerOn">复位</button>
                </div>
            </div>
        </div>


        <div class="list schedule-settings">
            <div class="row">
                <Icon name="schedule"/>
                <div class="item">
                    <div class="title">播放排期</div>
                    <iSwitch v-model="scheduled" @change="handleScheduledChange" />
                </div>
            </div>
            <div class="row" v-if="currentPlayName">
                <Icon name="cd"/>
                <div class="item">
                    <div class="title">当前播放</div>
                    <div class="current-play">
                        <div class="name">{{ currentPlayName }}</div>
                        <Icon name="next" @click.native="handlePlayNextBtnClick"/>
                    </div>
                </div>
            </div>
            <div class="row" v-for="({name, type, isRunning, at, duration}, index) in jobs"
                :key="name + index" :class="{running: isRunning}">
                <Icon :name="type"/>
                <div class="item job">
                    <div class="title">{{ name }}</div>
                    <div class="desc">
                        <div>
                            <div class="at">{{ at }}</div>
                            <div class="duration">持续{{ duration }}秒</div>
                        </div>
                        <Icon :name="!isRunning ? 'play' : 'pause'" @click.native="handleJobClick(index)" />
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
</template>

<script>
import {debounce, clamp, identity, noop} from 'lodash';
import Switch from './Switch';
import FreqInput from './FreqInput';
import Icon from './Icon';
import shared from '../shared';

export default {
    name: 'MainPage',
    components: {
        iSwitch: Switch,
        FreqInput,
        Icon
    },
    data() {
        return {
            powerOn: false,
            volume: 30,
            freq: 875,

            isPause: false,
            isCampusOn: false,

            isLightOn: true,
            lightDelay: 20,

            scheduled: false,
            jobs: [],
            currentPlayName: ''
        };
    },
    computed: {
        minFreq() {
            return this.isCampusOn ? 760 : 875;
        },
        playPauseIconName() {
            return !this.isPause ? 'pause' : 'play';
        },
        volumeIconName() {
            return 'volume-' + ['mute', 'low', 'middle', 'high'][Math.ceil(this.volume / 10)];
        },
        debounceSendFMCommand() {
            return debounce(this.sendFMCommand, 550);
        },
        debounceSendJobCommand() {
            return debounce(this.sendJobCommand, 550);
        }
    },
    methods: {
        async sendCommand(key, value, {
            methodPicker = noop,
            requestURLPreix = '/',
            responseParser = identity,
            commandDescription = '发送指令'
        }) {
            shared.setLoading(true);
            let method = methodPicker(key, value) || 'GET';
            let requestPath = requestURLPreix + '/' + [key].concat(value === undefined ? [] : value)
                                .map(item => encodeURIComponent(item)).join('/');
            let data;
            try {
                let res = await fetch(requestPath, {method});
                data = await res.json();
            }
            catch (err) {
                shared.contextMenu({
                    description: commandDescription + '失败',
                    options: [],
                    cancelButtonText: '好'
                });
            }
            if (data) {
                Object.assign(this, responseParser(data));
            }
            shared.setLoading(false);
        },

        async sendFMCommand(key, value) {
            if (!this.powerOn && !['power', 'status'].includes(key)) return;
            await this.sendCommand(key, value, {
                methodPicker(key, value) {
                    return value === undefined ? 'POST' : 'PUT';
                },
                requestURLPreix: '/fm',
                responseParser: parseStatusResponse,
                commandDescription: '发送 FM 指令'
            });
        },
        async handleResetBtnClick() {
            let result = await shared.contextMenu([{
                type: 'danger',
                text: '复位确认?'
            }]);
            if (result === 0) {
                this.debounceSendFMCommand('reset', 'true');
            }
        },

        async sendJobCommand(key, value) {
            await this.sendCommand(key, value, {
                methodPicker(key, value) {
                    return value === undefined ? 'GET' : 'PUT';
                },
                requestURLPreix: '/job',
                commandDescription: '更新任务'
            });
        },

        handlePowerChange(val) {
            this.debounceSendFMCommand('power', val ? 'on' : 'off');
        },
        handleVolumeChange(val) {
            this.debounceSendFMCommand('volume', val);
        },
        handleFreqChange(val) {
            this.debounceSendFMCommand('freq', val);
        },
        handleIsPauseChange(val) {
            this.debounceSendFMCommand('play', val ? 0 : 1);
        },
        handleIsCampusOnChange(val) {
            this.debounceSendFMCommand('campus', val ? 1 : 0);
        },
        handleIsLightOnChange(val) {
            this.debounceSendFMCommand('light', val ? this.lightDelay : 0);
        },
        handleLightDelayChange(val) {
            this.debounceSendFMCommand('light', this.isLightOn ? val : 0);
        },
        handleScheduledChange(val) {
            this.debounceSendJobCommand('schedule', val ? 'on' : 'off');
        },

        handlePlayNextBtnClick() {
            this.sendCommand('next', undefined, {
                methodPicker(key, value) {
                    return 'POST';
                },
                requestURLPreix: '/player',
                commandDescription: '播放下一首'
            });
        },

        async handleJobClick(i) {
            let job = this.jobs[i];
            let key = job.isRunning ? 'stop' : 'run';
            let keyTextMap = {run: '启动', stop: '停止'};
            let result = await shared.contextMenu([{
                type: 'normal',
                text: `${keyTextMap[key]}任务：${job.name}`
            }]);
            if (result === 0) {
                this.sendJobCommand(key, i);
            }
        }
    },
    mounted() {
        this.sendFMCommand('status');
        this.sendJobCommand('status');
    }
}

function parseStatusResponse({
    isPowerOn,
    freq,
    volume,
    isPause,
    backLightDelay,
    isCampusOff
}) {
    return {
        powerOn: isPowerOn,
        volume,
        freq,
        isPause,
        isCampusOn: !isCampusOff,
        isLightOn: backLightDelay > 0,
        lightDelay: clamp(backLightDelay, 2, 30)
    };
}
</script>

<style scoped lang="less">
@border-color: #ccc;
@horizontal-padding: 15px;

h1 {
    margin: 0;
    padding: 24px @horizontal-padding 6px;
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
            margin-right: @horizontal-padding / 1.5;
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
        color: #0079ff;
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

    &.fm-settings.disabled {
        .row:first-child {
            opacity: 1;
        }
    }

    &.schedule-settings {
        .row {
            &.running {
                .title {
                    font-weight: 500;
                }
            }
        }
        .item {
            .desc {
                font-size: 10px;
                line-height: 1;
                color: #555;
                text-align: right;
            }
            .at {
                &::befoer,
                &::after {
                    content: "\"";
                }
            }
        }

        .job {
            .desc {
                display: flex;
                align-items: center;
                .icon {
                    margin-left: 5px;
                    margin-right: 0;
                }
            }
        }

        .current-play {
            display: flex;

            .name {
                text-align: right;
                width: 200px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }
            .icon {
                margin-left: 5px;
                margin-right: 0;
            }
        }
    }

}

</style>
