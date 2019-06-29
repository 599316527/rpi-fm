<template>
<div class="freq-input">
    <button class="btn btn-plus"
        @touchstart="handleBtnPointerDown(1)"
        @touchend="handleBtnPointerUp(1)"
        @touchcancel="handleBtnPointerUp(1)"
    >+</button>
    <div class="display"
        @touchstart="handleBeginSliding"
        @touchend="handleEndSliding"
        @touchcancel="handleEndSliding"
    >
        <span class="value"><pre>{{ formattedValue }}</pre></span>
        <span class="unit">MHz</span>
    </div>
    <button class="btn btn-minus"
        @touchstart="handleBtnPointerDown(-1)"
        @touchend="handleBtnPointerUp(-1)"
        @touchcancel="handleBtnPointerUp(-1)"
    >-</button>
</div>
</template>

<script>
import {clamp} from 'lodash';
import { setTimeout, clearTimeout, clearInterval, setInterval } from 'timers';

const freqChangeMaxInterval = 500;
const freqChangeMinInterval = 20;
const freqChangeAcceDuration = 2000;

export default {
    props: {
        value: Number,
        min: Number,
        max: Number,
        step: Number,
        disabled: Boolean
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    computed: {
        formattedValue() {
            let val = this.value || 0;
            val = val / 10 + (val % 10 ? '' : '.0');
            return val.padStart(5, ' ');
        },
        bindThisHandleSliding() {
            return this.handleSliding.bind(this);
        }
    },
    methods: {
        update(val) {
            if (this.disabled) return;
            this.$emit('change', clamp(val, this.min, this.max));
        },
        increase(sign) {
            let val = this.value + this.step * sign;
            if (val < this.min) val = this.max;
            if (val > this.max) val = this.min;
            this.update(val);
        },

        handleBtnPointerDown(sign) {
            this.touchDownTime = Date.now();
            this.touchDownTimer = setTimeout(() => {
                let startTime = Date.now();
                let run = () => {
                    this.increase(sign);
                    let interval = clamp(
                        freqChangeMaxInterval - (freqChangeMaxInterval - freqChangeMinInterval)
                                                    * (Date.now() - startTime) / freqChangeAcceDuration,
                        freqChangeMinInterval,
                        freqChangeMaxInterval
                    );
                    this.touchDownUpadteTimer = setTimeout(run, interval);
                };
                run();
            }, 1000);
        },
        handleBtnPointerUp(sign) {
            clearTimeout(this.touchDownTimer);
            clearTimeout(this.touchDownUpadteTimer);

            if (Date.now() - this.touchDownTime < 500) {
                this.increase(sign);
            }
        },

        handleBeginSliding({touches: [{clientX}]}) {
            this.initialPosX = clientX;
            this.initialValue = this.value;
            this.dragValueRatio = (this.max - this.min) / (document.documentElement.clientWidth * 0.66);
            // TODO: pointerevents
            document.addEventListener('touchmove', this.bindThisHandleSliding);
        },
        handleSliding({touches: [{clientX}]}) {
            this.update(Math.floor(((this.initialPosX - clientX) * this.dragValueRatio + this.initialValue)));
        },
        handleEndSliding() {
            document.removeEventListener('touchmove', this.bindThisHandleSliding);
        }
    }
}
</script>

<style lang="less" scoped>
.freq-input {
    display: flex;
    font-family: monospace;
    font-size: 20px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

.btn {
    font-size: inherit;
    font-family: inherit;
    font-weight: 300;
    border: none;
    background-color: transparent;
    padding: 0 3px;
    text-shadow: 0 0 2px #ccc;
    color: #333;
}

.display {
    margin: 0 2px;
}

.value {
    pre {
        font-family: inherit;
        margin: 0;
        display: inherit;
    }
}

.unit {
    font-size: 13px;
}
</style>
