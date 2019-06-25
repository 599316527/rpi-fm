<template>
<div class="context-menu">
    <transition name="fade">
        <div class="overlay" v-for="({key, options, description, cancelButtonText}) in menus" :key="key" @click="resolve(key, -1)">
            <div class="menu" @click.stop="handleMenuClick">
                <div class="block">
                    <div class="item description" v-if="description">{{ description }}</div>
                    <button v-for="({type, text}, index) in options" :key="index"
                        :data-key="key" :data-index="index"
                        class="item" :class="{[type]: true}">{{ text }}</button>
                </div>
                <div class="block">
                    <button class="item cancel" :data-key="key" :data-index="-1">{{ cancelButtonText || '取消' }}</button>
                </div>
            </div>
        </div>
    </transition>
</div>
</template>

<script>
import { promises } from 'fs';

export default {
    data() {
        return {
            menus: []
        };
    },
    methods: {
        remove(key) {
            let i = this.menus.findIndex(menu => menu.key === key);
            if (i >= 0) {
                this.menus.splice(i, 1);
            }
        },
        append(params) {
            let key = Math.round(Math.random() * 0xFFFFFF).toString(36);
            let options = params.options.map(function (option) {
                if (typeof option === 'string') {
                    return {
                        text: option,
                        type: 'normal'
                    };
                }
                return option;
            });

            let menu = {...params, key, options, callback: {}};
            let promise = new Promise(function (resolve, reject) {
                menu.callback.resolve = resolve;
                menu.callback.reject = reject;
            });
            promise.menuKey = key;
            this.menus.push(menu);

            return promise;
        },
        handleMenuClick(event) {
            let {target: {dataset: {key, index}}} = event;
            if (!key) return;
            this.resolve(key, parseInt(index, 10));
        },
        resolve(key, index) {
            let {options, callback} = this.menus.find(menu => menu.key === key);
            this.remove(key);
            callback.resolve(index, index >= 0 ? options[index] : null);
        }
    }
}
</script>

<style lang="less" scoped>
@menu-padding: 20px;

.overlay {
    position: fixed;
    z-index: 99;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.1);
}
.menu {
    position: absolute;
    left: @menu-padding;
    right: @menu-padding;
    bottom: @menu-padding;

}
.block {
    margin-top: @menu-padding / 2;
    background-color: #fff;
    border-radius: 14px;
    box-shadow: 0 2px 7px #a5a5a5;
}
.item {
    display: block;
    width: 100%;
    padding: 16px 8px;
    box-sizing: border-box;
    border: none;
    border-bottom: 1px solid #ccc;
    background-color: transparent;
    text-align: center;
    font-size: 17px;

    &:last-child {
        border-bottom: none;
    }

    &.danger {
        color: #ef1111;
    }

    &.cancel {
        font-weight: 500;
    }

    button& {
        color: #0079ff;
    }

    &.description {
        color: #484747;
    }
}



@transition-duration: 360ms;
@transition-timing-function: cubic-bezier(.13,.45,.41,1.34);

.fade-enter-active,
.fade-leave-active {
    opacity: 1;
    transition: opacity @transition-duration @transition-timing-function;

    .menu {
        transform: translateY(0);
        transition: transform @transition-duration @transition-timing-function;
    }
}
.fade-enter,
.fade-leave-to {
    opacity: 0;

    .menu {
        transform: translateY(110%);
    }

}
</style>
