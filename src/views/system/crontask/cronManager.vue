<template>
  <div class="container">
    <el-dialog class="dialog-form" width="600px" :title="dialogTitle" :visible.sync="dialogVisible"
               @close="handleClose">
      <el-form size="medium" ref="managerForm" label-width="90px" :model="form" :rules="rules">
        <el-row :gutter="10">
          <el-form-item label="任务名称:" prop="jobName">
            <el-input placeholder="请输入任务名称" v-model="form.jobName"/>
          </el-form-item>
          <el-form-item label="任务分组:" prop="jobGroup">
            <el-input placeholder="请输入任务分组" v-model="form.jobGroup"/>
          </el-form-item>
          <el-form-item label="Cron:" prop="cronExpression">
            <el-input placeholder="请输入表达式" v-model="form.cronExpression"/>
          </el-form-item>
          <el-form-item label="任务类:" prop="beanClass">
            <el-input placeholder="请输入任务类" v-model="form.beanClass"/>
          </el-form-item>
          <el-form-item label="描述:" prop="description">
            <el-input type="textarea" autosize :autosize="{ minRows: 3, maxRows: 6}" placeholder="请输入描述"
                      v-model="form.description"/>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" :loading="updateLoading" @click.native.prevent="onSave()">保 存
        </el-button>
      </div>
    </el-dialog>
    <el-dialog class="dialog-form" width="400px" title="更多操作..." :visible.sync="dialogStatusVisible"
               @close="handleClose">
      <el-row style="margin-bottom: 10px">
        <el-button size="small" type="success" :disabled="this.form.jobStatus==='1'" @click="statusTask('1')">开启
        </el-button>
        <el-button size="small" type="warning" :disabled="this.form.jobStatus==='0'" @click="statusTask('0')">停止
        </el-button>
        <el-button size="small" :disabled="this.form.jobStatus==='0'" @click="runRightNow">立即执行</el-button>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogStatusVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <el-card class="box-card table-search-header">
      <div slot="header">
        <div class="box-card-header">
          <el-form size="medium" class="search-form" ref="queryForm" label-width="77px" :model="queryCondition">
            <el-row :gutter="10">
              <el-col :sm="12" :md="6">
                <el-form-item label="任务名称:">
                  <el-input clearable placeholder="请输入" v-model="queryCondition.jobName"/>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="6">
                <el-form-item label="任务描述:">
                  <el-input clearable placeholder="请输入" v-model="queryCondition.description"/>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="6">
                <el-form-item label="任务分组:">
                  <el-input clearable placeholder="请输入" v-model="queryCondition.jobGroup"/>
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="6">
                <div class="el-form-actions">
                  <el-button class="card-btn-icon" size="medium" icon="el-icon-search" type="primary"
                             @click="getTaskList()">查询
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
        row-key="id"
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
import taskApi from "@/api/task"

