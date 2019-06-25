<template>
<div class="freq-input">
    <button class="btn btn-minus" @click="handleClick(-1)">-</button>
    <div class="display">
        <span class="value"><pre>{{ formattedValue }}</pre></span>
        <span class="unit">MHz</span>
    </div>
    <button class="btn btn-plus" @click="handleClick(1)">+</button>
</div>
</template>

<script>
import {clamp} from 'lodash';

export default {
    props: {
        value: Number,
        min: Number,
        max: Number,
        step: Number
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    computed: {
        formattedValue() {
            let val = this.value / 10 + (this.value % 10 ? '' : '.0');
            return val.padStart(5, ' ');
        }
    },
    methods: {
        handleClick(sign) {
            let val = this.value + this.step * sign;
            if (val < this.min) val = this.max;
            if (val > this.max) val = this.min;
            this.$emit('change', val);
        }
    }
}
</script>

<style lang="less" scoped>
.freq-input {
    display: flex;
    font-family: monospace;
    font-size: 20px;
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
