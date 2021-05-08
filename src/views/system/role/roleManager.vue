<template>
  <div class="container">
    <el-dialog class="dialog-form" width="400px" :title="dialogTitle" :visible.sync="dialogVisible"
               @close="handleClose">
      <el-form size="medium" ref="managerForm" label-width="90px" :model="form" :rules="rules">
        <el-form-item label="角色名称:" prop="roleName">
          <el-input placeholder="请输入角色名称" width="100%" v-model="form.roleName"/>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input type="textarea" autosize :autosize="{ minRows: 3, maxRows: 6}" placeholder="请输入备注"
                    v-model="form.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click.native.prevent="onSave()">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog width="400px" title="分配权限" :visible.sync="dialogAuthVisible" @close="handleClose">
      <el-scrollbar>
        <el-tree
          style="max-height: 50vh"
          ref="authTree"
          :data="menuList"
          :check-strictly="true"
          show-checkbox
          node-key="menuId"
          default-expand-all
          :default-checked-keys="menuCheckedList"
          :props="{value: 'menuId', label: 'name'}">
        </el-tree>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogAuthVisible = false">取 消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click.native.prevent="saveAuth()">保 存
        </el-button>
      </div>
    </el-dialog>
    <el-card class="box-card table-search-header">
      <div slot="header">
        <div class="box-card-header">
          <el-form size="medium" class="search-form" ref="queryForm" label-width="77px" :model="queryCondition"
                   :rules="rules">
            <el-row :gutter="10">
              <el-col :sm="12" :md="6">
                <el-form-item label="角色名称:">
                  <el-input clearable placeholder="请输入角色名称" v-model="queryCondition.roleName"/>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="6" :xl="6">
                <el-form-item label="备注:" label-width="50px">
                  <el-input clearable placeholder="请输入备注" v-model="queryCondition.remark"/>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="7" :xl="6">
                <div class="el-form-actions">
                  <el-button class="card-btn-icon" size="medium" icon="el-icon-search" type="primary"
                             @click="getRoleList()">查询
                  </el-button>
                  <el-button class="card-btn-icon" size="medium" icon="el-icon-plus" type="primary" @click="add()">添加
                  </el-button>
                  <el-button :disabled="multipleSelection.length < 1" class="card-btn-icon" size="medium" type="danger"
                             icon="el-icon-delete" @click="handleSelectDelete()">删除
                  </el-button>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <table-list
        :less-client-height="280"
        :tableData="tableData"
        :loading="loading"
        :tableHeader="tableHeader"
        :pagination="pagination"
        row-key="roleId"
        @pageChange="pageChange"
        @sizeChange="pageChange"
        @selectFun="selectFun"
        @sortChange="sortChange"
      ></table-list>
    </el-card>
  </div>
</template>
<script>
import TableList from "@/components/table/TableList";
import roleApi from "@/api/role"
import menuApi from "@/api/menu"

