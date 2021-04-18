<template>
  <div class="header">
    <div class="header-title">
      <router-link to="/">
        <svg class="icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48"
             viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">
<g>
	<polygon fill-rule="evenodd" clip-rule="evenodd" fill="#41464" points="832.3,686.4 939.9,500 804.3,265.2 798.8,270.8
		733.9,335.6 317,752.5 335.6,784.8 664.4,784.8 721.2,686.4 	"/>
  <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#00AEAE" points="167.7,313.6 60.1,500 195.7,734.8 201.2,729.2
		201.2,729.2 683,247.4 664.4,215.2 335.6,215.2 278.8,313.6 	"/>
</g>
</svg>
      </router-link>
    </div>
    <div class="header-item">
      <ul>
        <li>
          <el-link>
            <router-link to="/">首页</router-link>
          </el-link>
        </li>
        <li>
          <el-link>
            <router-link to="/login">登录</router-link>
          </el-link>
        </li>
        <li>
          <el-link>
            <router-link to="/register">注册</router-link>
          </el-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "login-header",
  data() {
    return {}
  }
}
</script>

<style scoped lang="scss">
.header {
  width: 100%;
  min-width: 1000px;
  height: 50px;
  background-color: rgba(111, 111, 111, 0.2);
}

.header .header-title {
  width: 30%;
  float: left;
}

.header .header-title a {
  color: #ffffff;
  height: 50px;
  line-height: 50px;
  font-size: 25px;
  margin-left: 50px;
  text-decoration: none;
}

.header .header-item {
  width: 70%;
  height: 50px;
  float: right;
}

.header .header-item ul {
  float: right;
  margin-right: 50px;
}

.header .header-item ul li {
  float: left;
  margin-left: 50px;
  height: 50px;
  line-height: 50px;
  list-style: none;
  font-size: 14px;
  cursor: pointer;

  .el-link {
    color: #fff;

    a {
      color: #fff;
    }
  }
}


.header .header-item ul li:hover {
  text-decoration: none;
}
</style>
