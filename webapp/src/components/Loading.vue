<template>
<div class="loading">
    <div class="spinner"></div>
</div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.loading {
    width: 100px;
    padding: 30px;
    background: rgba(0, 0, 0, .7);
    border-radius: 15px;
}

.spinner {
    padding-bottom: 100%;
    background: url(../assets/loading.gif) no-repeat center / contain;
}
</style>