export default {
  name: "roleManager",
  components: {TableList},
  computed: {},
  data() {
    return {
      queryCondition: {
        roleName: '',
        remark: '',
        sortProp: '',
        sortOrder: ''
      },
      tableData: [],
      menuList: [],
      menuCheckedList: [],
      loading: false,
      // 分页信息
      pagination: {
        pageNum: 1,
        pageSize: 15,
        total: 0
      },
      tableHeader: [
        {prop: 'roleName', label: '角色名称', minWidth: 110, sortable: 'custom'},
        {prop: 'remark', label: '备注', minWidth: 110, sortable: 'custom'},
        {prop: 'createAt', label: '创建时间', minWidth: 110, sortable: 'custom'},
        {prop: 'updateAt', label: '修改时间', minWidth: 110, sortable: 'custom'},
        {
          label: '操作', minWidth: this.$pc ? 0 : 160, active: [
            {name: '修改', icon: 'el-icon-edit', handle: (row) => this.handleEdit(row)},
            {name: '分配权限', icon: 'el-icon-finished', handle: (row) => this.authorization(row)},
          ],
        },
      ],
      multipleSelection: [],
      rules: {
        roleName: [
          {required: true, message: '请输入角色名称', trigger: 'blur'},
        ]
      },
      editMove: 1,// 1添加,2修改
      dialogTitle: '',
      dialogVisible: false,
      form: {
        roleName: '',
        remark: '',
      },
      updateLoading: false,
      dialogAuthVisible: false,
    }
  },
  mounted() {
    this.resize()
    this.getRoleList()
    this.getMenuTree()
  },
  methods: {
    resize() {
      let clientWidth = document.querySelector(".container").clientWidth
      const mobile = clientWidth <= 768;
      this.tableHeader[2].disabled = mobile
      this.tableHeader[3].disabled = mobile
    },
    // 组件选择完后把数据传过来
    selectFun(data) {
      this.multipleSelection = data.backData;
    },
    //表格组件返回排序对象
    sortChange(data) {
      let column = data.backData;
      this.queryCondition.sortProp = column.prop
      this.queryCondition.sortOrder = column.order
      this.getRoleList()
    },
    //分页导航
    pageChange(data) {
      this.pagination = data.backData;
      this.getRoleList()
    },
    handleClose() {
      if (this.$refs.managerForm) {
        this.$refs.managerForm.resetFields();
      }
      this.dialogVisible = false
    },
    getRoleList() {
      roleApi.roleList({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        ...this.queryCondition
      }).then(res => {
        let data = res.data
        this.tableData = data.list
        this.pagination.total = data.total
        this.loading = false
      })
    },
    getMenuTree() {
      menuApi.allMenu({userId: this.$store.getters.userId}).then(res => {
        this.menuList = res.data
      })
    },
    async add() {
      this.dialogVisible = true
      this.dialogTitle = '添加角色'
      this.editMove = 1
      await this.$nextTick()
      this.$refs.managerForm.resetFields()
    },
    // 设置formData
    setFormData() {
      return this.form
    },
    onSave() {
      this.$refs.managerForm.validate((valid) => {
        if (valid) {
          this.updateLoading = true
          if (this.editMove === 1) {
            this.addRole(this.setFormData())
          }
          if (this.editMove === 2) {
            this.updateRole(this.setFormData())
          }
        } else {
          return false;
        }
      });
    },
    // 添加角色
    addRole(data) {
      roleApi.add(data).then((res) => {
        if (res.status === 200) {
          this.onSuccess();
        } else {
          this.onError()
        }
      }).catch(() => {
        this.onError()
      })
    },
    handleEdit(row) {
      this.editMove = 2
      this.dialogVisible = true
      this.dialogTitle = '修改角色'
      this.form = JSON.parse(JSON.stringify(row))
    },
    updateRole(data) {
      roleApi.update(data).then((res) => {
        if (res.status === 200) {
          this.onSuccess('修改成功')
        } else {
          this.onError()
        }
      }).catch(() => {
        this.onError()
      })
    },
    onSuccess(message) {
      this.getRoleList()
      let msg = '保存成功!'
      if (message) {
        msg = message
      }
      this.updateLoading = false
      this.dialogVisible = false
      this.dialogAuthVisible = false
      this.$message({
        message: msg,
        type: 'success',
        duration: 1000
      })
    },
    onError() {
      this.updateLoading = false
    },
    // 分配权限
    authorization(row) {
      this.dialogAuthVisible = true
      this.form = JSON.parse(JSON.stringify(row))
      if (this.$refs.authTree) {
        this.$refs.authTree.setCheckedKeys(row.menuIds)
      } else {
        this.menuCheckedList = row.menuIds
      }
    },
    saveAuth() {
      this.form.menuIds = this.$refs.authTree.getCheckedKeys()
      this.updateRole(this.setFormData())
    },
    // 删除选中
    handleSelectDelete() {
      this.$confirm('确定要删除选中的角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        this.multipleSelection.forEach(row => {
          ids.push(row.roleId)
        })
        this.deleteRole(ids)
      })
    },
    handleDelete(ids) {
      this.$confirm('确定要删除此角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRole(ids)
      })
    },
    deleteRole(ids) {
      roleApi.delete({roleIds: ids}).then(() => {
        this.onSuccess('删除成功!')
      }).catch(() => {
        this.onError()
      })
    },

  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/setting";

/deep/ .el-input {
  width: 100%;
}

/deep/ .el-select {
  width: 100%;
}
</style>
