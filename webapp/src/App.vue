<template>
  <div id="app">
    <MainPage />

    <ContextMenu ref="contextMenu" />

    <transition name="fade">
        <div class="overlay-loading" v-if="isLoading">
            <Loading />
        </div>
    </transition>
  </div>
</template>

<script>
import MainPage from './components/MainPage.vue'
import ContextMenu from './components/ContextMenu';
import Loading from './components/Loading';
import shared from './shared';

export default {
  name: 'app',
  data() {
    return {
      isLoading: false
    }
  },
  components: {
    MainPage,
    ContextMenu,
    Loading
  },
  methods: {
    contextMenu(value) {
      let params = {};
      if (Array.isArray(value)) {
        params.options = value;
      }
      else {
        params = {...params, ...value};
      }
      return this.$refs.contextMenu.append(params);
    },
    setLoading(val) {
      this.isLoading = val;
    }
  },
  created() {
    shared.contextMenu = this.contextMenu;
    shared.setLoading = this.setLoading;
  }
}
</script>

<style lang="less">
html,
body {
    margin: 0;
}

body {
    background-color: #eee;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
}

.overlay-loading {
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, .2);

    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}

.fade-enter-active,
.fade-leave-active {
    opacity: 1;
    transition: opacity 360ms;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