export default {
  name: "cronManager",
  components: {TableList},
  data() {
    return {
      // 查询条件
      queryCondition: {
        jobName: '',
        description: '',
        jobGroup: '',
        sortProp: '',
        sortOrder: ''
      },
      tableData: [],
      loading: false,
      // 分页信息
      pagination: {
        pageNum: 1,
        pageSize: 15,
        total: 0
      },
      tableHeader: [
        {prop: 'jobName', label: '任务名称', sortable: 'custom'},
        {prop: 'description', label: '描述'},
        {prop: 'cronExpression', label: 'Cron表达式', minWidth: 110, sortable: 'custom'},
        {prop: 'beanClass', label: '任务类', minWidth: 110, sortable: 'custom'},
        {
          prop: 'jobStatus', label: '状态', width: 80,
          formatData: (jobStatus) => {
            if (jobStatus === '0') {
              return '停止'
            } else {
              return '运行'
            }
          }, sortable: 'custom'
        },
        {prop: 'updateAt', label: '更新时间', sortable: 'custom'},
        {
          label: '操作', minWidth: this.$pc ? 0 : 200, active: [
            {name: '修改', icon: 'el-icon-edit', handle: (row) => this.handleEdit(row)},
            {name: '更多操作', icon: 'el-icon-s-tools', handle: (row) => this.handleEditStatus(row)},
          ],
        },
      ],
      multipleSelection: [],
      dialogTitle: '',
      dialogVisible: false,
      dialogStatusVisible: false,
      editMove: 1,
      form: {
        jobName: '',
        description: '',
        jobGroup: '',
        cronExpression: '',
        beanClass: '',
        jobStatus: '',
      },
      defaultFormData: {
        jobName: '',
        description: '',
        jobGroup: '',
        cronExpression: '',
        beanClass: '',
        jobStatus: '',
      },
      rules: {
        jobName: [
          {required: true, message: '请输入任务名称', trigger: 'blur'},
        ],
        cronExpression: [
          {required: true, message: '请输入Cron表达式', trigger: 'blur'},
        ],
        beanClass: [
          {required: true, message: '请输入任务类', trigger: 'blur'},
        ],
      },
      updateLoading: false,
    }
  },
  mounted() {
    this.getTaskList()
  },
  methods: {
    //分页导航
    pageChange(data) {
      this.pagination = data.backData;
      this.getTaskList()
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
      this.getTaskList()
    },
    getTaskList() {
      this.loading = true
      taskApi.taskList({
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
    async add() {
      this.dialogVisible = true
      this.dialogTitle = '添加定时任务'
      this.editMove = 1
      await this.$nextTick()
      this.$refs.managerForm.resetFields()
    },
    handleClose() {
      this.form = this.defaultFormData
      if (this.$refs.managerForm) {
        this.$refs.managerForm.resetFields();
      }
      this.dialogStatusVisible = false
      this.dialogVisible = false
    },
    setFormData() {
      return this.form
    },
    onSave() {
      this.$refs.managerForm.validate((valid) => {
        if (valid) {
          this.updateLoading = true
          if (this.editMove === 1) {
            this.addTask(this.setFormData())
          }
          if (this.editMove === 2) {
            this.updateTask(this.setFormData())
          }
        } else {
          return false;
        }
      });
    },
    addTask(data) {
      taskApi.add(data).then((res) => {
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
      this.dialogTitle = '修改定时任务'
      this.form = JSON.parse(JSON.stringify(row))
    },
    updateTask(data) {
      taskApi.update(data).then((res) => {
        if (res.status === 200) {
          this.onSuccess();
        } else {
          this.onError()
        }
      }).catch(() => {
        this.onError()
      })
    },
    onSuccess(message) {
      this.getTaskList()
      let msg = '保存成功!'
      if (message) {
        msg = message
      }
      this.updateLoading = false
      this.dialogVisible = false
      this.$message({
        message: msg,
        type: 'success',
        duration: 1000
      })
    },
    onError() {
      this.updateLoading = false
    },
    handleEditStatus(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogStatusVisible = true
    },
    statusTask(status) {
      this.form.jobStatus = status
      taskApi.status(this.setFormData()).then(res => {
        if (res.status === 200) {
          this.onSuccess('操作成功');
        } else {
          this.onError()
        }
      }).catch(() => {
        this.onError()
      })
    },
    runRightNow() {
      taskApi.run(this.setFormData()).then(res => {
        if (res.status === 200) {
          this.onSuccess('操作成功');
        } else {
          this.onError()
        }
      }).catch(() => {
        this.onError()
      })
    },
    handleSelectDelete() {
      this.$confirm('确定要删除选中的任务吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = []
        this.multipleSelection.forEach(row => {
          ids.push(row.id)
        })
        this.deleteTask(ids)
      })
    },
    deleteTask(ids) {
      taskApi.deleteTask({
        taskIds: ids
      }).then(() => {
        this.onSuccess('删除成功!')
      }).catch(() => {
        this.onError()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/setting";

/deep/ .el-input {
  width: 100%;
}

/deep/ .el-input-number {
  width: unset;
}

/deep/ .el-select {
  width: 100%;
}

/deep/ .box-card {
  max-width: 1440px;
}
</style>
