<template>
  <!--dialog-->
  <el-dialog :visible.sync="userCenterVisible" center close-on-click-modal append-to-body
             :before-close="beforeUserInfoDialogClose">
    <el-tabs v-model="activeTab" :tab-position="tabPosition" @tab-click="handleTabClick">
      <el-tab-pane label="个人信息" name="userInfo">
        <el-card shadow="always" class="card">
          <div class="user-detail" v-if="isEdit===false">
            <el-avatar shape="circle" :size="120" :src="url" @error="errorHandler">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" alt=""/>
            </el-avatar>
            <el-row class="username">
              <span>username</span>
            </el-row>
            <el-row>
              <span>CLOUD_ID: 1212312</span>
            </el-row>
            <el-row>
              <span>昵称: DiangD</span>
            </el-row>
            <el-row>
              <span>邮箱: 1304138666@qq.com</span>
            </el-row>
            <el-row>
              <span>个性签名: 12132132131313131313131313131313131313312313131313233131323232131</span>
            </el-row>
            <el-row style="margin-top: 20px">
              <el-button type="primary" round @click="isEdit=true">编辑信息</el-button>
            </el-row>
          </div>

          <!--              edit-->
          <div v-if="isEdit===true">
            <el-form label-position="left">
              <el-form-item style="text-align: center">
                <el-upload action="" auto-upload>
                  <el-avatar shape="circle" :size="120"
                             :src="url"
                             @error="errorHandler">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" alt=""/>
                  </el-avatar>
                </el-upload>
              </el-form-item>
              <el-form-item label="用户名">
                <el-input disabled type="text" auto-complete="true" placeholder="请输入旧密码"></el-input>
              </el-form-item>
              <el-form-item label="昵称">
                <el-input type="text" auto-complete="true" placeholder="请输入昵称"></el-input>
              </el-form-item>
              <el-form-item label="个性签名">
                <el-input type="textarea" auto-complete="true" placeholder="请输入个性签名"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" round style="width: 100%;">保存</el-button>
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
          <el-form label-position="left">
            <el-form-item label="旧密码">
              <el-input type="text" auto-complete="true" placeholder="请输入旧密码"></el-input>
            </el-form-item>
            <el-form-item label="新密码">
              <el-input type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="重复密码">
              <el-input type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-button round type="primary" style="width: 100%">确认</el-button>
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
</template>

<script>
export default {
  name: "user_edit"
}
</script>

<style scoped>

</style>
