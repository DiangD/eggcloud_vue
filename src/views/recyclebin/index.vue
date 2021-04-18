<template>
  <div class="container">
    <div v-show="fileList.length>0" :style="{'width':'100%','height': clientHeight+'px'}">
      <pl-table
        ref="fileListTable"
        v-loading="tableLoading"
        :max-height="clientHeight"
        :default-sort="sortable"
        :highlight-current-row="false"
        empty-text="无文件"
        :use-virtual="false"
        :row-height="50"
        :border="false"
        :excess-rows="3"
        style="width: 100%;margin: 20px 0 0 0;"
        :cell-style="rowRed"
        :height-change="false"
        :row-class-name="tableRowClassName"
        element-loading-text="文件加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="#f6f7fa88"
        @selection-change="handleSelectionChange"
        @cell-click="cellClick"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="cellMouseLeave"
        @sort-change="sortChange"
        @table-body-scroll="tableBodyScroll">
        <template v-for="(item,index) in tableHead">
          <!--          index-->
          <pl-table-column v-if="index===0"
                           :key="index"
                           :index="index"
                           type="selection"
                           min-width="50">
          </pl-table-column>
          <!--        icon-->
          <pl-table-column v-if="index===1"
                           :key="index"
                           :index="index"
                           :prop="item.name"
                           :label="item.label"
                           width="60"
                           header-align="right">
            <template slot="header">
              <div v-if="item.label!==''">
                <span class="header-font">{{ item.label }}</span>
              </div>
            </template>
            <template slot-scope="scope">
              <icon-file :item="scope.row"></icon-file>
            </template>
          </pl-table-column>
          <!--            name-->
          <pl-table-column v-if="index===2"
                           :key="index"
                           :index="index"
                           :show-overflow-tooltip="true"
                           max-width="200"
                           :prop="item.name"
                           :label="item.label"
                           :sort-orders="['ascending', 'descending']"
                           :sortable="item.sortable"
                           header-align="left">
            <template slot="header">
              <div v-if="item.label === ''" class="cancel-share-header">
                <span class="header-font">{{ sumFileAndFolder }}</span>
                <el-button icon="el-icon-refresh-left" size="small" @click.stop="restoreFile(null)">还原</el-button>
                <el-button type="error" icon="el-icon-delete" size="small" style="margin-left: 5px"
                           @click.stop="removeFile(null)">移除
                </el-button>
              </div>
            </template>
            <template slot-scope="scope">
              <span class="table-file-name">{{ scope.row.filename }}</span>
            </template>
          </pl-table-column>
          <pl-table-column v-if="index===3"
                           :key="index"
                           :index=index
                           max-width="100"
                           header-align="left"
                           :prop="item.name"
                           :label="item.label"
                           :sort-orders="['ascending', 'descending']"
                           :sortable="item.sortable">
            <template slot-scope="scope">
              <span class="table-file-name">{{ formatSize(scope.row.size) }}</span>
            </template>
          </pl-table-column>
          <pl-table-column v-if="index === 4" :key="index" width="100" :index="index" align="center"
                           header-align="center"
                           tooltip-effect="dark">
            <template slot-scope="scope">
              <el-row>
                <el-col :span="12">
                  <el-tooltip v-if="scope.row.index === cellMouseIndex" class="item" effect="dark" content="还原文件"
                              placement="top">
                    <svg-icon title="还原文件" v-if="scope.row.index === cellMouseIndex" class="button-class"
                              icon-class="refresh-left" @click="restoreFile(scope.row)"/>
                  </el-tooltip>
                </el-col>
                <el-col :span="12">
                  <el-tooltip v-if="scope.row.index === cellMouseIndex" class="item" effect="dark" content="移除文件"
                              placement="top" @click="restoreFile(scope.row)">
                    <svg-icon title="移除文件" v-if="scope.row.index === cellMouseIndex" class="button-class"
                              icon-class="file-remove" @click="removeFile(scope.row)"/>
                  </el-tooltip>
                </el-col>
              </el-row>
            </template>
          </pl-table-column>


          <pl-table-column v-if="index === 5"
                           :key="index"
                           width="250"
                           :prop="item.name"
                           :index="index"
                           :label="item.label"
                           :sort-orders="['ascending', 'descending']"
                           :sortable="item.sortable"
                           :show-overflow-tooltip="true"
                           align="center"
                           header-align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.deleteAt }}</span>
            </template>
          </pl-table-column>
          <pl-table-column v-if="index === 6"
                           :key="index"
                           width="250"
                           :prop="item.name"
                           :index="index"
                           :label="item.label"
                           :show-overflow-tooltip="true"
                           align="center"
                           header-align="center">
            <template slot-scope="scope">
              <span>{{ formatExpireAt(scope.row.expireAt) }}</span>
            </template>
          </pl-table-column>
        </template>
      </pl-table>
    </div>
    <empty-file
      v-if="fileList.length < 1 && !tableLoading"
      emptyStatus="回收站空空如也~"
      :emptyShare="true">
    </empty-file>
  </div>
</template>

