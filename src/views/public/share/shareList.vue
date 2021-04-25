<template>
  <div class="dashboard-container" v-resize="containerResize">
    <div class="share-h">
      <div class="share-header">
        <a href="">
          <div class="share-header-content">
            <svg-icon icon-class="egg-cloud"/>
            <span>EggCloud</span>
          </div>
        </a>
      </div>
      <el-divider class="header-location"></el-divider>
      <el-breadcrumb class="app-breadcrumb" separator="" v-if="!linkFailed">
        <transition-group name="breadcrumb">
          <el-breadcrumb-item v-for="(item,index) in pathList" :key="item.index">
            <span v-if="index===0">当前位置:</span>
            <breadcrumb-file-path :pathList="pathList" :item="item" :index="index"
                                  @clickLink="handleLink"></breadcrumb-file-path>
          </el-breadcrumb-item>
        </transition-group>
        <div class="search-content">
          <div class="search-class">
            <el-button v-if="indexList.length > 0" type="text" @click="downloadFile" class="sort" title="下载">
              <svg-icon icon-class="menu-download"/>
            </el-button>
            <el-button type="text" class="vmode" @click="changeVmode">
              <svg-icon :icon-class="grid ? 'list' : 'grid'"/>
            </el-button>
          </div>
        </div>
      </el-breadcrumb>
    </div>
    <!--右键菜单-->
    <e-vue-contextmenu ref="contextShow" class="newFileMenu" :class="menuTriangle" @ctx-show="show" @ctx-hide="hide">
      <div class="popper-arrow"></div>
      <ul v-for="item in menus" :key="item.label">
        <li class="menu-option" @click="menusOperations(item.operation)">
          <label class="menuitem">
            <svg-icon :icon-class="item.iconClass"/>
            <span class="menuitem text">{{ item.label }}</span>
          </label>
        </li>
      </ul>
    </e-vue-contextmenu>
    <!--    list-->
    <el-table
      v-show="!grid &&!linkFailed"
      ref="fileListTable"
      v-loading="tableLoading"
      style="width: 100%;margin: 20px 0 0 0;"
      empty-text="无文件"
      :data="fileList"
      row-key="id"
      :summary-method="getSummaries"
      show-summary
      :cell-style="rowRed"
      :row-class-name="tableRowClassName"
      element-loading-text="文件加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="#f6f7fa88"
      @selection-change="handleSelectionChange"
      @row-contextmenu="rowContextmenu"
      @cell-click="cellClick"
      @cell-mouse-enter="cellMouseEnter"
      @cell-mouse-leave="cellMouseLeave">
      <template v-for="(item,index) in tableHead">
        <el-table-column
          v-if="index === 0"
          :key="index"
          :index="index"
          type="selection"
          min-width="50"
        >
        </el-table-column>
        <el-table-column
          v-if="index === 1"
          :key="index"
          :index="index"
          width="50"
        >
          <template slot-scope="scope">
            <icon-file :item="scope.row" :access-key="accessKey"></icon-file>
          </template>
        </el-table-column>

        <el-table-column
          v-if="index === 2"
          :key="index"
          :show-overflow-tooltip="true"
          max-width="200"
          :index="index"
          :prop="item.name"
          :label="item.label"
          :sortable="item.sortable"
          @click.stop="fileClick(scope.row)"
        >
          <template slot-scope="scope">
            <el-col v-if="scope.row.index === editingIndex" :span="10">
            </el-col>
            <span v-else class="table-file-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column v-if="index === 3  && showUpdateDateItem" :key="index" width="50" :index="index" align="center"
                         header-align="center">
        </el-table-column>

        <el-table-column v-if="index === 4 && showUpdateDateItem" :key="index" width="50" :prop="item.name"
                         :label="item.label" :index="index" class="el-icon-more" align="center" header-align="center">
          <!-- 使用组件, 并传值到组件中 -->
          <template slot="header">
            <svg-icon v-if="item.name !== ''" class="button-class" icon-class="more" @click="moreOperation($event)"/>
          </template>
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.index === cellMouseIndex" class="button-class" icon-class="more"
                      @click="moreClick(scope.row,$event)"/>
          </template>
        </el-table-column>

        <el-table-column
          v-if="index === 5 && showSizeItem"
          :key="index"
          width="200"
          :prop="item.name"
          :index="index"
          :label="item.label"
          :sortable="item.sortable"
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
        >
          <template slot-scope="scope">
            <span>{{ formatSize(scope.row.size) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          v-if="index === 6 && showUpdateDateItem"
          :key="index"
          width="300"
          :prop="item.name"
          :index="index"
          :label="item.label"
          :sortable="item.sortable"
          :show-overflow-tooltip="true"
          align="left"
          header-align="left"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.modifyAt }}</span>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div v-if="linkFailed" class="share-header">
      <p v-if="prompt !== ''">温馨提示：</p>
      <p>{{prompt}}</p>
    </div>
    <image-viewer :fileList="fileList" :access-key="accessKey" :file="imagePreviewRow"
                  :status.sync="imagePreviewVisible"></image-viewer>
    <video-preview :file="videoPreviewRow" :access-key="accessKey" :status.sync="videoPreviewVisible"></video-preview>

    <el-pagination
      background
      layout="prev, pager, next"
      :hide-on-single-page="true"
      :current-page.sync="pagination.pageNum"
      :page-sizes="pagination.pageSizes"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      @current-change="currentChange">
    </el-pagination>
  </div>
