<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside"/>
    <sidebar class="sidebar-container" v-if="isShow"/>
    <div class="main-container" :style="{'margin-left': isShow ? '': '0'}">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar v-if="isShow"/>
      </div>
      <app-main/>
    </div>
    <!--全局音乐播放 -->
    <AudioPreview></AudioPreview>
  </div>
</template>

<script>
import Navbar from "@/layout/components/navbar/Navbar";
import Sidebar from "@/layout/components/sidebar/Sidebar";
import AppMain from "@/layout/components/main/AppMain";
import ResizeMixin from './mixin/ResizeHandler'
import {getToken} from "@/utils/auth";
import AudioPreview from "@/components/preview/AudioPreview";
import VideoPreview from "@/components/preview/VideoPreview";

export default {
  name: "Layout",
  components: {
    VideoPreview,
    Navbar,
    Sidebar,
    AppMain,
    AudioPreview
  },
  data() {
    return {
      isShow: true
    }
  },
  mixins: [ResizeMixin],
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', {withoutAnimation: false})
    }
  },
  mounted() {
    window.pc = !/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    if (getToken()) {
      this.isShow = window.pc;
      // //与服务器建立websocket连接
      // if(!ws.isConnected){
      //   toConnection(this.$store.state.user.name,this.$store.state.user.token);
      // }
      if (this.$route.path.startsWith('/setting')) {
        this.isShow = true
      }
    } else {
      this.isShow = false
    }
  }
}
</script>
<style scoped lang="scss">
@import "~@/styles/sidebar-variables.scss";
@import "~@/styles/mixin.scss";


.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  //background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px)
}

.mobile .fixed-header {
  width: 100%;
}

> > > .sidebar-logo-container {
  background-color: unset;
}
</style>
