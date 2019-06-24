<template>
<div class="freq-input">
    <button class="btn btn-minus" @click="handleClick(-1)">-</button>
    <div class="display">
        <span class="value">{{ formattedValue }}</span>
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
            return this.value / 10 + (this.value % 10 ? '' : '.0');
        }
    },
    methods: {
        handleClick(sign) {
            this.$emit('change', clamp(this.value + this.step * sign, this.min, this.max));
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
    padding: 0;
    text-shadow: 0 0 2px #ccc;
    color: #333;
}

.display {
    margin: 0 8px;
}

.unit {
    font-size: 13px;
}
</style>
