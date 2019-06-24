<template>
<div class="main">
    <h1>RPI FM Console</h1>
    <div class="list">
        <div class="block" :class="{disabled: !powerOn}">
            <!-- <h2>FM Transmitter Settings</h2> -->

            <div class="row">
                <div>电源</div>
                <iSwitch v-model="powerOn" />
            </div>
            <div class="row">
                <div>播放中</div>
                <iSwitch v-model="isPause" />
            </div>
            <div class="row">
                <div>校园广播</div>
                <iSwitch v-model="isCampus" />
            </div>
            <div class="row">
                <div>频率</div>
                <FreqInput v-model.number="freq" :min="minFreq" :max="1080" :step="1" />
            </div>
            <div class="row">
                <div>音量</div>
                <input type="range" v-model.number="volume" min="0" max="30" step="1" />
            </div>
            <div class="row">
                <div>背光</div>
                <iSwitch v-model="isLightOn" />
            </div>
            <div class="row light-delay" v-if="isLightOn" @click="$refs.lightDelayInput.focus()">
                <div>背光延迟</div>
                <div>
                    <input type="number" ref="lightDelayInput" v-model.number="lightDelay" min="2" max="99" step="1" />
                    秒
                </div>
            </div>
            <div class="row">
                <button>复位</button>
            </div>

        </div>
    </div>
</div>
</template>

<script>
import Switch from './Switch';
import FreqInput from './FreqInput';

export default {
    name: 'MainPage',
    components: {
        iSwitch: Switch,
        FreqInput
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
        }
    },
    methods: {

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
    h2 {
        margin: 0;
        font-size: 12px;
        font-weight: 100;
    }
}

.block {
    margin: 30px 0;
    background-color: white;
    border-top: 1px solid @border-color;
    border-bottom: 1px solid @border-color;

    .row {
        padding: 8px @horizontal-padding;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid @border-color;
        &:first-child {
            border-top: none;
        }
    }

    button {
        color: #3030fb;
        font-size: inherit;
        border: none;
        background-color: transparent;
        padding: 0;
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



</style>
