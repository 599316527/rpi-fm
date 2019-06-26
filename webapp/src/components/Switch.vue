<template>
<div class="switch">
    <div class="p" :class="{on: this.value}" @click="handleClick"></div>
</div>
</template>

<script>
export default {
    props: {
        value: Boolean,
        disabled: Boolean
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    methods: {
        handleClick() {
            if (this.disabled) return;
            this.$emit('change', !this.value);
        }
    }
}
</script>

<style lang="less" scoped>
@transition-duration: 200ms;

.switch {
    width: 48px;
    box-sizing: border-box;

    .p {
        padding-bottom: 50%;
        border-radius: 50px;
        border: 2px solid #e5e5e5;
        position: relative;
        background-color: white;
        transition: background-color @transition-duration;

        &::before {
            content: "";
            position: absolute;
            top: 1px;
            left: 1px;
            width: 50%;
            padding-bottom: 50%;
            border-radius: 50%;
            box-shadow: 1px 1px 4px #aaa;
            transition: left @transition-duration;
            background-color: white;
        }

        &.on {
            background-color: #13b913;
            &::before {
                left: 50%;
                left: calc(50% - 1px);
            }
        }
    }

}
</style>