<script>
import ShowFile from "@/components/ShowFile/ShowFile";
import SvgIcon from "@/components/SvgIcon/Icon"
import EmptyFile from "@/components/EmptyFile";
import IconFile from "@/components/SvgIcon/IconFile";
import 'pl-table/themes/index.css';
import {PlTable, PlTableColumn} from 'pl-table';
import api from '@/api/file'
import '@/utils/number'
import {formatExpireAt, formatSize} from '@/utils/number'

export default {
  name: "RecycleBin",
  components: {PlTable, PlTableColumn, ShowFile, EmptyFile, IconFile, SvgIcon},
  props: {
    sortable: {
      'type': Object,
      'default': function () {
        return {prop: 'delete_at', order: 'descending'}
      }
    }
  },
  data() {
    return {
      tableLoading: false,
      pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0,
        pageSizes: [10, 20, 30, 40, 50]
      },
      fileList: [],
      indexList: [],
      clientHeight: 500,
      // 表头数据
      tableHead: [
        {
          name: '', label: '', index: 0
        },
        {
          name: 'icon', label: '', index: 1
        },
        {
          name: 'filename', label: '文件名', sortable: 'custom', index: 2
        },
        {
          name: 'size', label: '大小', sortable: 'custom', index: 3,
        },
        {
          name: '', label: '', more: true, index: 4
        },
        {
          name: 'delete_at', label: '删除时间', sortable: 'custom', index: 5
        },
        {
          name: 'expire_at', label: '过期时间', sortable: 'custom', index: 6
        }
      ],
      rowContextData: {},
      selectRowData: [],
      finished: false,
      editingIndex: -1,
      cellMouseIndex: -1,
      sumFileAndFolder: '',
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
    formatExpireAt(expireAt) {
      return formatExpireAt(expireAt)
    },
    formatSize(size) {
      return formatSize(size)
    },
    // cell-style 通过返回值可以实现样式变换利用传递过来的数组index循环改变样式
    rowRed({row, column, rowIndex, columnIndex}) {
      if (this.indexList.length < 1 && columnIndex === 2 && this.cellMouseIndex === rowIndex) {
        return {cursor: 'pointer', color: "#19ACF9"}
      }
      for (let i = 0; i < this.indexList.length; i++) {
        if (rowIndex === this.indexList[i]) {
          return {backgroundColor: '#EBEEF5', color: '#b7b5b6', cursor: 'default'}
        }
      }
    },
    // 动态添加index到row里面去
    tableRowClassName({row, rowIndex}) {
      row.index = rowIndex
    },
    // 统计文件和文件夹
    getShowSumFileAndFolder(fileList) {
      let folderSize = 0
      let fileSize = 0
      fileList.forEach((fileInfo) => {
        if (fileInfo.isFolder) {
          folderSize += 1
        } else {
          fileSize += 1
        }
      })
      let folderSum = ''
      if (folderSize > 0) {
        folderSum = folderSize + '个文件夹'
      }
      let fileSum = ''
      if (fileSize > 0) {
        fileSum = fileSize + '个文件'
      }
      return folderSum + ' ' + fileSum
    },
    // 单元格hover进入时时间
    cellMouseEnter(row) {
      if (this.editingIndex === -1) {
        if (this.indexList.length < 1) {
          this.cellMouseIndex = row.index
        }
      }
    },
    // 单元格hover退出时时间
    cellMouseLeave() {
      this.cellMouseIndex = -1
    },
    // 单元格点击事件
    cellClick(row, column) {
      if (this.editingIndex === -1) {
        const columnIndex = column.index
        if (columnIndex === 0) {
          // 点击选中
          this.$refs.fileListTable.toggleRowSelection(row)
        }
        if (columnIndex === 2) {
          if (this.indexList.length < 1) {
            if (row.index !== this.editingIndex) {
              this.fileClick(row)
              this.editingIndex = -1
            }
          }
        }
        if (columnIndex === 4) {
          // // 单个操作
        }
        if (this.indexList.length > 0 && columnIndex > 0) {
          this.$refs.fileListTable.toggleRowSelection(row)
        }
      }
    },
    handleSelectionChange(row) {
      // 选中的值
      this.selectRowData = row
      let selectTotalSize = 0
      this.indexList = []
      for (const item of row) {
        selectTotalSize += item.size
        this.indexList.push(item.index)
      }
      row.forEach(r => {
        this.$refs.fileListTable.toggleRowSelection(r, true)
      });
      this.$refs.fileListTable.tableSelectData = row
      const itemIcon = this.tableHead[1]
      const itemName = this.tableHead[2]
      const itemSize = this.tableHead[5]
      const itemDate = this.tableHead[6]
      if (this.selectRowData.length > 0) {
        this.sumFileAndFolder = this.getShowSumFileAndFolder(row)
        itemIcon.label = '已选中'
        itemName.label = ''
        itemName.sortable = false
        itemSize.label = ''
        itemSize.sortable = false
        itemDate.label = ''
        itemDate.sortable = false
      } else {
        itemIcon.label = ''
        itemName.label = '文件名'
        itemName.sortable = 'custom'
        itemSize.label = '删除时间'
        itemSize.sortable = 'custom'
        itemDate.label = '过期时间'
        itemDate.sortable = 'custom'
      }
    },
    sortChange(column) {
      this.sortable.prop = column.prop
      this.sortable.order = column.order
      this.pagination.pagenum = 1
      this.getFileList();
    },
    fileClick(row) {

    },
    tableBodyScroll(table, e) {
      this.fileListScrollTop = e.target.scrollTop
      let scrollBottom = e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
      if (scrollBottom < 200) {
        if (!this.finished) {
          this.getFileList(true)
        }
      }
    },
    // 请求之前的准备
    beforeLoadData(onLoad) {
      if (onLoad) {
        this.pagination.pageNum++
      } else {
        this.pagination.pageNum = 1
      }
      this.tableLoading = true
      this.finished = false
    },
    getFileList(onLoad) {
      this.beforeLoadData(onLoad)
      api.deletedFileList({
        userId: this.$store.state.user.userId,
        sortProp: this.sortable.prop,
        sortOrder: this.sortable.order,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }).then(res => {
        if (onLoad) {
          res.data.list.forEach((file, number) => {
            file['index'] = (this.pagination.pageIndex - 1) * this.pagination.pageSize + number
            this.fileList.push(file)
          })
        } else {
          this.fileList = res.data.list
          this.fileList.map((item, index) => {
            item.index = index
          })
          this.$refs.fileListTable.reloadData(this.fileList)
        }
        if (this.fileList.length >= res.data.total) {
          this.finished = true;
        }
        this.tableLoading = false
        this.clientHeight = document.documentElement.clientHeight - 80
        this.pagination['total'] = res.data.total
        this.$nextTick(() => {
          this.tableLoading = false
        })
      }).catch(e => {
      })
    },
    removeFile(row) {
      let fileIds = []
      if (row) {
        fileIds.push(row.fileId)
        this.$refs.fileListTable.tableSelectData.push(row)
      } else {
        this.selectRowData.forEach(row => {
          fileIds.push(row.fileId)
        })
      }
      this.$confirm(`文件删除后将无法恢复，您确认要彻底删除所选文件吗？`, '彻底删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.removeFile({
          'userId': this.$store.state.user.userId,
          'fileIds': fileIds,
        }).then(res => {
          this.removeSelectItem()
        }).then(()=>{
          this.$notify({
            title: '彻底删除成功',
            type: 'success',
            duration: 1000
          })
        })
      })
    },
    restoreFile(row) {
      let fileIds = []
      if (row) {
        fileIds.push(row.fileId)
        this.$refs.fileListTable.tableSelectData.push(row)
      } else {
        this.selectRowData.forEach(row => {
          console.log(row)
          fileIds.push(row.fileId)
        })
      }
      this.$confirm(`确认还原选中的文件？`, '确认还原', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        api.restoreFile({
          'userId': this.$store.state.user.userId,
          'fileIds': fileIds,
        }).then(res => {
          this.removeSelectItem()
        }).then(()=>{
          this.$notify({
            title: '还原成功',
            type: 'success',
            duration: 1000
          })
        })
      })
    },
    // 移除选中项
    removeSelectItem() {
      let removeFileIndexList = []
      if (this.$refs.fileListTable.tableSelectData.length > 0) {
        this.$refs.fileListTable.tableSelectData.forEach(item => {
          let fileIndex = this.fileList.findIndex(file => file.fileId === item.fileId)
          if (fileIndex > -1) {
            removeFileIndexList.push(fileIndex)
          }
        })
      }
      // 先清空之前选择的数据
      this.$refs.fileListTable.doLayout()
      this.$refs.fileListTable.clearSelection()
      this.$refs.fileListTable.tableSelectData = []
      // 倒序
      removeFileIndexList = removeFileIndexList.sort((a, b) => b - a)
      const that = this
      setTimeout(function () {
        // 再执行移除
        for (let i = 0; i < removeFileIndexList.length; i++) {
          that.fileList.splice(removeFileIndexList[i], 1)
        }
      }, 300)
    },
  }
}
</script>


<style lang="scss" scoped>
@import "src/styles/home-index";

.container {
  min-width: 1024px;
}

.cancel-share-header {
  margin-left: -10px;
}

.table-header-icon {
  font-size: 18px;
}

.header-font {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

/deep/ .el-icon-my-export {
  background: url('~@/assets/image/cancel-share.png') center no-repeat;
  background-size: cover;
}

/deep/ .el-icon-my-export:before {
  content: "替";
  font-size: 16px;
  visibility: hidden;
}

//如果直接使用字体图片
//直接在before属性设置对应的content就行
/deep/ .el-icon-my-export {
  font-size: 16px;
}

/deep/ .el-icon-my-export:before {
  content: "\66ff";
  font-size: 16px;
  visibility: hidden;
}

/deep/ .plTableBox .el-table .el-table__header th {
  background-color: #FFFFFF;
}

/deep/ .el-table td {
  height: 50px !important;
}
</style>
