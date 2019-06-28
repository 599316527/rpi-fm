<template>
<div class="icon" :name="name"></div>
</template>

<script>
export default {
    props: {
        name: String
    }
}
</script>

<style lang="less" scoped>
.icon {
    width: 24px;
    height: 24px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
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
.icon[name=playlist] {
    background-image: url(../assets/icon/wish-list.png);
}
.icon[name=custom] {
    background-image: url(../assets/icon/edit-property.png);
}
.icon[name=schedule] {
    background-image: url(../assets/icon/schedule.png);
}
.icon[name=start] {
    background-image: url(../assets/icon/start-squared.png);
}
.icon[name=stop] {
    background-image: url(../assets/icon/stop-squared.png);
}
.icon[name=cd] {
    background-image: url(../assets/icon/cd.png);
}
.icon[name=next] {
    background-image: url(../assets/icon/next.png);
}

</style>