</template>

<script>
import BreadcrumbFilePath from "@/components/Breadcrumb/BreadcrumbFilePath";
import IconFile from "@/components/SvgIcon/IconFile";
import Bus from "@/assets/js/Bus";
import api from '@/api/file';
import {formatSize} from "@/utils/number";
import fileConfig from '@/utils/file-config'
import Clipboard from "clipboard";
import ImageViewer from "@/components/preview/ImageViewer";
import VideoPreview from "@/components/preview/VideoPreview";
import AudioPreview from "@/components/preview/AudioPreview";


export default {
  name: "shareList",
  components: {BreadcrumbFilePath, IconFile, ImageViewer, VideoPreview, AudioPreview},
  data() {
    return {
      prompt: '文件分享已被撤销',// 文件分享已被撤销
      pathList: [],
      fileList: [],
      pagination: {
        fileId: false,
        pageNum: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 30, 40, 50]
      },
      indexList: [],
      clientHeight: 500,
      // 表头数据
      tableHead: [
        {
          name: '', label: '', index: 0
        },
        {
          name: '', label: '', index: 1
        },
        {
          name: 'name', label: '名称', sortable: false, index: 2
        },
        {
          name: '', label: '', index: 3
        },
        {
          name: '', label: '', more: true, index: 4
        },
        {
          name: 'size', label: '大小', sortable: false, index: 5
        },
        {
          name: 'modify_at', label: '修改日期', sortable: false, index: 6
        }
      ],
      isJustHideMenus: false,
      menusIsMultiple: false,
      menus: [],
      singleMenus: [
        {iconClass: 'menu-open', label: '打开', operation: 'open'},
        {iconClass: 'menu-download', label: '下载', operation: 'download'},
        {iconClass: 'menu-copy', label: '复制下载链接', operation: 'copyDownloadUrl'},
      ],
      singleMenusEdit: [
        {iconClass: 'menu-open', label: '打开', operation: 'open'},
        {iconClass: 'menu-download', label: '下载', operation: 'download'},
        {iconClass: 'menu-copy', label: '复制下载链接', operation: 'copyDownloadUrl'},
      ],
      multipleMenus: [
        {iconClass: 'menu-download', label: '下载', operation: 'download'},
      ],
      multipleRightMenus: [
        {iconClass: 'menu-download', label: '下载', operation: 'download'},
      ],
      rowContextData: {},
      selectRowData: [],
      tableLoading: false,
      menuTriangle: '', // 三角菜单
      cellMouseIndex: -1,
      editingIndex: -1,
      accessKey: this.$route.query.s,
      verifyCode: null,
      linkFailed: false,
      grid: false,
      vmode: 'list',
      allChecked: false,
      currentDirName: '',
      showUpdateDateItem: this.$pc,// 列表模式下是否显示修改时间
      showSizeItem: this.$pc,// 列表模式下是否显示文件大小

      imagePreviewRow: {},
      imagePreviewVisible: false,
      videoPreviewRow: {},
      videoPreviewVisible: false,
      audioPreviewRow: {},
      audioPreviewVisible: false,
    }
  },
  created() {
    this.getFileList()
  },
  mounted() {
    Bus.$on('fileSuccess', () => {
      this.getFileList()
    })
    Bus.$on('clickMore', (selectRowData) => {
      this.selectRowData = selectRowData
      this.preliminaryRowData()
    })
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }


    const that = this
    window.onresize = function () {
      that.loadClientHeight()
    }
    // 加载布局
    if (this.$route.query.vmode) {
      this.vmode = this.$route.query.vmode
      this.grid = this.vmode !== 'list';
    }
  },
  destroyed() {
    window.removeEventListener('popstate', this.goBack, false)
  },
  directives: {
    resize: { // 指令的名称
      bind(el, binding) { // el为绑定的元素，binding为绑定给指令的对象
        let width = '', height = '';

        function isReize() {
          const style = document.defaultView.getComputedStyle(el);
          if (width !== style.width || height !== style.height) {
            binding.value();  // 关键
          }
          width = style.width;
          height = style.height;
        }

        el.__vueSetInterval__ = setInterval(isReize, 300);
      },
      unbind(el) {
        clearInterval(el.__vueSetInterval__);
      }
    }
  },
  methods: {
    loadClientHeight() {
      this.clientHeight = document.documentElement.clientHeight - 200
    },
    containerResize(f) {
      let clientWidth = document.querySelector(".dashboard-container").clientWidth
      if (clientWidth > 1024) {
        this.gridColumnNum = Math.round(clientWidth / 100 - 4)
      } else {
        this.gridColumnNum = Math.round(clientWidth / 100 - 2)
        if (clientWidth < 500) {
          this.gridColumnNum = 3
        }
      }
    },
    // 浏览器的返回事件
    goBack() {
      const linkIndex = this.pathList.length - 3
      this.handleLink(this.pathList[linkIndex], linkIndex)
    },
    handleLink(item, index) {
      if (index === 0) {
        this.pathList.splice(this.pathList.findIndex((v, i) => i === index + 1), this.pathList.length - (index + 1))
        this.getFileList(null, true);
        this.$router.push(`/s?s=${this.accessKey}&vmode=${this.vmode}`)
      }
      if (item && item.fileId) {
        this.accessShareOpenDir(item.fileId)
        this.pathList.splice(this.pathList.findIndex((v, i) => i === index + 1), this.pathList.length - (index + 1))
      }
    },
    formatSize(size) {
      return formatSize(size)
    },
    // 切换布局
    changeVmode() {
      this.grid = !this.grid
      this.vmode = 'list'
      if (this.grid) {
        this.vmode = 'grid'
      }
      this.$router.push(`/s?s=${this.accessKey}&vmode=${this.vmode}`)
    },
    show() {
    },
    hide() {
      const that = this
      this.isJustHideMenus = true
      setTimeout(function () {
        that.isJustHideMenus = false
      }, 100)
    },
    // 菜单操作
    menusOperations(operation) {
      switch (operation) {
        case 'open':
          this.fileClick(this.rowContextData)
          break
        case 'download':
          this.downloadFile()
          break
        case 'copyDownloadUrl':
          this.downloadFile(true)
          break
      }
      this.$refs.contextShow.hideMenu()
    },
    getSummaries(param) {
      // 合计
      const sums = []
      sums[2] = this.getShowSumFileAndFolder(this.fileList)
      this.summaries = sums[2]
      return sums
    },
    getShowSumFileAndFolder(fileList) {
      let folderSize = 0
      let fileSize = 0
      let totalSize = 0
      fileList.forEach((fileInfo) => {
        if (fileInfo.isFolder) {
          folderSize += 1
        } else {
          fileSize += 1
        }
        totalSize += fileInfo.size
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

      const item_name = this.tableHead[2]
      const item_more = this.tableHead[4]
      const item_size = this.tableHead[5]
      const item_date = this.tableHead[6]
      if (this.selectRowData.length > 0) {
        const sumFileAndFolder = this.getShowSumFileAndFolder(row)
        const sizeSum = this.getShowSumSize(selectTotalSize)
        item_name.label = sumFileAndFolder
        item_name.sortable = false
        item_more.name = 'more'
        item_size.label = sizeSum
        item_size.sortable = false
        item_date.label = ''
        item_date.sortable = false
        this.menusIsMultiple = true
        this.rowContextData = row[0]
      } else {
        item_name.label = '名称'
        item_name.sortable = true
        item_more.name = ''
        item_size.label = '大小'
        item_size.sortable = true
        item_date.label = '修改日期'
        item_date.sortable = true
      }
      this.allChecked = this.indexList.length === this.fileList.length;
    },
    // cell-style 通过返回值可以实现样式变换利用传递过来的数组index循环改变样式
    rowRed({row, column, rowIndex, columnIndex}) {
      if (this.indexList.length < 1 && columnIndex === 2 && this.cellMouseIndex === rowIndex) {
        return {cursor: 'pointer', color: "#19ACF9"}
      }
      for (let i = 0; i < this.indexList.length; i++) {
        if (rowIndex === this.indexList[i]) {
          return {backgroundColor: '#f5f7fa', color: '#b7b5b6', cursor: 'default'}
        }
      }
    },
    // 动态添加index到row里面去
    tableRowClassName({row, rowIndex}) {
      row.index = rowIndex
    },
    // 选择某行预备数据
    preliminaryRowData(row) {
      if (row) {
        this.rowContextData = row
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
    // 鼠标右击
    rowContextmenu(row) {
      if (this.indexList.includes(row.index)) {
        this.menusIsMultiple = true
        this.menus = this.multipleRightMenus
      } else {
        this.menusIsMultiple = false
        if (row.contentType && row.contentType.includes("text")) {
          this.menus = this.singleMenusEdit
        } else {
          this.menus = this.singleMenus
        }
        this.preliminaryRowData(row)
      }
      event.preventDefault()
      this.menuTriangle = ''
      const e = {}
      e.pageX = event.pageX + 5
      e.pageY = event.pageY + 2
      e.clientX = event.clientX + 5
      e.clientY = event.clientY + 2
      this.$refs.contextShow.showMenu(event)
    },
    // 更多操作(多选)
    moreOperation(event) {
      this.menusIsMultiple = true
      this.menus = this.multipleMenus
      this.showOperationMenus(event)
    },
    // 显示操作菜单
    showOperationMenus(event) {
      const e = {}
      if (document.body.scrollHeight - event.pageY > 400) {
        this.menuTriangle = 'menu-triangle-top'
        e.pageX = event.pageX - 78
        e.pageY = event.pageY + 30
        e.clientX = event.clientX + 78
        e.clientY = event.clientY + 30
      } else {
        this.menuTriangle = 'menu-triangle-bottom'
        e.pageX = event.pageX - 78
        e.pageY = event.pageY - 350
        e.clientX = event.clientX + 78
        e.clientY = event.clientY - 350
      }
      if (!this.isJustHideMenus) {
        this.$refs.contextShow.showMenu(e)
      }
    },
    // 更多操作(单选)
    moreClick(row, event) {
      this.menusIsMultiple = false
      if (row.contentType && row.contentType.includes("text")) {
        this.menus = this.singleMenusEdit
      } else {
        this.menus = this.singleMenus
      }
      this.preliminaryRowData(row)
      this.showOperationMenus(event)
    },
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
    fileClick(row) {
      window.accessKey = this.accessKey
      if (row.isFolder) {
        const item = {}
        item['folder'] = row.name
        item['fileId'] = row.id
        item['index'] = this.pathList.length
        this.pathList.push(item)
        this.pagination.pageNum = 1
        this.$router.push(`/s?s=${this.accessKey}&vmode=${this.vmode}`)
        this.accessShareOpenDir(row.id)
      } else {
        if (row.contentType.startsWith('image')) {
          // 图片
          this.imagePreviewVisible = true
          this.imagePreviewRow = row
          return
        }
        if (row.contentType.indexOf('video') > -1) {
          // 视频文件
          this.videoPreviewVisible = true
          this.videoPreviewRow = row
          return
        }
        if (row.contentType.indexOf('audio') > -1) {
          // 音频文件
          Bus.$emit('onAddAudio', row, fileConfig.publicPreviewUrl(this.accessKey, row.id))
          return
        }
        let url = fileConfig.publicPreviewUrl(this.accessKey, row.id);
        window.open(url, '_blank')
      }
    },
    getFileList(pagination, overload) {
      this.tableLoading = true
      api.accessShare({
        accessKey: this.accessKey,
        code: this.verifyCode
      }).then(res => {
        let data = res.data
        if (res.status !== 200) {
          this.linkFailed = true
          this.prompt = res.message
        }
        if (data.hasVerify) {
            this.$prompt('请输入提取码','提取码',{
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              closeOnClickModal:false,
            }).then(({ value })=>{
              this.verifyCode = value
              this.getFileList(pagination,overload)
            }).catch(()=>{
              this.$message({
                type: 'info',
                message: '取消输入'
              });
              this.linkFailed = true
              this.tableLoading = false
            });
        } else {
          this.fileList = data;
          this.fileList.map((item, index) => {
            item.index = index
          });
          this.loadClientHeight();
          this.pagination['total'] = 1;
          this.$nextTick(() => {
            this.containerResize()
            this.tableLoading = false
            this.linkFailed = false
          });
          if (!pagination) {
            const pathList = this.fileList[0].path.split('/');
            this.currentDirName = pathList[pathList.length - 2]
          }
          this.$nextTick(() => {
            this.containerResize()
            this.tableLoading = false
            this.linkFailed = false
            if (!pagination) {
              // 打开文件夹
              const item = {}
              item['folder'] = this.currentDirName
              item['index'] = this.pathList.length
              if (!overload) {
                this.pathList.push(item)
              }
            }
          });
        }
      }).catch(() => {
        this.tableLoading = false
      })
    },
    accessShareOpenDir(folderId) {
      this.tableLoading = true
      api.accessShareOpenDir({
        folderId: folderId,
        accessKey: this.accessKey,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }).then(res => {
        let data = res.data
        this.fileList = data.list
        this.loadClientHeight()
        this.pagination.fileId = folderId
        this.pagination['total'] = data.total
        this.$nextTick(() => {
          this.containerResize()
          this.tableLoading = false
          this.linkFailed = false
        })
      }).catch(() => {
      })
    },
    currentChange(pageNum) {
      this.pagination.pageNum = pageNum
      if (this.pagination.fileId) {
        this.accessShareOpenDir(this.pagination.fileId)
      } else {
        this.getFileList(true)
      }
    },
    downloadFile(copy) {
      let fileIds = []
      if (this.indexList.length > 0) {
        this.selectRowData.forEach(item => {
          fileIds.push(item.id)
        })
      } else {
        fileIds.push(this.rowContextData.id)
      }
      if (fileIds.length <= 0) {
        this.$message({
          message: '所选文件为空',
          type: 'warning'
        });
        return;
      }
      console.log(this.rowContextData.isFolder)
      if (fileIds.length > 1 || this.rowContextData.isFolder) {
        if (copy) {
          this.copyDownloadLink(fileConfig.publicPackageDownloadUrl(this.accessKey, fileIds))
        } else {
          fileConfig.publicPackageDownload(this.accessKey, fileIds)
        }
        return;
      }
      if (copy) {
        this.copyDownloadLink(fileConfig.publicDownloadUrl(this.accessKey, this.rowContextData))
      } else {
        fileConfig.publicDownload(this.accessKey, this.rowContextData)
      }
    },
    // 复制下载连接
    copyDownloadLink(url) {
      let clipboard = new Clipboard('.menu-option', {
        text: function () {
          return url
        }
      })
      clipboard.on('success', e => {
        this.$message({message: '复制成功', type: 'success', duration: 1000});
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        // 不支持复制
        this.$message({message: '该浏览器不支持自动复制', type: 'warning', duration: 1000});
        clipboard.destroy()
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import "src/styles/home-index";
/*.el-breadcrumb {*/
/*margin: 50px;*/
.dashboard-container {
  min-width: 1024px;
  margin: 10px 0;
}

.header-location {
  display: block;
  height: 1px;
  width: 100%;
  margin: 0 0;
}

.search-class {
  padding: 3px;
}

.share-h {
  padding: 0 15px;
}

.share-header {
  height: 50px;
  text-align: center;
  margin-bottom: 10px;

  -webkit-display: flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;

  .share-header-content {
    display: flex;
    align-items: center;

    svg {
      font-size: 50px;
    }

    span {
      margin-left: 10px;
      font-size: 30px;
    }
  }

  .share-header-content:hover {
    cursor: pointer;
  }
}

/deep/ .el-table {
  &::before {
    width: auto;
  }

  .el-table__footer-wrapper {
    display: none;
  }
}

.grid-divider {
  height: 0;
  text-align: center;
  width: auto;

  /deep/ .el-divider__text {
  }

  /deep/ .el-divider__text.is-center {
    position: relative;
  }
}

.newFileMenu li > .menuitem > .text {
  margin-left: 10px;
}
</style>
