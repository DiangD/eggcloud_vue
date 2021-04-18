<!--suppress CssInvalidFunction -->
<template>
  <div class="login-container">
    <login-header></login-header>
    <div id='stars'></div>
    <div id='stars2'></div>
    <div id='stars3'></div>
    <el-card class="box-card">
      <el-form ref="loginForm" :model="loginForm" class="login-form" auto-complete="on" label-position="left"
               :rules="loginFormRules">
        <div class="title-container">
          <h3 class="title">
            <span class="egg-cloud-logo"><svg-icon style="width: 64px;height: 64px"
                                                   icon-class="egg-cloud"></svg-icon></span>
            <span>EggCloud</span>
          </h3>
        </div>
        <el-form-item prop="loginKey">
           <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
          <el-input v-model="loginForm.loginKey" placeholder="用户名或邮箱" type="text" auto-complete="on" tabindex="1"/>
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container">
          <svg-icon icon-class="password"/>
        </span>
          <el-input :key="passwordType" ref="password" v-model="loginForm.password" placeholder="密码"
                    :type="passwordType" auto-complete="on" tabindex="2"/>
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"/>
          </span>
        </el-form-item>
        <el-form-item class="remember" prop="rememberMe">
          <el-checkbox label="记住我" v-model="loginForm.rememberMe"></el-checkbox>
          <el-link style="float: right;margin: 0;padding: 0" :underline="false">忘记密码?</el-link>
        </el-form-item>
        <div class="button-block">
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin"  @keydown.enter="handleLogin">登录</el-button>
        </div>
        <div class="button-block">
          <el-button style="width: 100%" @click="gotoRegisterPage()">还没有账户?</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import LoginHeader from "./login-header";
import "../../api/user";

export default {
  name: "login",
  components: {LoginHeader},
  data() {
    return {
      loading: false,
      passwordType: 'password',
      redirect: '/',
      loginForm: {
        loginKey: '',
        password: '',
        rememberMe: false
      },
      loginFormRules: {
        loginKey: [
          {required: true, message: '请输入用户名或邮箱', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    gotoRegisterPage() {
      this.$router.push({path: "register"})
    },
    handleLogin() {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm).then((res) => {
            this.$message.success("登录成功")
            this.loading = false
            this.$router.replace(this.redirect !== '' ? this.redirect : '/')
          }).catch((error) => {
            console.log(error)
            this.loading = false
          })
        }
      })
    }
  }, mounted() {

  }
}
</script>
<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #1890ff;
;
$cursor: #409eff;


@keyframes rotate {
  0% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateZ(20deg) rotateX(-40deg) rotateY(-360deg);
  }
}

.stars {
  transform: perspective(500px);
  transform-style: preserve-3d;
  position: absolute;
  bottom: 0;
  perspective-origin: 50% 100%;
  left: 50%;
  animation: rotate 90s infinite linear;
}

.star {
  width: 2px;
  height: 2px;
  background: #F7F7B6;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0 -300px;
  transform: translate3d(0, 0, -300px);
  backface-visibility: hidden;
}

.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px #FFFFFF inset !important;
        /*-webkit-text-fill-color: #FFFFFF !important;*/
      }
    }
  }

  .el-button{
    height: 47px;
    font-size: 16px;
  }

  .remember {
    border: unset !important;
    text-align: start;
    margin-top: 22px;
    margin-bottom: -10px;
  }

  .el-form-item {
    border: 1px solid #d9d9d9;
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
@import "src/styles/stars";

$bg: #2d3a4b;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(#002766, 30%, #0040f4);

  .box-card {
    text-align: center;
    max-width: 316px;
    margin-top: 128px;
    margin-left: auto;
    margin-right: auto;
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 3px 5px 0 5px;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 0 5px 0 15px;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: #0a001f;
      margin: 20px auto 40px auto;
      text-align: center;
      font-weight: 500;
    }

    span {
      display: inline-block;
      vertical-align: middle;
    }

    .egg-cloud-logo {
      font-size: 42px;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
  }

  .button-block {
    display: block;
    margin-top: 16px;
  }
}


</style>
