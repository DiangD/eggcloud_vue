<template>
  <div class="navbar">
    <Hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar"/>
    <Breadcrumb class="breadcrumb-container"/>
    <div class="right-content">
      <AppLink
        v-for="route in routes.topRouters"
        :key="route.path"
        :to="resolvePath(route.path)"
        v-if="!route.children[0].hidden"
      >
        <div class="right-content-button">
          <svg-icon :icon-class="route.children[0].meta.icon"></svg-icon>
          {{ route.children[0].name }}
        </div>
      </AppLink>
      <div class="right-username">{{ nickname ? nickname : username }}</div>
      <div class="right-menu">
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <el-avatar :src="avatar ? avatar : defaultAvatar" icon="el-icon-user-solid"></el-avatar>
            <i class="el-icon-caret-bottom"/>
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
            <app-link
              v-for="route in routes.rightTopRoutes"
              :key="route.path"
              :to="resolvePath(route.path)"
            >
              <el-dropdown-item>
                <svg-icon :icon-class="route.children[0].meta.icon"></svg-icon>
                {{ route.children[0].name }}
              </el-dropdown-item>
            </app-link>
            <el-dropdown-item @click.native="userCenterVisible = true">
              <svg-icon icon-class="user"></svg-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item>
              <svg-icon icon-class="question"></svg-icon>
              信息反馈
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="logout">
              <svg-icon icon-class="logout"></svg-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <!--  user custom edit  dialog-->
    <el-dialog :visible.sync="userCenterVisible" center close-on-click-modal append-to-body
               @close="userInfoDialogClose">
      <el-tabs v-model="activeTab" :tab-position="tabPosition" @tab-click="handleTabClick">
        <el-tab-pane label="个人信息" name="userInfo">
          <el-card shadow="always" class="card">
            <div class="user-detail" v-if="!isEdit">
              <el-avatar shape="circle" :size="120" :src="avatar" @error="errorHandler">
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" alt=""/>
              </el-avatar>
              <el-row class="username">
                <span>{{ this.username }}</span>
              </el-row>
              <el-row>
                <span>CLOUD_ID: {{ this.userId }}</span>
              </el-row>
              <el-row v-show="nickname">
                <span>昵称: {{ this.nickname }}</span>
              </el-row>
              <el-row v-show="userDetail.email">
                <span>邮箱: {{ this.userDetail.email }}</span>
              </el-row>
              <el-row v-show="userDetail.signature">
                <span>个性签名: {{ this.userDetail.signature }}</span>
              </el-row>
              <el-row style="margin-top: 20px">
                <el-button type="primary" round @click="isEdit=true">编辑信息</el-button>
              </el-row>
            </div>

            <!--              edit-->
            <div v-if="isEdit">
              <el-form ref="userInfoForm" :model="userInfoForm" label-position="left">
                <el-form-item style="text-align: center">
                  <el-tooltip content="点击修改头像">
                    <el-upload ref="avatarUpload" :action="avatarUploadAction"
                               :headers="uploadHeader"
                               :data="uploadData"
                               :show-file-list="false"
                               :before-upload="beforeAvatarUpload"
                               :on-success="handleAvatarSuccess"
                               :on-change="onAvatarChange"
                               :auto-upload="false">
                      <el-avatar shape="circle" :size="120"
                                 :src="avatar"
                                 @error="errorHandler">
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" alt=""/>
                      </el-avatar>
                    </el-upload>
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="userInfoForm.username" readonly type="text" auto-complete="true"></el-input>
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="userInfoForm.nickname" type="text" auto-complete="true"
                            placeholder="请输入昵称"></el-input>
                </el-form-item>
                <el-form-item label="个性签名" prop="signature">
                  <el-input v-model="userInfoForm.signature" type="textarea" auto-complete="true"
                            placeholder="请输入个性签名"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" round style="width: 100%;" @click="handleUpdateUserInfo">保存</el-button>
                </el-form-item>
                <el-form-item>
                  <el-button round style="width: 100%;" @click="isEdit=false">返回简介</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="安全相关" name="security">
          <el-card shadow="hover" class="card">
            <el-form label-position="left" :model="renewPwdForm" ref="renewPwdForm" :rules="renewPwdRules">
              <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="renewPwdForm.oldPassword" type="text" auto-complete="true" clearable
                          placeholder="请输入旧密码"></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="renewPwdForm.newPassword" type="password" placeholder="请输入密码" clearable></el-input>
              </el-form-item>
              <el-form-item label="重复密码" prop="confirmPassword">
                <el-input v-model="renewPwdForm.confirmPassword" type="password" placeholder="请输入密码"
                          clearable></el-input>
              </el-form-item>
              <el-button round type="primary" style="width: 100%" @click="handleRenewPassword">确认</el-button>
            </el-form>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="注销账号" name="destroyAccount">
          <el-card shadow="hover" class="card">
            <el-form label-position="left">
              <el-form-item label="用户名">
                <el-input type="text" placeholder="请输入用户名"></el-input>
              </el-form-item>
              <el-form-item label="密码">
                <el-input type="password" placeholder="请输入密码"></el-input>
              </el-form-item>
              <el-button round type="warning" style="width: 100%">注销</el-button>
            </el-form>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>


  </div>
</template>

<script>
import Hamburger from "@/components/Hamburger"
import {mapGetters} from 'vuex'
import path from "path"
import AppLink from '@/layout/components/sidebar/Link'
import Breadcrumb from '@/components/Breadcrumb'
import api from '@/api/user'
import {getToken} from "@/utils/auth"
import SparkMD5 from 'spark-md5'

