<template>
  <div>
    <viewer
      v-show="false"
      :options="options"
      :images="images"
      @inited="inited"
      class="viewer" ref="viewer">
      <template slot-scope="scope">
        <div v-for="src in scope.images" :key="src">
          <img :src="src" alt="">
        </div>
      </template>
    </viewer>
  </div>
</template>

<script>
import 'viewerjs/dist/viewer.css';
import Bus from '@/assets/js/Bus';
import fileConfig from '@/utils/file-config'


export default {
  name: "ImageViewer",
  components: {},
  props: {
    file: {
      type: Object,
      default: function () {
        return {}
      }
    },
    accessKey: {
      type: String,
      default: undefined
    },
    fileList: {
      type: Array,
      default: function () {
        return []
      }
    },
    status: {
      type: Boolean,
      default: function () {
        return false
      }
    }
  },
  created() {
  },
  mounted() {
    Bus.$on('updateImageViewerStatus', () => {
      this.$emit('update:status', false)
    })
  },
  data() {
    return {
      images: [],
      options: {
        initialViewIndex: 3,
        ready: function (e) {
        },
        show: function (e) {
        },
        shown: function (e) {
        },
        hide: function (e) {
        },
        hidden: function (e) {
          Bus.$emit('updateImageViewerStatus', false)
        },
        view: function (e) {
        },
        viewed: function (e) {
        },
        zoom: function (e) {
        },
        zoomed: function (e) {
        }
      },
    }
  },
  watch: {
    status: function (visible) {
      if (visible) {
        this.images = []
        let viewIndex = 0
        const findIndex = this.fileList.findIndex(file => file.id === this.file.id)
        this.fileList.forEach((element, index) => {
          if (index < findIndex + 5 && index > findIndex - 5) {
            if (!element.isFolder && element.contentType && element.contentType.startsWith('image')) {
              let url = fileConfig.previewUrl(this.$store.state.user.userId, element, this.$store.getters.token)
              if(this.accessKey){
               // url = fileConfig.publicPreviewUrl(element.id, window.shareId);
              }
             // let url = element.url
              this.images.push(url)
              if (this.file.id === element.id) {
                viewIndex = this.images.length - 1
              }
            }
          }
        });
        this.show(viewIndex)
      }
    }
  },
  methods: {
    inited(viewer) {
      this.$viewer = viewer
    },
    show(viewIndex) {
      let index = 0
      if (viewIndex) {
        index = viewIndex
      }
      this.$viewer.index = index
      this.$viewer.show()
    },
    updateStatus() {
    }

  }

}
</script>

<style lang="scss" scoped>
.viewer-backdrop {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
