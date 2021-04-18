<template>
  <span>
    <svg-icon v-if="item.isFolder" icon-class="folder"/>
    <svg-icon v-else-if="item.contentType&&item.contentType.indexOf('audio')>-1" icon-class="audio"></svg-icon>
    <svg-icon v-else-if="item.contentType&&item.contentType.indexOf('video')>-1" icon-class="video"></svg-icon>
    <div v-else-if="item.contentType&&item.contentType.startsWith('image')" v-on:mousedown="noDrag($event)">
          <el-image v-if="grid || grid === 'details'"
                    :style="{'width':details?'110px':'80px','height':details?'110px':'80px'}" fit="contain"
                    :src="thumbnail(item)">
            <div slot="error" class="image-slot">
              <svg-icon icon-class="loading-image-error"/>
            </div>
          </el-image>
          <el-avatar v-if="!grid" shape="square"
                     :src="thumbnail(item)"></el-avatar>
    </div>
    <svg-icon v-else :icon-class="findIconClass"/>
  </span>
</template>
<script>
import {iconClass} from '@/utils/file-type'
import fileConfig from '@/utils/file-config'

export default {
  name: 'IconFile',
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    audioCoverUrl: {
      type: String,
      default: ''
    },
    grid: {
      type: Boolean,
      default: false
    },
    details: {
      type: Boolean,
      default: false
    },
    public: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data() {
    return {
      pc: window.pc,
    }
  },
  mounted() {
  },
  computed: {
    findIconClass() {
      let suffix = this.item.extension;
      if (!suffix && this.item.name) {
        suffix = this.item.name.substring(this.item.name.lastIndexOf('.') + 1);
      }
      if (iconClass.has(suffix)) {
        return iconClass.get(suffix)
      }
      return 'file'
    },
  },
  methods: {
    noDrag(e) {
      // console.log('noDrag',e)
      // e.preventDefault()
    },
    thumbnail(file) {
      return fileConfig.thumbnailUrl(this.$store.state.user.userId, file, this.$store.state.user.token)
    }
  }
}
</script>
<style lang="scss" scoped>
.avatar-default-image {
  height: 35px;
  width: 35px;
  line-height: 35px;
}
</style>