export default {
  name: "Navbar",
  components: {Hamburger, AppLink, Breadcrumb},
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'));
      } else {
        if (this.renewPwdForm.confirmPassword !== '') {
          this.$refs.renewPwdForm.validateField('confirmPassword');
        }
        callback();
      }
    };
    const validateConfirmPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.renewPwdForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      avatarUploadAction: 'http://127.0.0.1:8088/u/upload/avatar',
      defaultAvatar: require('@/assets/image/default-avatar.png'),
      userCenterVisible: false,
      isEdit: false,
      tabPosition: 'left',
      activeTab: 'userInfo',
      renewPwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      renewPwdRules: {
        oldPassword: [{required: true, message: '原密码不能为空', trigger: 'blur'}],
        newPassword: [{validator: validatePass, trigger: 'blur'}],
        confirmPassword: [{validator: validateConfirmPass, trigger: 'blur'}]
      },
      userInfoForm: {
        email: this.$store.state.user.userDetail.email,
        password: this.$store.state.user.userDetail.password,
        username: this.$store.state.user.username,
        nickname: this.$store.state.user.nickname,
        signature: this.$store.state.user.userDetail.signature
      },
      avatarUploadHeader: {
        "Authorization": getToken(),
        "eggcloud_file_md5":'',
      }
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'sidebar',
      'avatar',
      'nickname',
      'username',
      'userDetail'
    ]),
    routes() {
      let routes = {}
      let topRouters = []
      let rightTopRoutes = []
      this.$router.options.routes.forEach(route => {
        if (route.menuType === 3) {
          topRouters.push(route)
        }
        if (route.menuType === 4) {
          rightTopRoutes.push(route)
        }
      })
      routes.topRouters = topRouters
      routes.rightTopRoutes = rightTopRoutes
      return routes
    },
    uploadHeader() {
      return this.avatarUploadHeader
    },
    uploadData() {
      return {
        "userId": this.userId
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('此操作将清除您的登陆状态', `Hi,${this.nickname ? this.nickname : this.username}`, {
        cancelButtonText: '取消',
        confirmButtonText: '登出',
        type: 'warning',
        center: true,
      }).then(() => {
        this.$store.dispatch('user/logout').then(res => {
          this.$message.success('登出成功')
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        })
      })

    },
    errorHandler() {
      return true
    },
    userInfoDialogClose() {
      this.activeTab = 'userInfo'
      this.isEdit = false
      this.$refs.userInfoForm.resetFields()
      this.$refs.renewPwdForm.resetFields()
      this.userCenterVisible = false
    },
    handleTabClick(tab, event) {
      console.log(tab, event)
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    },
    handleRenewPassword() {
      this.$refs.renewPwdForm.validate(valid => {
        if (valid) {
          api.renewPassword({
            'userId': this.userId,
            'originalPassword': this.renewPwdForm.oldPassword,
            'newPassword': this.renewPwdForm.newPassword
          }).then(() => {
            this.$notify({
              title: '修改成功',
              type: 'success',
              duration: 1000
            })
            this.$confirm('检测到您的登陆凭证发送变化，请重新登录', '重新登录', {
              confirmButtonText: '确定',
              showCancelButton: false,
              type: 'success',
            }).then(() => {
              this.$store.dispatch('user/logout').then((res) => {
                this.$message.success('登出成功')
                this.$router.push(`/login?redirect=${this.$route.fullPath}`)
              })
            })
          })
        }
      })
    },
    handleUpdateUserInfo() {
      let params = Object.assign({'userId': this.userId}, this.userInfoForm)
      api.updateUserInfo(params).then(() => {
        this.$store.dispatch('user/getUserInfo').then(res => {
          this.$notify({
            title: '修改成功',
            type: 'success',
            duration: 1000
          })
        })
      })
    },
    beforeAvatarUpload(file) {
      const isPic = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt1M = file.size / 1024 / 1024 < 2

      if (!isPic) {
        this.$message.error('上传头像图片只能是 JPG、PNG 格式!')
      }
      if (!isLt1M) {
        this.$message.error('上传头像图片大小不能超过 1MB!')
      }
      return isPic && isLt1M;
    },
    handleAvatarSuccess(res, file) {
      if (res.status !== 200) {
        this.$message.warning(res.message)
        return
      }
      this.$store.dispatch('user/getUserInfo').then(res => {
        this.$notify({
          title: '修改成功',
          type: 'success',
          duration: 1000
        })
      });
    },
    onAvatarChange: function (file, fileList) {
      const that = this
      let fileReader = new FileReader()
      // let spark = new SparkMD5.ArrayBuffer()
      fileReader.readAsBinaryString(file.raw)

      fileReader.onload = function (e) {
        let md5 = SparkMD5.hashBinary(e.target.result)
        that.avatarUploadHeader.eggcloud_file_md5 = md5
        console.log(md5)
        that.upload('avatarUpload')
      }
    },
    upload:function(obj){
      this.$refs[obj].submit();
    },
  }
}
</script>


<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;

    .right-username {
      line-height: 50px;
      margin: 0 10px;
    }

  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;
      cursor: pointer;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }

    &:hover {
      background-color: #00000006;
    }
  }
}

/deep/ .user-dropdown {
  top: 50px;
}

/deep/ .el-menu--horizontal {
  padding: 0 15px;

  .el-menu-item {
    height: 50px;
    line-height: 50px;
  }

  .el-submenu .el-submenu__title {
    height: 50px;
    line-height: 50px;
  }
}

.right-content-button {
  line-height: 50px;
  padding: 0 10px;

  &:hover {
    background-color: #00000006;
  }
}

.el-dropdown-menu__item {
  svg {
    margin-right: 5px;
  }
}

.card {
  margin: 5px;
  text-align: center;

  .username {
    color: #4f4f50;

    span {
      font-size: 18px;
      font-weight: 600;
    }
  }

  span {
    line-height: 2;
    font-size: 14px;
  }

}
</style>
