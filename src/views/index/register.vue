<!--suppress CssInvalidFunction -->
<template>
  <div class="register-container">
    <login-header></login-header>
    <div id='stars'></div>
    <div id='stars2'></div>
    <div id='stars3'></div>
    <el-card class="box-card">
      <el-form :model="registerForm" ref="registerForm" class="register-form" auto-complete="on"
               :rules="registerFormRules"
               label-position="left">
        <div class="title-container">
          <h3 class="title">
            <span>
              <svg-icon style="width: 64px;height: 64px" icon-class="egg-cloud"></svg-icon>
            </span>
            <span>注册</span>
          </h3>
        </div>
        <el-form-item prop="username">
          <span class="svg-container">
          <svg-icon icon-class="user"/>
        </span>
          <el-input v-model="registerForm.username" placeholder="用户名" type="text"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="18">
            <el-form-item prop="email">
              <span class="email-svg-container"><svg-icon icon-class="email"/></span>
              <el-input v-model="registerForm.email" placeholder="邮箱" type="email"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-tooltip effect="dark" content="获取邮箱验证码" placement="right-end">
              <el-button type="danger" style="height: 47px" icon="el-icon-s-promotion"
                         @click="getVerifyCode"></el-button>
            </el-tooltip>
          </el-col>
        </el-row>
        <el-form-item prop="code">
            <span class="svg-container">
          <svg-icon icon-class="verify-code"/>
        </span>
          <el-input v-model="registerForm.code" placeholder="验证码" type="text"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container"><svg-icon icon-class="password"/></span>
          <el-input v-model="registerForm.password" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <span class="svg-container"><svg-icon icon-class="confirm-password"/></span>
          <el-input v-model="registerForm.confirmPassword" placeholder="重复密码" type="password"></el-input>
        </el-form-item>
        <div class="button-block">
          <el-button type="primary" style="width: 100%" @click="handleRegister" @keydown.enter="handleRegister">提交</el-button>
        </div>
        <div class="button-block">
          <el-button style="width: 100%" @click="gotoLoginPage">回到登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import LoginHeader from "./login-header";
import userApi from "../../api/user";

export default {
  name: "register",
  components: {LoginHeader},
  data() {
    const validatorUsername = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入用户名'))
      }
      if (value.length < 4 || value.length > 10) {
        return callback(new Error('用户名长度为4-10'))
      }
      let regExp = /^[a-zA-Z0-9_-]{4,16}$/
      if (!regExp.test(value)) {
        return callback(new Error('用户名不可包含中文以及特殊字符'))
      }
      if (this.verifyUsername(value)) {
        return callback(new Error('用户名已存在'))
      }
    }
    const validatorEmail = (rule, value, callback) => {
      if (value === '') {
        return callback(new Error('请输入邮箱'))
      }
      let regExp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/
      if (!regExp.test(value)) {
        return callback(new Error('邮箱格式错误'))
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.registerForm.confirmPassword !== '') {
          this.$refs.registerForm.validateField('confirmPassword');
        }
        callback();
      }
    };
    const validateConfirmPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      registerForm: {
        username: '',
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
      },
      registerFormRules: {
        username: [{validator: validatorUsername, trigger: 'blur'}],
        email: [{validator: validatorEmail, trigger: 'blur'}],
        code: [{required: true, message: "验证码不能为空", trigger: 'blur'}],
        password: [{validator: validatePass, trigger: 'blur'}],
        confirmPassword: [{validator: validateConfirmPass, trigger: 'blur'}]
      },
    }
  },
  methods: {
    gotoLoginPage() {
      this.$router.push({path: 'login'})
    },
    getVerifyCode() {
      let pass = true
      this.$refs['registerForm'].validateField('email', error => {
        if (error) {
          pass = false
        }
      })
      if (pass) {
        userApi.getVerifyCode(this.registerForm.email).then(res => {
          this.$message.success('验证码发送成功！')
        }).catch(e => {
          console.log(e)
        })
      }
    },
    handleRegister() {
      this.$refs['registerForm'].validate((valid) => {
        if (valid) {
          userApi.register(this.registerForm).then(res => {
            this.$message.success('注册成功！')
            setTimeout(this.gotoLoginPage(), 4000)
          })
        }
      })
    },
    verifyUsername(username) {
      userApi.isExistUsername(username).then(res => {
        return res.data
      }).catch(() => {
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

.register-container {
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

  .el-form-item {
    border: 1px solid #d9d9d9;
    border-radius: 5px;
    color: #454545;
  }

  .el-button {
    height: 47px;
    font-size: 16px;
  }
}
</style>

<style lang="scss" scoped>
@import "src/styles/stars";

$bg: #2d3a4b;
$light_gray: #eee;

.register-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(#002766, 30%, #0040f4);

  .box-card {
    text-align: center;
    max-width: 316px;
    margin: 128px auto;
  }

  .register-form {
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

  .email-svg-container {
    padding: 0 5px 0 10px;
    vertical-align: middle;
    width: 10px;
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
