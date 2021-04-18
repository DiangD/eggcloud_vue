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
          <!--        index-->
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
                           @click.stop="fileClick"
                           header-align="left">
            <template slot="header">
              <div v-if="item.label === ''" class="cancel-share-header">
                <span class="header-font">{{ sumFileAndFolder }}</span>
                <el-button icon="el-icon-my-export" size="small" @click="cancelShare(false)">取消分享</el-button>
              </div>
            </template>
            <template slot-scope="scope">
              <span class="table-file-name">{{ scope.row.filename }}</span>
            </template>
          </pl-table-column>
          <!--        取消分享-->
          <pl-table-column v-if="index === 4" :key="index" width="50" :index="index" align="center"
                           header-align="center"
                           tooltip-effect="dark">
            <template slot-scope="scope">
              <el-tooltip v-if="scope.row.index === cellMouseIndex" class="item" effect="dark" content="取消分享"
                          placement="top">
                <svg-icon title="分享" v-if="scope.row.index === cellMouseIndex" class="button-class"
                          icon-class="cancel-share" @click="cancelShare(scope.row)"/>
              </el-tooltip>
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
              <span>{{ scope.row.createAt }}</span>
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
              <span>{{ scope.row.expireAt ? scope.row.expireAt : '永久有效' }}</span>
            </template>
          </pl-table-column>
        </template>
      </pl-table>
    </div>
    <el-dialog :title="'分享:'+shareFilename" :visible.sync="visibleShareDialog" center>
      <div v-loading="generateShareLinkLoading">
        <el-input readonly v-model="shareLink"></el-input>
        <div slot="footer" class="dialog-footer share-dialog-footer">
          <el-button type="primary" class="tag-share-link" @click="copyShareLink"
                     :data-clipboard-text="shareLink">复制链接
          </el-button>
        </div>
      </div>
    </el-dialog>

    <empty-file
      v-if="fileList.length < 1 && !tableLoading"
      emptyStatus="还没有分享历史哦~"
      :emptyShare="true">
    </empty-file>
  </div>
</template>

<script>
import ShowFile from "@/components/ShowFile/ShowFile";
import EmptyFile from "@/components/EmptyFile";
import IconFile from "@/components/SvgIcon/IconFile";
import 'pl-table/themes/index.css';
import {PlTable, PlTableColumn} from 'pl-table';
import Clipboard from "clipboard";
import api from '@/api/file'


export default {
  name: "share",
  components: {
    PlTable, PlTableColumn, ShowFile, EmptyFile, IconFile
  },
  props: {
    sortable: {
      'type': Object,
      'default': function () {
        return {prop: 'create_at', order: 'descending'}
      }
    },
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
          name: 'filename', label: '分享文件', sortable: 'custom', index: 2
        },
        {
          name: '', label: '', index: 3
        },
        {
          name: '', label: '', more: true, index: 4
        },
        {
          name: 'create_at', label: '创建时间', sortable: 'custom', index: 5
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
      shareFilename: '',
      visibleShareDialog: false,
      generateShareLinkLoading: false,
      shareLink: '',
    }
  },
  mounted() {
  },
  created() {
  },
  methods: {
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
    // 收集选中的index值作为数组 传递给rowRed判断变换样式
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
        itemName.label = '分享文件'
        itemName.sortable = 'custom'
        itemSize.label = '时间'
        itemSize.sortable = 'custom'
        itemDate.label = '过期时间'
        itemDate.sortable = 'custom'
      }
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
    sortChange(column) {
      this.sortable.prop = column.prop
      this.sortable.order = column.order
      this.pagination.pagenum = 1
      this.getFileList();
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
      api.shareList({
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

    fileClick(row) {
      this.visibleShareDialog = true
      this.shareFilename = row.filename
      this.shareLink = `链接:${window.location.origin}/s?s=${row.accessKey}`
      if (row.hasVerify && row.code) {
        this.shareLink = `${this.shareLink},提取码:${row.code}`
      }
      this.generateShareLinkLoading = false;
    },
    cancelShare(row) {
      let accessKeys = []
      if (row) {
        accessKeys.push(row.accessKey)
        this.$refs.fileListTable.tableSelectData.push(row)
      } else {
        this.selectRowData.forEach(row => {
          accessKeys.push(row.accessKey)
        })
      }
      this.$confirm(`取消分享后，该条分享记录将被删除，用户将无法再访问此分享链接。 您确认要取消分享吗？`, '确认取消分享', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.cancelShare({
          userId: this.$store.state.user.userId,
          accessKeys: accessKeys
        }).then(() => {
          // if (accessKeys.length === 1) {
          //   this.fileList.splice(row.index, 1)
          // } else {
          //   this.getFileList()
          // }
          this.removeSelectItem()
        }).then(() => {
          this.$notify({
            title: '取消成功',
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
          let fileIndex = this.fileList.findIndex(file => file.accessKey === item.accessKey)
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
    copyShareLink() {
      let clipboard = new Clipboard('.tag-share-link')
      clipboard.on('success', e => {
        this.$message({
          message: '复制成功',
          type: 'success',
          duration: 1000
        });
        this.visibleShareDialog = false
        clipboard.destroy()
      })

      clipboard.on('error', e => {
        // 不支持复制
        this.$message({
          message: '该浏览器不支持自动复制',
          type: 'warning',
          duration: 1000
        });
        // 释放内存
        clipboard.destroy()
      })
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
