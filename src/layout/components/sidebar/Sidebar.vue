<template>
  <div :class="{'has-logo':showLogo}">
    <Logo v-if="showLogo" :collapse="isCollapse"/>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <SidebarItem v-for="route in routes" :key="route.path" :item="route" :base-path="route.path"/>
      </el-menu>
    </el-scrollbar>
    <div class="quota-space">
      <el-progress v-show="percentage > 0" :class="{'collapse': isCollapse}" :percentage="percentage"
                   :format="progressFormat" :color="customColors"></el-progress>
    </div>
  </div>
</template>

<script>
import SidebarItem from "@/layout/components/sidebar/SidebarItem";
import variables from '@/styles/sidebar-variables.scss'
import Logo from "@/layout/components/sidebar/Logo";
import {mapGetters} from 'vuex'
import '@/utils/number'
import {formatSize} from "@/utils/number";
import api from '@/api/store'
import {isAuth}from '@/utils/auth'

export default {
  name: "Sidebar",
  components: {SidebarItem, Logo},
  data() {
    return {
      percentage: 10,
      occupy: 0,
      size: 0,
      customColors: [
        {color: '#f56c6c', percentage: 150},
        {color: '#f56c6c', percentage: 100},
        {color: '#e6a23c', percentage: 80},
        {color: '#5cb87a', percentage: 60},
        {color: '#1989fa', percentage: 40},
        {color: '#6f7ad3', percentage: 20}
      ],
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'username',
      'nickname',
      'userDetail',
      'token',
      "userDetail"
    ]),
    hasStore() {
      return this.userDetail.storeId
    },
    routes() {
      let routes = []
      if (this.$route.meta.menuType === 0) {
        this.$router.options.routes.forEach(route => {
          if (route.menuType === 0) {
            routes.push(route)
          }
        })
      } else {
        this.$router.options.routes.forEach(route => {
          if (route.menuType === 2) {
            routes.push(route)
          }
        })
      }
      return routes
    },
    activeMenu() {
      const route = this.$route
      const {meta, path} = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    variables() {
      return variables
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  watch:{
    isCollapse(val){
    }
  },
  mounted() {
    if (isAuth()||this.hasStore) {
      api.storeDetail({
        userId: this.$store.state.user.userId,
      }).then(res => {
        if (res.data) {
          this.size = res.data.size
          this.occupy = res.data.occupy
        }
      });
    }
  },
  methods: {
    expandSpaceReq() {
      this.$confirm('此操作将向管理员申请扩容, 是否继续?', 'Hi', {
        confirmButtonText: '发送',
        cancelButtonText: '取消',
        type: 'success',
        center: true,
      }).then(() => {
        this.$message({
          type: 'success',
          message: '发送成功!'
        });
      }).catch(() => {
      })
    },
    progressFormat() {
      const quota = this.size
      const space = this.occupy
      if (space && quota > 0) {
        const percentage = Number((space / quota * 100).toFixed(1))
        this.percentage = percentage > 100 ? 100 : percentage
        if (this.isCollapse) {
          return `${formatSize(this.occupy)}`
        } else {
          return `${formatSize(this.occupy)}/${formatSize(quota)}B`
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.sidebar-container.has-logo {
  /deep/ .el-scrollbar {
    height: calc(100% - 132px) !important;
  }
}

.quota-space {
  font-size: 14px;
  height: 32px;
  line-height: 32px;

  /deep/ .el-progress-bar {
    padding-right: 40px;
    margin-left: 20px;
  }

  /deep/ .el-progress__text {
    margin-left: 20px;
    font-size: 12px !important;
  }

  .collapse {
    /deep/ .el-progress-bar {
      padding-right: 4px;
      margin-left: 2px;
    }

    /deep/ .el-progress__text {
      margin-left: 5px;
      display: block;
    }
  }
}

</style>

