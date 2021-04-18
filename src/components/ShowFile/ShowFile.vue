<template>
  <div>
    <div class="dashboard-container" v-resize="containerResize">
      <v-contextmenu ref="homeContextMenu" :disabled="contextMenuDisabled">
        <div v-for="item of contextMenus" :key="item.operation">
          <!--          一级菜单-->
          <v-contextmenu-item v-if="!item.child" :divider="!!item.divider" @click="contextmenuClick(item.operation)">
            <svg-icon v-if="item.iconClass" :icon-class="item.iconClass"></svg-icon>
            {{ item.label }}
          </v-contextmenu-item>
          <v-contextmenu-submenu v-if="item.child" :title="item.label">
            <!-- 二级菜单 -->
            <div v-for="itemSecond of item.child" :key="itemSecond.operation">
              <v-contextmenu-item v-if="!itemSecond.child" :divider="!!itemSecond.divider"
                                  @click="contextmenuClick(itemSecond.operation)">
                <svg-icon v-if="itemSecond.iconClass" :icon-class="itemSecond.iconClass"></svg-icon>
                {{ itemSecond.label }}
              </v-contextmenu-item>
              <v-contextmenu-submenu v-if="itemSecond.child" :title="itemSecond.label">
              </v-contextmenu-submenu>
            </div>
          </v-contextmenu-submenu>
        </div>
      </v-contextmenu>

      <el-breadcrumb class="app-breadcrumb" separator="">
        <transition-group name="breadcrumb" v-if="showNavigation">
          <el-breadcrumb-item v-for="(item,index) in pathList" :key="item.folder+index">
            <el-tooltip v-if="index===0 && pathList.length>1 " class="item" effect="dark" content="返回上一级"
                        placement="top">
              <a @click.prevent="lastLink()">
                <svg-icon icon-class="back" style="font-size: 24px"/>&nbsp;
              </a>
            </el-tooltip>
            <el-tooltip v-if="index===0 && pathList.length > 2" class="item" effect="dark" content="根目录"
                        placement="top">
              <a class="home-link" @click.prevent="handleLink(item,index)">
                <svg-icon icon-class="home" style="font-size: 24px;"/>
              </a>
            </el-tooltip>
            <breadcrumb-file-path :pathList="pathList" :item="item" :index="index"
                                  @clickLink="handleLink"></breadcrumb-file-path>
          </el-breadcrumb-item>
        </transition-group>
        <div class="search-content">
          <div class="search-class">
            <el-popover v-show="showUploadButton" v-model="isShowNewFolder" placement="bottom" trigger="hover"
                        @click="showNewFolderClick" @after-leave="hideNewFolderName">
              <div class="newFileMenu" style="display: block;">
                <ul>
                  <li>
                    <label class="menuitem">
                      <svg-icon icon-class="file-upload"/>
                      <span class="menuitem text">{{ singleFileType !== '' ? singleFileType : '上传文件' }}</span>
                    </label>
                  </li>
                  <li v-if="singleFileType === ''">
                    <label class="menuitem">
                      <svg-icon icon-class="folder-upload"/>
                      <span class="menuitem text">上传文件夹</span>
                    </label>
                  </li>
                  <li v-if="singleFileType === ''">
                    <a href="#" class="menuitem">
                      <svg-icon icon-class="md"/>
                      <span class="menuitem text">写文章</span>
                    </a>
                  </li>
                  <li v-if="singleFileType === ''">
                    <a href="#" class="menuitem" @click.prevent="newFolder">
                      <svg-icon icon-class="folder-add"/>
                      <span class="menuitem text">新建文件夹</span>
                    </a>
                  </li>
                  <div v-show="showNewFolder" class="folder-name-form">
                    <el-input ref="newFolderName" v-model="newFolderName" placeholder="请输入文件夹名称" :clearable="true">
                      <el-button
                        slot="append"
                        v-loading="newFolderLoading"
                        element-loading-spinner="el-icon-loading"
                        element-loading-background="#f6f7fa88"
                        class="el-icon-right"
                        @click="newFolderNameClick">
                      </el-button>
                    </el-input>
                  </div>
                </ul>
              </div>
              <!--<el-button slot="reference" icon="el-icon-plus add-file-button" circle />-->
              <el-button type="primary" icon="el-icon-plus add-file-button" slot="reference"
                         style="margin-right: 5px"></el-button>
            </el-popover>
            <el-input v-show="showSearchButton" placeholder="搜索" v-model="searchFileName" :clearable="true"
                      @keyup.enter.native="searchFile(searchFileName)">
              <el-button slot="append" style="padding: 0" @click="searchFile(searchFileName)">
                <svg-icon icon-class="search"/>
              </el-button>
            </el-input>
            <el-dropdown size="medium" style="height: 40px;" @command="contextmenuClick">
              <el-button type="text" class="sort">
                <svg-icon icon-class="sort"/>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="orderName">
                  <span :class="{'al-file-sort-item': true, 'active': sortable.prop === 'name'}">
                    <i
                      :class="{'al-file-sort-item-icon': true, 'el-icon-top': sortable.order === 'ascending', 'el-icon-bottom': sortable.order === 'descending'}"></i>
                    <span>名称</span>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="orderSize">
                  <span :class="{'al-file-sort-item': true, 'active': sortable.prop === 'size'}">
                    <i
                      :class="{'al-file-sort-item-icon': true, 'el-icon-top': sortable.order === 'ascending', 'el-icon-bottom': sortable.order === 'descending'}"></i>
                    <span>大小</span>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="orderModifyAt">
                  <span :class="{'al-file-sort-item': true, 'active': sortable.prop === 'modify_at'}">
                    <i
                      :class="{'al-file-sort-item-icon': true, 'el-icon-top': sortable.order === 'ascending', 'el-icon-bottom': sortable.order === 'descending'}"></i>
                    <span>日期</span>
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button type="text" class="vmode" @click="changeVmode">
              <svg-icon :icon-class="grid ? 'menu-list' : 'menu-grid'"/>
            </el-button>
          </div>
        </div>
      </el-breadcrumb>
      <div>
        <!--统计信息-->
        <div class="info-statistics">
          <span v-if="tableLoading">获取更多数据...</span>
          <span v-if="!tableLoading">{{ !finished ? '已加载 ' + getSummary : '已全部加载 ' + getSummary }}</span>
        </div>
      </div>
      <e-vue-contextmenu ref="contextShow" class="newFileMenu" :class="menuTriangle" @ctx-show="show" @ctx-hide="hide">
        <div class="popper-arrow"></div>
        <ul v-for="(item,index) in menus" :key="item.label">
          <li
            @click="menusOperations(item.operation)"
          >
            <label class="menuitem">
              <svg-icon :icon-class="item.iconClass"/>
              <span class="menuitem text">{{ item.label }}</span>
            </label>
          </li>
        </ul>
      </e-vue-contextmenu>

      <div v-show="fileList.length>0" id="v-draw-rectangle"
           :style="{'width':'100%','height': clientHeight + 8 +'px'}">
        <!--      list布局-->
        <pl-table
          v-show="!grid"
          ref="fileListTable"
          v-loading="tableLoading"
          :max-height="clientHeight"
          :default-sort="sortable"
          :highlight-current-row="false"
          empty-text="无文件~"
          :use-virtual="true"
          :row-height="50"
          :border="false"
          :excess-rows="10"
          :pagination-show="false"
          style="width: 100%;margin: 20px 0 0 0;"
          :row-style="rowStyle"
          :height-change="false"
          :row-class-name="tableRowClassName"
          element-loading-text="文件加载中"
          element-loading-spinner="el-icon-loading"
          element-loading-background="#f6f7fa88"
          @selection-change="handleSelectionChange"
          @row-contextmenu="rowContextmenu"
          @cell-click="cellClick"
          @row-dblclick="dblclick"
          @cell-mouse-enter="cellMouseEnter"
          @cell-mouse-leave="cellMouseLeave"
          @sort-change="sortChange"
          @select="pinSelect"
          @table-body-scroll="tableBodyScroll"
          :summary-method="getSummaries"
        >
          <template v-for="(item,index) in tableHead">
            <!--            index-->
            <pl-table-column v-if="index===0&&!selectFile"
                             :key="index" :index="index" type="selection" min-width="50">
            </pl-table-column>
            <!--            icon-->
            <pl-table-column
              v-if="index===1"
              :key="index"
              :index="index" width="50">
              <template slot-scope="scope">
                <icon-file :item="scope.row"></icon-file>
              </template>
            </pl-table-column>
            <!--            name-->
            <pl-table-column v-if="index===2"
                             :key="index"
                             :index="index"
                             :prop="item.name"
                             :label="item.label"
                             :sort-orders="['ascending', 'descending']"
                             :sortable="item.sortable?(orderCustom?'custom':true):false">
              <template slot-scope="scope">
                <el-col v-if="scope.row.index === editingIndex" :span="10">
                  <el-input v-focus v-model="renameFilename" placeholder="" size="small" :clearable="true"
                            @focus="renameInputFocus($event,scope.row.extension)"
                            @keyup.enter.native="rowRename(renameFilename, scope.row)">
                  </el-input>
                  <el-button
                    v-loading="renameLoading"
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="#f6f7fa88"
                    class="el-icon-check"
                    @click="rowRename(renameFilename, scope.row)"
                  >
                  </el-button>
                  <el-button
                    element-loading-spinner="el-icon-loading"
                    element-loading-background="#f6f7fa88"
                    class="el-icon-close"
                    @click="editingIndex = -1"
                  >
                  </el-button>
                </el-col>
                <a v-else @click.stop="fileClick(scope.row)" class="table-file-name"><span>{{
                    scope.row.name
                  }}</span></a>
              </template>
            </pl-table-column>
            <pl-table-column v-if="index===3 && showShareItem" :key="index" width="50" :index="index"
                             align="center" header-align="center" tooltip-effect="dark">
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.index === cellMouseIndex" class="item" effect="light" content="分享"
                            placement="top">
                  <svg-icon title="分享" class="button-class" icon-class="share" @click.stop=""/>
                </el-tooltip>
              </template>
            </pl-table-column>
            <!--            更多-->
            <pl-table-column v-if="index===4 && showMoreItem" :key="index" :index="index" width="50" :prop="item.name"
                             :label="item.label" class="el-icon-more" align="center" header-align="center">
              <template slot="header">
                <svg-icon v-if="item.name !== ''" class="button-class" icon-class="more"
                          @click.stop="moreOperation($event)"/>
              </template>
              <template slot-scope="scope">
                <svg-icon v-if="scope.row.index === cellMouseIndex" class="button-class" icon-class="more"
                          @click.stop="moreClick(scope.row,$event)"/>
              </template>
            </pl-table-column>
            <!--文件大小-->
            <pl-table-column
              v-if="index === 5 && showSizeItem"
              :key="index"
              width="200"
              :prop="item.name"
              :index="index"
              :label="item.label"
              :sort-orders="['ascending', 'descending']"
              :sortable="item.sortable ? (orderCustom ?'custom':true) : false"
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
            >
              <template slot-scope="scope">
                <span>{{ formatSize(scope.row.size) }}</span>
              </template>
            </pl-table-column>

            <pl-table-column
              v-if="index === 6 && showUpdateDateItem"
              :key="index"
              width="250"
              :prop="item.name"
              :index="index"
              :label="item.label"
              :sort-orders="['ascending', 'descending']"
              :sortable="item.sortable ? (orderCustom ?'custom':true) : false"
              :show-overflow-tooltip="true"
              align="left"
              header-align="left"
            >
              <template slot-scope="scope">
                <el-tooltip class="item" effect="light" :content="scope.row.modifyAt" placement="top">
                  <span>&nbsp;&nbsp;&nbsp;{{ formatTime(scope.row.modifyAt) }}</span>
                </el-tooltip>
              </template>
            </pl-table-column>
          </template>
        </pl-table>
        <div v-show="grid" v-loading="tableLoading"
             element-loading-text="文件加载中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="#f6f7fa88">
          <div class="checkbox-group-header" v-show="!selectFile">
            <div class="select-operation">
              <van-checkbox class="grid-all-checkbox" @click="clickGridAllCheckBox" v-model="allChecked">
                {{ selectRowData.length > 0 ? '已选择 ' + this.tableHead[2].label : "选择" }}
              </van-checkbox>
              <div>
                <el-button class="select-operation-button" icon="el-icon-download" v-if="selectRowData.length > 0"
                           @click="downloadFile"
                >
                  下载
                </el-button>
                <el-button class="select-operation-button" icon="el-icon-share" v-if="selectRowData.length === 1"
                           @click="shareClick(selectRowData[0])"
                >
                  分享
                </el-button>
                <el-button class="select-operation-button" icon="el-icon-document-copy" v-if="selectRowData.length > 0"
                           @click="moveOrCopy">
                  移动或复制
                </el-button>
                <el-button class="select-operation-button" icon="el-icon-delete" v-if="selectRowData.length > 0"
                           type="danger" @click="deleteFile">
                </el-button>
              </div>
            </div>
            <el-divider style="transform: scaleY(0.5);"></el-divider>
          </div>

          <van-checkbox-group v-model="selectRowData" @change="handleSelectionChange" ref="checkboxGroup">
            <van-grid square :center="true" :column-num="gridColumnNum" :gutter="10" :border="false"
                      :style="{'width':'100%','max-height': clientHeight-45+'px','overflow':'auto'}">
              <van-grid-item v-for="(item,index) in fileList" ref="gridItem" :key="item.id">
                <div
                  class="grid-time van-grid-item__content van-grid-item__content--center van-grid-item__content--square"
                  :style="{
                  'background':  queryFileType === 'image' ? `url(${thumbnail(item)})`: selectRowData.includes(item)?'#caeaf991':'',
                  'background-size': 'cover',
                  'background-position': 'center',
                  'border': selectRowData.includes(item)?'solid 1px #409eff':'',
                  }"
                  @mouseover="gridItemHover(item,index)"
                  @mouseout="gridItemOut(item,index)"
                  @click="gridItemClick(item)"
                  @dblclick="fileClick(item)"
                  @contextmenu.prevent="rowContextmenu(item)">
                  <van-checkbox v-show="!selectFile" v-if="gridHoverItemIndex === index || selectRowData.includes(item)"
                                class="grid-item-checkbox" :name="item"
                                @click.stop="clickGridItemCheckBox(item,index)"/>
                  <div
                    :class="{'grid-item-icon':true, 'grid-item-icon-image': queryFileType === 'image' ? gridHoverItemIndex === index || selectRowData.includes(item) : false}">
                    <icon-file v-show="queryFileType !== 'image'" :item="item"
                               :grid="true"></icon-file>
                  </div>
                  <div
                    v-show="item.w && item.h && queryFileType === 'image' ? gridHoverItemIndex === index || selectRowData.includes(item) : false"
                    :class="{'grid-item-text': true, 'grid-item-text-image-size': queryFileType === 'image'}">
                    {{ item.w + ' x ' + item.h }}
                  </div>
                  <div
                    :title="item.name"
                    v-show="queryFileType === 'image' ? gridHoverItemIndex === index || selectRowData.includes(item) : true"
                    :class="{'grid-item-text': true, 'grid-item-text-image': queryFileType === 'image'}">
                    {{ item.name }}
                  </div>
                </div>
              </van-grid-item>
            </van-grid>
          </van-checkbox-group>


        </div>
      </div>


      <!--      空page-->
      <EmptyFile v-if="this.fileList.length<1 && !tableLoading" :empty-status="emptyStatus"></EmptyFile>
      <img id="dragImage" draggable="false" style="position: fixed;top: -100px;z-index: 99999"
           src="~@/assets/image/move-file.png" alt="">
    </div>
    <!--    move or copy dialog-->
    <el-dialog :title="titlePrefix+selectTreeNode.showName"
               :visible.sync="dialogMoveOrCopyVisible"
               @close="clearTreeNode">
      <el-tree ref="directoryTree"
               :data="directoryTreeData"
               node-key="id"
               :props="directoryTreeProps"
               :load="directoryTreeLoadNode"
               :highlight-current="true"
               :render-content="renderContent"
               :default-expanded-keys="['0']"
               hight="100"
               lazy
               @node-click="treeNodeClick"
               @node-expand="treeNodeExpand">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="fileTreeAndNewFolder"><i class="el-icon-folder-add"></i>&nbsp;&nbsp;新建文件夹
        </el-button>
        <el-button size="small" type="primary" @click="moveFileTree">移 动</el-button>
        <el-button size="small" type="primary" @click="copyFileTree">复制</el-button>
        <el-button size="small" @click="dialogMoveOrCopyVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!--    share dialog-->
    <el-dialog :title="`分享文件(夹)：${shareFilename}`"
               :visible.sync="dialogShareFileVisible" @close="closeFileShareForm">
      <div style="min-height: 200px">
        <div v-if="created" style="margin-bottom: 10px">
          <svg-icon icon-class="check"></svg-icon>
          <span style="color: #19ACF9">成功创建私密链接</span>
        </div>
        <el-form :model="fileShareForm" ref="fileShareForm">
          <el-form-item label="请选择有效期限" prop="mode" v-show="!created">
            <el-select v-model="fileShareForm.mode">
              <el-option v-for="(item) in fileShareExpires"
                         :key="item.key"
                         :value="item.id"
                         :label="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item prop="hasVerify" v-show="!created">
            <el-checkbox v-model="fileShareForm.hasVerify">生成提取码</el-checkbox>
          </el-form-item>
          <el-form-item prop="url" v-show="created">
            <el-input type="text" readonly v-model="fileShareForm.url"></el-input>
          </el-form-item>
          <el-form-item prop="code" label="提取码" v-show="created && fileShareForm.hasVerify">
            <el-input type="text" readonly v-model="fileShareForm.code"></el-input>
          </el-form-item>
          <el-form-item prop="expireAt" label="过期时间" v-show="created">
            <el-input type="text" readonly v-model="fileShareForm.expireAt"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" style="text-align: center">
        <el-button class="tag-share-link" round type="primary" v-if="created" @click="copyShareLink"
                   :data-clipboard-text="shareLinkText">复制链接
        </el-button>
        <el-button round type="primary" v-if="!created" @click="fileShare">创建分享链接</el-button>
      </div>
    </el-dialog>

    <image-viewer :fileList="fileList" :file="imagePreviewRow" :status.sync="imagePreviewVisible"></image-viewer>
    <VideoPreview :file="videoPreviewRow" :status.sync="videoPreviewVisible"></VideoPreview>
  </div>
</template>

<script>
import 'vant/lib/grid/style';
import 'vant/lib/grid-item/style';
import 'vant/lib/checkbox/style';
import 'vant/lib/checkbox-group/style';
import 'pl-table/themes/index.css';
import {PlTable, PlTableColumn} from 'pl-table';
import EmptyFile from '@/components/EmptyFile'
import IconFile from '@/components/SvgIcon/IconFile'
import Icon from '@/components/SvgIcon/Icon'
import BreadcrumbFilePath from '@/components/Breadcrumb/BreadcrumbFilePath'
import '@/utils/number'
import {formatSize, formatTime} from "@/utils/number";
import api from '@/api/file'
import Bus from '@/assets/js/Bus'
import Clipboard from 'clipboard';
import ImageViewer from "@/components/preview/ImageViewer";
import fileConfig from '@/utils/file-config'
import VideoPreview from "@/components/preview/VideoPreview";
import {ext} from "@/utils/file-type";


export default {
  name: "ShowFile",
  components: {
    PlTable,
    PlTableColumn,
    EmptyFile,
    IconFile,
    Icon,
    BreadcrumbFilePath,
    ImageViewer,
    VideoPreview
  },
  props: {
    selectFile: {
      type: Boolean,
      default: false
    },
    orderCustom: {
      'type': Boolean,
      'default': false
    },
    queryFileType: {
      'type': String,
      'default': null
    },
    contextMenus: {
      type: Array,
      default: () => {
      }
    },
    showNavigation: {
      'type': Boolean,
      'default': true,
    },
    showUploadButton: {
      type: Boolean,
      default: true,
    },
    singleFileType: {
      'type': String,
      'default': '',
    },
    showSearchButton: {
      type: Boolean,
      default: true
    },
    emptyStatus: {
      'type': String,
      'default': '空空如也~',
    },
    defaultGrid: {
      'type': Boolean,
      'default': true
    },
    sortable: {
      'type': Object,
      'default': function () {
        return {prop: '', order: null}
      }
    },
    showShareItem: {
      'type': Boolean,
      'default': true
    },
    showMoreItem: {
      'type': Boolean,
      'default': true
    },
    showSizeItem: {
      'type': Boolean,
      'default': true
    },
    showUpdateDateItem: {
      'type': Boolean,
      'default': true
    },
    lessClientHeight: {
      type: Number,
      default: 150,
    },
    singleMenus: {
      'type': Array,
      'default': function () {
        return [
          {iconClass: 'menu-open', label: '打开', operation: 'open'},
          {iconClass: 'share', label: '分享', operation: 'share'},
          {iconClass: 'menu-details', label: '详细信息', operation: 'details'},
          {iconClass: 'menu-rename', label: '重命名', operation: 'rename'},
          {iconClass: 'menu-copy', label: '移动或复制', operation: 'copy'},
          {iconClass: 'menu-download', label: '下载', operation: 'download'},
          {iconClass: 'menu-remove', label: '删除', operation: 'remove'}
        ]
      }
    },
    singleMenusEdit: {
      'type': Array,
      'default': function () {
        return [
          {iconClass: 'menu-open', label: '打开', operation: 'open'},
          {iconClass: 'share', label: '分享', operation: 'share'},
          {iconClass: 'menu-edit1', label: '编辑', operation: 'edit'},
          {iconClass: 'menu-details', label: '详细信息', operation: 'details'},
          {iconClass: 'menu-rename', label: '重命名', operation: 'rename'},
          {iconClass: 'menu-copy', label: '移动或复制', operation: 'copy'},
          {iconClass: 'menu-download', label: '下载', operation: 'download'},
          {iconClass: 'menu-remove', label: '删除', operation: 'remove'}
        ]
      }
    },
    multipleMenus: {
      'type': Array,
      'default': function () {
        return [
          {iconClass: 'menu-copy', label: '移动或复制', operation: 'copy'},
          {iconClass: 'menu-download', label: '下载', operation: 'download'},
          {iconClass: 'menu-remove', label: '删除', operation: 'remove'}
        ]
      }
    },
    multipleRightMenus: {
      'type': Array,
      'default': function () {
        return [
          {iconClass: 'menu-deselect', label: '取消选定', operation: 'deselect'},
          {iconClass: 'menu-copy', label: '移动或复制', operation: 'copy'},
          {iconClass: 'menu-download', label: '下载', operation: 'download'},
          {iconClass: 'menu-remove', label: '删除', operation: 'remove'}
        ]
      }
    },
  },
  data() {
    return {
      currentFolder: 0,
      pathList: [
        {'folder': '', 'id': ''},
      ],
      contextMenuDisabled: false,
      renameFilename: '',
      showNewFolder: false,
      isShowNewFolder: false,
      newFolderName: '',
      searchFileName: '',
      newFolderLoading: false,
      pagination: {
        pageNum: 1,
        pageSize: 50,
        total: 0,
        pageSizes: [10, 20, 30, 40, 50]
      },
      fileList: [],
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
          name: 'name', label: '名称', sortable: true, index: 2
        },
        {
          name: '', label: '', index: 3
        },
        {
          name: '', label: '', more: true, index: 4
        },
        {
          name: 'size', label: '大小', sortable: true, index: 5
        },
        {
          name: 'modify_at', label: '修改日期', sortable: true, index: 6
        }
      ],
      allChecked: false,
      contextmenuDisabled: false,
      menuTriangle: '', // 三角菜单
      titlePrefix: '',
      selectTreeNode: {},
      dialogMoveOrCopyVisible: false,
      directoryTreeData: [],
      directoryTreeProps: {
        label: 'name',
        children: 'children',
        isLeaf: 'isLeaf'
      },
      menus: [],
      isJustHideMenus: false,
      menusIsMultiple: false,
      rowContextData: {},
      editingIndex: -1,
      cellMouseIndex: -1,
      tableLoading: false,
      finished: false,
      renameLoading: false,
      grid: this.defaultGrid,
      vmode: this.defaultGrid ? 'grid' : 'list',
      gridColumnNum: -1,
      gridHoverItemIndex: -1,
      gridHoverIntermediate: -1,
      isCmd: false,// 是否按住了command键
      selectRowData: [],
      selectPin: false,
      selectOrigin: -1,// 选择起点(主要用于按住shift键多选)
      selectEnd: -1,// 选择终点
      dragElementList: [],
      drawFlag: false,
      fileListScrollTop: 0,
      openingFile: '',
      dialogShareFileVisible: false,
      fileShareExpires: [
        {id: 0, value: '永久有效'},
        {id: 1, value: '7天'},
        {id: 2, value: '1天'},
      ],
      shareFilename: '',
      fileShareForm: {
        fileId: null,
        mode: 1,
        hasVerify: 0,
        code: '',
        expireAt: '',
        url: '',
      },
      created: false,
      shareLinkText: '',

      imagePreviewRow: {},
      imagePreviewVisible: false,
      videoPreviewRow: {},
      videoPreviewVisible: false,

      notPreviewDialogVisible: false
    }
  },
  computed: {
    getSummary() {
      return this.fileList.length + '项 '
    },
  },
  created() {
  },
  destroyed() {
    window.removeEventListener('popstate', this.goBack, false);
  },
  mounted() {
    Bus.$on('fileSuccess', () => {

    })
    Bus.$on('clickMore', (rows) => {
      this.$refs.fileListTable.tableSelectData = rows
      this.preliminaryRowData()
    })
    Bus.$on('renameRow', (row) => {
      let index = this.fileList.findIndex((file) => file.name === row.oldName)
      if (index > -1) {
        let newRow = this.fileList[index]
        newRow.extension = row.extension
        newRow.name = row.name
        this.$refs.fileListTable.clearSelection()
      }
    })

    // 监听返回
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', this.goBack, false);
    }

    // 获取键盘事件
    window.addEventListener('keydown', event => {
      const isMac = navigator.platform.startsWith('Mac');
      const {key, c, keyCode, ctrlKey, metaKey} = event;
      this.isCmd = isMac && metaKey || !isMac && ctrlKey;
      // 按住shift建
      if (event.keyCode === 16 && event.shiftKey) {
        this.selectPin = true
      }
    })

    window.addEventListener('keyup', event => {

      const isMac = navigator.platform.startsWith('Mac');
      const {key, c, keyCode, ctrlKey, metaKey} = event;
      this.isCmd = isMac && metaKey || !isMac && ctrlKey;

      // 松开shift建
      if (event.keyCode === 16) {
        this.selectPin = false
      }
    })

    // 加载布局
    if (this.$route.query.vmode) {
      this.vmode = this.$route.query.vmode
      this.grid = this.vmode !== 'list';
    }
    // 加载currentFolderId
    if (this.$route.query.folder) {
      this.currentFolder = this.$route.query.folder
      if (this.currentFolder !== 0) {
        api.folderPrePath({
          userId: this.$store.getters.userId,
          folderId: this.currentFolder
        }).then(res => {
          let dirs = res.data
          if (dirs.length <= 0) {
            return
          }
          for (let dir of dirs) {
            let item = {'folder': dir.name, 'id': dir.id}
            this.pathList.push(item)
          }
        })
      }
    }
    let that = this
    window.onresize = function () {
      that.clientHeight = document.documentElement.clientHeight - that.lessClientHeight
    }

    // 画矩形选区
    this.drawRectangle()
  },
  directives: {
    // 注册一个局部的自定义指令 v-focus
    focus: {
      // 指令的定义
      inserted: function (el) {
        // 聚焦元素
        el.querySelector('input').focus()
      }
    },
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
    containerResize(ddd) {
      const container = document.querySelector(".dashboard-container")
      let clientWidth = container.clientWidth
      this.clientHeight = document.documentElement.clientHeight - this.lessClientHeight
      if (clientWidth > 1024) {
        this.gridColumnNum = this.queryFileType === 'image' ? Math.round(clientWidth / 100 - 5) : Math.round(clientWidth / 100 - 4)
      } else {
        this.gridColumnNum = this.queryFileType === 'image' ? Math.round(clientWidth / 100 - 3) : Math.round(clientWidth / 100 - 2)
        if (clientWidth < 768) {
          this.gridColumnNum = 3
        }
        if (clientWidth < 450) {
          this.gridColumnNum = 2
        }
      }
      if (clientWidth < 900) {
        this.showUpdateDateItem = false
      } else {
        this.showUpdateDateItem = true
      }
      if (clientWidth < 500) {
        this.showSizeItem = false
      } else {
        this.showSizeItem = true
      }
      this.rowDrop()
    },
    show() {
      const that = this
      this.contextMenuDisabled = true
      setTimeout(function () {
        that.contextMenuDisabled = false
      }, 1000)
    },
    hide() {
      const that = this
      this.isJustHideMenus = true
      setTimeout(function () {
        that.isJustHideMenus = false
      }, 100)
      this.cellMouseIndex = -1
    },
    // 全局右键菜单操作
    contextmenuClick(operation) {
      switch (operation) {
        case 'vmode-list':
          this.grid = true;
          this.changeVmode()
          break
        case 'vmode-grid':
          this.grid = false;
          this.changeVmode()
          break
        case 'orderName':
          this.sortChangeOfMenu('name', 2)
          break
        case 'orderSize':
          this.sortChangeOfMenu('size', 5)
          break
        case 'orderModifyAt':
          this.sortChangeOfMenu('modify_at', 6)
          break
        case 'refresh':
          this.getFileList()
          break
        case 'createTextFile':
          this.newTextFileName = this.getNewFileName(this.fileList, '未命名文件')
          this.newTextFileDialog = true
          this.$nextTick(() => {
            this.$refs.newTextFileName.focus()
            this.$refs.newTextFileName.select()
          })
          break
        case 'createMarkdownFile':
          this.newDocument()
          break
      }
    },
    showNewFolderClick() {
      this.isShowNewFolder = true
    },
    hideNewFolderName() {
      this.showNewFolder = false
      this.isShowNewFolder = false
    },
    // 浏览器的返回事件
    goBack() {
      if (this.pathList.length === 2) {
        this.$router.push(`/?vmode=${this.vmode}&folder=${this.currentFolder}`)
        return
      }
      const linkIndex = this.pathList.length - 3
      this.handleLink(this.pathList[linkIndex], linkIndex)
    },
    lastLink() {
      this.handleLink(this.pathList[this.pathList.length - 2], this.pathList.length - 2)
    },
    handleLink(item, index, unPushLink, unRefresh) {
      if (item && item.search) {
        if (item.searchKey) {
          this.searchFileByKeyWord(item.searchKey)
        } else if (item.row) {
          this.searchFileAndOpenDir(item.row)
        }
        this.pathList.splice(this.pathList.findIndex((v, i) => i === index + 1), this.pathList.length - (index + 1))
      } else {
        this.pathList.splice(this.pathList.findIndex((v, i) => i === index + 1), this.pathList.length - (index + 1))
        this.pathList.forEach((p, number) => {
          if (number === 0) {
            this.currentFolder = 0
          } else if (number === this.pathList.length) {
          } else {
            this.currentFolder = this.pathList[number].id
          }
        })
        if (!unPushLink) {
          if (!this.$route.query.folder) {
            this.$router.push(`?vmode=${this.vmode}&folder=${this.currentFolder}`)
          } else {
            this.$router.push(`?vmode=${this.vmode}&folder=${this.currentFolder}`)
          }
        }
        if (!unRefresh) {
          this.pagination.pageNum = 1
          this.getFileList()
        }
      }
    },
    // 加载菜单查看状态
    loadContextMenus() {
      if (this.contextMenus.length < 1) {
        this.contextmenuDisabled = true
        return
      }
      let container = document.querySelector('.dashboard-container')
      if (this.$refs.homeContextMenu.references.length === 0) {
        this.$refs.homeContextMenu.addRef({el: container, vnode: container})
      }
      const viewModeIndex = this.contextMenus.findIndex(item => item.operation === 'viewMode')
      const arrangementModeIndex = this.contextMenus.findIndex(item => item.operation === 'arrangement')
      if (viewModeIndex > -1) {
        const child = this.contextMenus[viewModeIndex].child
        if (this.grid) {
          child[0].iconClass = 'menu-empty'
          child[1].iconClass = 'menu-point'
        } else {
          child[0].iconClass = 'menu-point'
          child[1].iconClass = 'menu-empty'
        }
      }
      if (arrangementModeIndex > -1) {
        const child = this.contextMenus[arrangementModeIndex].child
        const prop = this.sortable.prop
        child.forEach(item => {
          const orderProp = item.orderProp
          if (orderProp === prop) {
            child.map(item => {
              if (orderProp === item.orderProp) {
                item.iconClass = 'menu-' + this.sortable.order
              } else {
                item.iconClass = 'menu-null'
              }
              return item
            })
          }
        })
      }
      // 加载顶部的排序下拉框
    },
    // 画矩形选区
    drawRectangle() {
      if (this.selectFile) {
        return
      }
      const _this = this
      let $$ = function (id) {
        return document.getElementById(id)
      }
      let draw = $$("v-draw-rectangle")
      let wId = "rectangle1"
      let startX = 0, startY = 0
      let retcLeft = 0, retcTop = 0, retcHeight = 0, retcWidth = 0
      _this.drawFlag = false
      let itemClassName = 'el-table__row'
      draw.onmousedown = function (e) {
        if (_this.fileListScrollTop > 0) {
          return
        }
        let evt = window.event || e
        if (_this.grid) {
          itemClassName = 'van-grid-item van-grid-item--square'
        }
        let throughRow = e.path.find(path => {
          if (path.className === itemClassName) {
            return path
          }
        })
        if (throughRow && _this.selectRowData.includes(_this.fileList[throughRow.rowIndex])) {
          return
        }
        if (evt.button !== 0) {
          return
        }
        let scrollTop = draw.scrollTop || draw.scrollTop
        let scrollLeft = draw.scrollLeft || draw.scrollLeft
        startX = evt.clientX + scrollLeft
        startY = evt.clientY + scrollTop
        let div = document.createElement("div")
        div.id = wId
        div.className = "draw-rectangle"
        div.style.left = startX + "px"
        div.style.top = startY + "px"
        div.style.position = 'fixed'
        div.style.border = '1px dashed #2898ff'
        div.style.width = '0px'
        div.style.height = '0px'
        div.style.left = '0px'
        div.style.top = '0px'
        div.style.overflow = 'hidden'
        draw.appendChild(div)
        document.onmousemove = function (e) {
          let evt = window.event || e
          let scrollTop = document.body.scrollTop || document.documentElement.scrollTop
          let scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft
          retcLeft = (startX - evt.clientX - scrollLeft > 0 ? evt.clientX + scrollLeft : startX)
          retcTop = (startY - evt.clientY - scrollTop > 0 ? evt.clientY + scrollTop : startY)
          retcHeight = Math.abs(startY - evt.clientY - scrollTop)
          retcWidth = Math.abs(startX - evt.clientX - scrollLeft)
          const drawRectangle = $$(wId)
          if (drawRectangle) {
            noScroll()
            _this.drawFlag = true
            drawRectangle.style.left = retcLeft + 'px'
            drawRectangle.style.top = retcTop + 'px'
            drawRectangle.style.width = retcWidth + 'px'
            drawRectangle.style.height = retcHeight + 'px'
            drawRectangle.style.backgroundColor = '#f2f5fa55'
          }
          if (_this.drawFlag && (retcHeight + retcWidth) > 4) {
            if (!drawSelecting) {
              drawSelect({x: retcLeft, y: retcTop, w: retcWidth, h: retcHeight})
            }
          }
        }
        document.onmouseup = function (e) {
          document.onmousemove = null;
          document.onmouseup = null;
          setTimeout(function () {
            restoreScroll()
            _this.drawFlag = false
          }, 50)
          if ($$(wId)) {
            draw.removeChild($$(wId))
          }
        }
      }

      let scrollDiv = document.querySelector('.el-table__body-wrapper')
      if (_this.grid) {
        // 添加grid视图的scroll事件
        document.querySelector('.van-grid').onscroll = function (e) {
          _this.tableBodyScroll(null, e)
        }
        scrollDiv = document.querySelector('.van-grid')
      }
      // 禁止滚动
      let noScroll = function () {
        scrollDiv.onmousewheel = function (evt) {
          evt = evt || window.event
          if (evt.preventDefault) {
            // Firefox
            evt.preventDefault()
            evt.stopPropagation()
          } else {
            // IE
            evt.cancelBubble = true
            evt.returnValue = false
          }
          return false
        }
      }
      // 恢复滚动
      let restoreScroll = function () {
        scrollDiv.onmousewheel = function (evt) {
          return true
        }
      }

      let drawSelecting = false
      let drawSelect = function (drawNode) {
        drawSelecting = true
        _this.dragElementList.forEach(element => {
          if (checkTouch(element, drawNode)) {
            _this.$refs.fileListTable.toggleRowSelection([{row: _this.fileList[element.rowIndex], selected: true}])
          } else {
            _this.$refs.fileListTable.toggleRowSelection([{row: _this.fileList[element.rowIndex], selected: false}])
          }
        })
        setTimeout(function () {
          drawSelecting = false
        }, 150)
      }
      //检查两个DIV是否有接触
      let checkTouch = function (item, draw) {
        //得到左上角的绝对坐标
        let x1 = item.x
        let y1 = item.y
        let x2 = draw.x
        let y2 = draw.y
        let w1 = item.w;
        let h1 = item.h;
        let w2 = draw.w;
        let h2 = draw.h;
        return ((x1 - x2 <= 0) && (x2 - x1 < w1) || (x1 - x2 >= 0) && (x1 - x2 < w2)) && ((y1 - y2 <= 0) && (y2 - y1 < h1) || (y1 - y2 >= 0) && (y1 - y2 < h2))
      };
    },
    //行拖拽
    rowDrop() {
      if (this.selectFile) {
        return
      }
      if (this.fileListScrollTop > 0 && this.$route.path !== '/') {
        return
      }
      // 目标元素的背景颜色
      let dragEnterBackColor = null
      // 被拖拽元素的背景色
      let dragBackColor = null
      const _this = this
      // 被拖动的元素的索引
      let dragged = null;
      // 被拖动的元素的索引
      let draggedIndex = -1;

      let parentClassName = 'van-grid'
      let gridItemClassName = 'van-grid-item van-grid-item--square'
      let gridItemChildrenClassName = 'grid-time van-grid-item__content van-grid-item__content--center van-grid-item__content--square'

      // 目标元素
      let target = document.querySelector('.el-table__body-wrapper tbody')

      if (this.grid) {
        target = document.querySelector('.van-checkbox-group .van-grid')
      }

      let rows = 0;//行数

      // let images = {}
      // for (let i = 1; i <= 9; i++) {
      //   let img = new Image()
      //   img.src = require(`@/assets/img/move-file${i}.png`)
      //   images[i] = img
      // }
      setTimeout(function () {
        rows = target.childElementCount
        _this.dragElementList = []
        for (let i = 0; i < target.childElementCount; i++) {
          let child = target.children[i]
          // 设置索引,表格自带rowIndex,这里我们设置grid的
          if (_this.grid) {
            child.rowIndex = i
            child.children[0].children[0].rowIndex = i
            child = child.children[0].children[0]
          }
          // 为画矩形选取准备数据
          let pos = getObjPos(child)
          pos.w = child.offsetWidth
          pos.h = child.offsetHeight
          pos.rowIndex = child.rowIndex
          _this.dragElementList.push(pos)

          // 使元素可拖动
          child.draggable = true
          // 给能拖动的元素加上标识,只有加上此标识才能被拖动,否则即使draggable = true,也无法拖动(在全局的ondragstart里拦截)
          child.slot = 'egg'

          let childOfImg = child.querySelector('.el-avatar > img')
          if (_this.grid) {
            childOfImg = child.querySelector('.el-image > img')
          }
          if (childOfImg) {
            childOfImg.draggable = false
          }

          child.ondragstart = function (e) {
            if (_this.fileListScrollTop === 0) {
              let count = _this.selectRowData.length
              if (_this.selectRowData.length >= 99) {
                count = 99
              }
              let dragImage = document.getElementById('dragImage');
              dragImage.src = require(`@/assets/image/move-file/move-file${count}.png`)

              e.dataTransfer.setDragImage(dragImage, 10, 10);

              Bus.$emit('onDragStart', true)
              // 避免和画矩形选区冲突
              _this.drawFlag = false
              let rectangle = document.getElementById('rectangle1')
              if (rectangle) {
                document.getElementById('v-draw-rectangle').removeChild(rectangle)
              }

              dragged = e.path[0]
              draggedIndex = e.path[0].rowIndex
              // 只有选中的才能拖拽
              _this.cellMouseIndex = -1
              // dragged.style.cursor = 'grabbing'
              dragged.style.borderRadius = '10px'
              dragBackColor = dragged.style.backgroundColor
            }
          }
          child.ondragend = function () {
            Bus.$emit('onDragStart', false)
            // console.log('child'+i+'拖拽结束');
            // 清除上次进入的容器的状态
            const last = target.children[dragIndex];
            clearClass(last)
            if (_this.grid) {
              dragged.style.cursor = 'pointer'
            } else {
              dragged.style.cursor = 'default'
            }
          }
        }
      }, 0)

      // 被拖动的元素正在那个容器里
      let dragIndex = -1

      // 判断经过了那个元素
      let judgeThroughDom = function (e, d) {
        let throughRow = null
        if (_this.grid) {
          if (e.path[0].className === gridItemChildrenClassName) {
            // throughRow 表示被拖动的元素正在哪一行上
            return throughRow
          } else {
            throughRow = e.path.find(path => {
              if (path.className === gridItemChildrenClassName) {
                return path
              }
            })
          }
          if (d === 'enter') {
            let node = null
            if (e.toElement.className === gridItemClassName) {
              node = e.toElement
            }
            if (e.toElement.className === parentClassName) {
              node = e.fromElement
            }
            if (node) {
              // console.log(d,e,node,node.rowIndex)
              leaveIndex = node.rowIndex
              if (dragIndex > -1) {
                // 清除上次进入的容器的状态
                const last = target.children[dragIndex];
                clearClass(last)
              }
              // console.log("离开了",leaveIndex,"dragIndex:",dragIndex)
              const leave = target.children[leaveIndex];
              clearClass(leave)
              dragIndex = -1
            }
          }
          return throughRow
        } else {
          if (e.path[0].tagName === 'TD') {
            // throughRow 表示被拖动的元素正在哪一行上
            throughRow = e.path.find(path => {
              if (path.className === 'el-table__row') {
                return path
              }
            })
          }
          return throughRow
        }
      }

      target.ondragenter = function (e) {
        // console.log(e,e.toElement)
        clearTimeout(loop)
        // 由于被拖动的元素 经过tbody中的每一元素都会触发该事件, 但是我们只需要它正在那一行上就行了
        let throughRow = judgeThroughDom(e, 'enter')
        if (throughRow) {
          if (dragIndex !== throughRow.rowIndex) {
            if (dragIndex > -1) {
              // 清除上次进入的容器的状态
              const last = target.children[dragIndex];
              clearClass(last)
            }
            // console.log('拖动进入目标元素'+throughRow.rowIndex,'dragIndex:',dragIndex);
            // 不是自己或未文件夹时才改变状态
            if (draggedIndex !== throughRow.rowIndex && _this.fileList[throughRow.rowIndex].isFolder && _this.selectRowData.findIndex(item => item.index === throughRow.rowIndex) === -1) {
              // 改变本次进入的容器的状态
              dragged.style.cursor = 'copy'
              dragEnterBackColor = throughRow.style.backgroundColor
              throughRow.style.backgroundColor = '#9fcdfc99'
            }
            dragIndex = throughRow.rowIndex
          }
          leaveIndex = -1
        }
      }

      target.ondragover = function (e) {
        // console.log('目标元素中拖拽...');
        e.preventDefault();
        leaveIndex = -1
      }

      let loop = null
      let leaveIndex = -1 // 是否拖出了整个table, -1表示还在table内

      target.ondragleave = function (e) {
        clearTimeout(loop)
        let throughRow = judgeThroughDom(e, 'leave')
        if (throughRow) {
          if (!_this.grid) {
            if (throughRow.rowIndex === 0 || throughRow.rowIndex === rows - 1) {
              // 离开第一行或最后一行
              leaveIndex = throughRow.rowIndex
              loop = setTimeout(function () {
                if (leaveIndex > -1) {
                  const leave = target.children[leaveIndex];
                  clearClass(leave)
                  dragIndex = -1
                }
              }, 100)
            }
          }
        }
      }
      target.ondrop = function () {
        // console.log('放下了'+draggedIndex);
        const form = _this.fileList[draggedIndex]
        const to = _this.fileList[dragIndex]
        if (form && to && form.id !== to.id && to.isFolder && !_this.selectRowData.includes(to)) {
          // 移动文件/文件夹
          let forms = []
          _this.selectRowData.forEach(row => {
            forms.push(row.id)
          })
          _this.$confirm(`是否将选中的${_this.selectRowData.length}项移动到 ${to.name}?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            _this.copyOrMoveApi('move', forms, to.id)
          }).catch()
        }
      }
      let clearClass = function (node) {
        if (!dragged) {
          return
        }
        if (node) {
          if (_this.grid) {
            node = node.children[0].children[0]
            if (node.style.backgroundColor !== 'rgba(202, 234, 249, 0.57)') {
              node.style.backgroundColor = null
            }
          } else {
            node.style.height = 'unset'
            //#F5F7FA
            if (node.style.backgroundColor !== 'rgb(245, 247, 250)') {
              node.style.backgroundColor = null
            }
          }
          dragged.style.cursor = 'grabbing'
        }
        dragged.style.backgroundColor = dragBackColor
      }

      function getObjPos(obj) {
        let pos = {x: 0, y: 0}
        while (obj) {
          pos.x += obj.offsetLeft
          pos.y += obj.offsetTop
          obj = obj.offsetParent
        }
        return pos
      }
    },
    // 切换布局
    changeVmode() {
      this.grid = !this.grid
      this.vmode = 'list'
      if (this.grid) {
        this.vmode = 'grid'
      } else {
        this.$refs.fileListTable.setHeight()
      }
      if (!this.path) {
        this.path = ''
      }
      this.$router.push(`?vmode=${this.vmode}&folder=${this.currentFolder}`)
      // // 改变拖拽目标
      this.rowDrop()
      // // 画矩形选取
      this.drawRectangle()
      this.loadContextMenus()
    },
    beforeLoadData(onLoad) {
      if (onLoad) {
        this.pagination.pageNum++
      } else {
        this.pagination.pageNum = 1
      }
      this.tableLoading = true
      this.finised = false
    },
    // 填充数据
    loadData(res, onLoad) {
      if (!this.$refs.fileListTable) {
        return
      }
      if (onLoad) {
        res.list.forEach((file, number) => {
          file['index'] = (this.pagination.pageNum - 1) * this.pagination.pageSize + number
          this.fileList.push(file)
        });
      } else {
        this.fileList = res.list
        this.fileList.map((item, index) => {
          item.index = index
        })
        this.$refs.fileListTable.reloadData(this.fileList)
      }
      // 数据全部加载完成
      if (this.fileList.length >= res.total) {
        this.finished = true;
      }
      this.tableLoading = false
      this.clientHeight = document.documentElement.clientHeight - this.lessClientHeight
      this.listModeSearch = false
      this.pagination['total'] = res.total
      this.$nextTick(() => {
        this.containerResize()
        this.tableLoading = false
      })
      // 使列表可拖拽
      this.rowDrop()
      // 加载菜单状态
      this.loadContextMenus()
      // 使列表滑到顶部
      if (!onLoad && !this.grid) {
        if (this.fileListScrollTop > 0) {
          this.$refs.fileListTable.pagingScrollTopLeft()
        }
      }
      this.fileListScrollTop = 0
    },
    getFileList(onLoad) {
      console.log(this.queryFileType)
      this.beforeLoadData(onLoad)
      api.fileList({
        userId: this.$store.state.user.userId,
        folderId: this.queryFileType ? null : this.currentFolder,
        queryFileType: this.queryFileType,
        sortProp: this.sortable.prop,
        sortOrder: this.sortable.order,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        queryCondition: this.queryCondition,
      }).then(res => {
        this.loadData(res.data, onLoad)
      });
    },
    // cell-style 通过返回值可以实现样式变换利用传递过来的数组index循环改变样式
    rowStyle({row, rowIndex}) {
      if (this.$refs.fileListTable.tableSelectData.findIndex(item => item.index === row.index) > -1) {
        return {backgroundColor: '#F5F7FA'}
      }
    },
    // 动态添加index到row里面去
    tableRowClassName({row, rowIndex}) {
      // row.index = rowIndex
    },
    // 收集选中的index值作为数组 传递给rowRed判断变换样式
    handleSelectionChange(rows) {
      // 起点
      if (rows.length > 0) {
        if (!this.selectPin) {
          this.selectOrigin = rows[0].index
        }
        if (this.selectPin) {
          return
        }
        this.rowContextData = rows[0]
      }
      this.$refs.fileListTable.tableSelectData = rows
      this.selectRowData = rows
      this.changeSelectedStyle(rows)
    },
    changeSelectedStyle(rows) {
      let selectTotalSize = 0
      rows.forEach(item => {
        selectTotalSize += item.size
      })
      const item_name = this.tableHead[2]
      const item_more = this.tableHead[4]
      const item_size = this.tableHead[5]
      const item_date = this.tableHead[6]
      if (rows.length > 0) {
        const sumFileAndFolder = this.getShowSumFileAndFolder(rows)
        const sizeSum = this.getShowSumSize(selectTotalSize)
        item_name.label = sumFileAndFolder
        item_name.sortable = false
        item_more.name = 'more'
        item_size.label = sizeSum
        item_size.sortable = false
        item_date.label = ''
        item_date.sortable = false
      } else {
        item_name.label = '名称'
        item_name.sortable = true
        item_more.name = ''
        item_size.label = '大小'
        item_size.sortable = true
        item_date.label = '修改日期'
        item_date.sortable = true
      }
      this.allChecked = this.selectRowData.length === this.fileList.length;
    },
    // 单元格hover进入时事件
    cellMouseEnter(row) {
      if (this.$refs.contextShow.locals.menuType === 'moreClick' && this.$refs.contextShow.locals.rowIndex !== row.index) {
        this.$refs.contextShow.hideMenu()
      }
      if (this.editingIndex === -1 && !this.$refs.contextShow.ctxVisible) {
        if (this.selectRowData.length <= 1) {
          this.cellMouseIndex = row.index
        }
      }
    },
    // 单元格hover退出时事件
    cellMouseLeave(row) {
      if (this.$refs.contextShow.locals.menuType === 'moreClick' && this.$refs.contextShow.locals.rowIndex !== row.index) {
        this.$refs.contextShow.hideMenu()
        this.$refs.contextShow.locals = {}
        return
      }
      if (this.$refs.contextShow.ctxVisible && this.$refs.contextShow.locals.menuType === 'moreClick' && this.$refs.contextShow.locals.rowIndex === row.index) {
        return
      }
      this.cellMouseIndex = -1
    },
    //双击
    dblclick(row) {
      this.fileClick(row)
    },
    // 单元格点击事件
    cellClick(row, column) {
      if (this.selectFile) {
        this.fileClick(row)
        return
      }
      clearTimeout(this.Loop);
      if (this.editingIndex === -1) {
        const columnIndex = column.index
        if (columnIndex === 2) {
          if (this.selectRowData.length < 1) {
            if (row.index !== this.editingIndex) {
              this.editingIndex = -1
            }
          }
        }
        if (this.isCmd) {
          this.pinSelect(null, row)
          this.$refs.fileListTable.toggleRowSelection([{row: row}])
          return
        }
        if (columnIndex === 0) {
          this.pinSelect(null, row)
          this.$refs.fileListTable.toggleRowSelection([{row: row}])
        } else {
          this.$refs.fileListTable.clearSelection()
          this.$refs.fileListTable.toggleRowSelection([{row: row}])
          this.pinSelect(null, row)
        }
      }
    },
    // 鼠标右击
    rowContextmenu(row) {
      if (this.selectFile) {
        return
      }
      if (this.$refs.fileListTable.tableSelectData.length > 1 && this.$refs.fileListTable.tableSelectData.findIndex(item => item.index === row.index) > -1) {
        this.menusIsMultiple = true
        this.menus = this.multipleRightMenus
      } else {
        this.$refs.fileListTable.clearSelection()
        this.$refs.fileListTable.toggleRowSelection([{row: row}])
        this.menusIsMultiple = false
        if (row.extension && row.extension.includes("md")) {
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
      this.$refs.contextShow.showMenu(e)
      this.cellMouseIndex = -1
    },
    // 选择某行预备数据
    preliminaryRowData(row) {
      if (row) {
        // this.$refs.fileListTable.tableSelectData[0] = row
        this.rowContextData = row
      }
    },
    tableBodyScroll(table, e) {
      this.fileListScrollTop = e.target.scrollTop
      Bus.$emit("fileListScrollTop", this.fileListScrollTop)
      let scrollBottom = e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
      if (scrollBottom < 200) {
        if (!this.finished) {
          if (this.listModeSearch) {
            if (this.listModeSearchOpenDir) {
              this.searchFileAndOpenDir(this.listModeSearchOpenDir, true)
            } else {
              this.searchFile(this.searchFileName, true)
            }
          } else {
            this.getFileList(true)
          }
        }
      }
    },
    pinSelect(rows, row) {
      if (this.selectPin && this.selectOrigin > -1) {
        const origin = this.selectOrigin
        this.selectEnd = row.index
        let diff = this.selectEnd - origin
        // 先清除选中
        this.$refs.fileListTable.clearSelection()
        if (diff === 0) {
          this.selectOrigin = -1
        }
        if (diff > 0) {
          for (let i = origin; i <= this.selectEnd; i++) {
            this.$refs.fileListTable.toggleRowSelection([{row: this.fileList[i], selected: true}])
            this.$refs.fileListTable.tableSelectData.push(this.fileList[i])
          }
        }
        if (diff < 0) {
          for (let i = this.selectEnd; i <= origin; i++) {
            this.$refs.fileListTable.toggleRowSelection([{row: this.fileList[i], selected: true}])
            this.$refs.fileListTable.tableSelectData.push(this.fileList[i])
          }
        }
      }
      this.changeSelectedStyle(this.$refs.fileListTable.tableSelectData)
    },
    // 列表右键菜单操作
    menusOperations(operation) {
      switch (operation) {
        case 'share':
          // 分享
          this.shareClick(this.rowContextData)
          break
        case 'edit':
          // 编辑
          window.open(`/setting/website/manager-articles?operation=editor&id=${this.rowContextData.id}`, '_blank')
          break
        case 'open':
          // 打开
          this.fileClick(this.rowContextData)
          break
        case 'deselect':
          // 取消选定
          this.$refs.fileListTable.clearSelection()
          break
        case 'details':
          this.drawer = true
          break
        case 'rename':
          // 重命名
          this.renameFilename = this.rowContextData.name
          this.editingIndex = this.rowContextData.index
          break
        case 'copy':
          // 移动或复制
          this.moveOrCopy()
          break
        case 'download':
          // 下载
          this.downloadFile()
          break
        case 'remove':
          // 删除
          this.deleteFile()
          break
      }
      this.$refs.contextShow.hideMenu()
    },
    // 选取输入框部分内容
    renameInputFocus(event, extension) {
      event.currentTarget.selectionStart = 0
      event.currentTarget.selectionEnd = event.currentTarget.value.length - extension.length === 0 ? 0 : extension.length - 1
    },
    // 重命名
    rowRename(newFileName, row) {
      if (newFileName) {
        if (/[\/\\"<>?*]/gi.test(newFileName)) {
          this.$message({
            message: '文件名不能包含以下字字符:<,>,|,*,?,,/',
            type: 'warning'
          });
          return;
        }
        let strFileName = newFileName.replace(/(.*\/)*([^.]+).*/ig, "$2");
        let newExt = newFileName.replace(/.+\./, "");
        if (!row.isFolder) {
          if (row.extension !== newExt) {
            this.$confirm(`您确定要将扩展名“.${row.extension}”更改为“.${newExt}”吗？`, '提示', {
              type: 'warning',
              showClose: false,
              closeOnClickModal: false,
              confirmButtonText: `保持.${row.extension}`,
              cancelButtonText: `使用.${newExt}`,
            }).then(() => {
              newFileName = strFileName + '.' + row.extension
            }).catch(() => {
            }).then(() => {
              this.rename(row, newFileName)
            })
          } else {
            this.rename(row, newFileName)
          }
        } else {
          this.rename(row, newFileName)
        }
      } else {
        this.editingIndex = -1
      }
    },
    //重命名
    rename(row, newFileName) {
      if (row.name === newFileName) {
        this.editingIndex = -1
        return
      }
      this.renameLoading = true
      const findIndex = this.fileList.findIndex(item => {
        if (newFileName === item.name) {
          return item
        }
      })
      if (findIndex > -1) {
        let msg = '该文件已存在'
        if (row.isFolder) {
          msg = '该文件夹已存在'
        }
        this.$message({
          message: msg,
          type: 'warning'
        });
        this.renameLoading = false
        return;
      }
      api.rename({
        name: newFileName,
        isFolder: row.isFolder,
        id: row.id,
        userId: this.$store.getters.userId
      }).then(res => {
        //success
        if (!res.data) {
          this.renameLoading = false
          row.name = newFileName
          row.extension = newFileName.replace(/.+\./, "")
          this.fileList[row.index] = row
          this.editingIndex = -1
        }
      }).then(() => {
        this.$refs.fileListTable.clearSelection()
      }).catch(() => {
        this.renameLoading = false
        this.editingIndex = -1
      })
    },
    //preview or open dir
    fileClick(row) {
      if (row.isFolder) {
        this.editingIndex = -1
        if (this.listModeSearch) {
          const item = {}
          item['folder'] = row.name
          item['search'] = true
          item['row'] = row
          item['id'] = row.id
          this.pathList.push(item)
          this.pagination.pageIndex = 1
          this.$router.push(`?vmode=${this.vmode}&search-file=${row.id}`)
          this.searchFileAndOpenDir(row)
        } else {
          this.currentFolder = row.id
          const item = {'folder': row.name, 'id': row.id}
          this.pathList.push(item)
          this.pagination.pageNum = 1
          this.$router.push(`?vmode=${this.vmode}&folder=${this.currentFolder}`)
          this.openDir(row, false)
        }
      } else {
        //todo 非文件夹预览
        if (this.selectFile) {
          let selectFile = row
          const selectData = this.$refs.fileListTable.tableSelectData
          if (selectData.length < 1 || selectData[0].id !== row.id) {
            this.$refs.fileListTable.clearSelection()
            this.$refs.fileListTable.toggleRowSelection([{row: row}])
            this.pinSelect(null, row)
          } else {
            this.$refs.fileListTable.clearSelection()
            selectFile = {}
          }
          this.$emit("selectedFile", selectFile)
          return
        }
        if (row.contentType.startsWith('image')) {
          // 图片
          this.imagePreviewVisible = true
          this.imagePreviewRow = row
          return
        }
        if (row.contentType.indexOf('audio') > -1) {
          //音频
          Bus.$emit('onAddAudio', row, '')
          return
        }
        if (row.contentType.indexOf('video') > -1) {
          // 视频文件
          this.videoPreviewVisible = true
          this.videoPreviewRow = row
          return
        }
        if (row.extension.toLowerCase() === 'pdf') {
          // pdf文件
          let host = window.location.host
          if (window.location.port.length > 0) {
            host = window.location.host.substring(0, window.location.host.length - window.location.port.length - 1)
          }
          fileConfig.preview(this.$store.getters.userId, row, this.$store.getters.token)
        }

        if (ext.officeFile.includes(row.extension)) {
          let domain = window.location.origin
          let src = domain + fileConfig.previewUrl(this.$store.getters.userId, row, this.$store.getters.token)
          window.open(
            "https://view.officeapps.live.com/op/view.aspx?src=" + src,
            "_blank"
          )
        }


        // 其他文件
        let fileIds = [row.id];
        this.notPreviewDialogVisible = true
      }
    },
    openDir(row, onLoad) {
      this.beforeLoadData(onLoad)
      api.fileList({
        userId: this.$store.getters.userId,
        folderId: row.id,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }).then(res => {
        this.loadData(res.data, onLoad)
      })
    },
    // 更多操作(多选)
    moreOperation(event) {
      this.menusIsMultiple = false
      this.menus = this.multipleMenus
      this.showOperationMenus(event)
    },
    // 显示操作菜单
    showOperationMenus(event, menuData) {
      let offsetY = event.pageY
      if (event.target.clientHeight > 0) {
        offsetY += event.target.clientHeight / 2 - event.offsetY
      }
      const e = {}
      if (document.body.scrollHeight - offsetY > 400) {
        this.menuTriangle = 'menu-triangle-top'
        e.pageX = event.pageX - 78
        e.pageY = offsetY + 25
      } else {
        this.menuTriangle = 'menu-triangle-bottom'
        e.pageX = event.pageX - 78
        e.pageY = offsetY - (this.menus.length * 38) - 36
      }
      if (!this.isJustHideMenus) {
        this.$refs.contextShow.showMenu(e, menuData)
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
      this.showOperationMenus(event, {'menuType': 'moreClick', rowIndex: row.index})
    },
    // 格式化最近时间
    formatTime(time) {
      return formatTime(time)
    },
    //格式化文件大小
    formatSize(size) {
      return formatSize(size)
    },
    sortChangeOfMenu(prop, headerIndex) {
      let tableHeader = document.querySelector('.el-table__header thead tr')
      // 去掉table-header上所有排序高亮
      tableHeader.childNodes.forEach(el => {
        if (el.className.indexOf('is-sortable') > -1) {
          this.removeClass(el, "descending")
          this.removeClass(el, "ascending")
        }
      })
      // 重新加上排序高亮
      let order = this.sortable.order === 'ascending' ? 'descending' : 'ascending'
      this.addClass(tableHeader.children[headerIndex], order)
      this.orderCustom = true
      this.sortChange({prop: prop, order: order})
    },
    sortChange(column) {
      let {prop, order} = column
      this.rowDrop()
      if (this.orderCustom || this.listModeSearch) {
        this.sortable.prop = prop
        this.sortable.order = order
        this.pagination.pageNum = 1
        if (this.listModeSearch) {
          this.searchFile(this.searchFileName)
        } else {
          this.getFileList();
        }
      }
    },
    removeClass(el, className) {
      const str = el.className
      if (str.indexOf(className) > -1) {
        el.className = str.replace(className, "")
      }
    },
    addClass(el, className) {
      if (el) {
        const str = el.className
        el.className = el.className + " " + className
      }
    },
    getSummaries(param) {
      // 合计
      const {columns, data} = param
      const sums = []
      columns.forEach((column, index) => {
        const values = data.map(item => Number(item[column.property]))
        if (index === 5) {
          sums[2] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
        }
      })
      const sumFileAndFolder = this.getShowSumFileAndFolder(this.fileList)
      const sizeSum = this.getShowSumSize(sums[2])
      sums[2] = sumFileAndFolder + sizeSum
      this.summaries = sums[2]
      return sums
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
    // 计算总大小
    getShowSumSize(totalSize) {
      let sizeSum = ''
      if (totalSize < 1024) {
        sizeSum += totalSize + 'B'
      } else if (totalSize >= 1024 && totalSize < 1024 * 1024) {
        sizeSum += (totalSize / 1024).toFixed(2) + 'K'
      } else if (totalSize >= 1024 * 1024 && totalSize < 1024 * 1024 * 1024) {
        sizeSum += (totalSize / (1024 * 1024)).toFixed(2) + 'M'
      } else {
        sizeSum += (totalSize / (1024 * 1024 * 1024)).toFixed(2) + 'G'
      }
      return sizeSum
    },
    getNewFileName(fileList, newFolderName) {
      let append = 0
      let filenameList = []
      if (fileList.length <= 0) {
        return newFolderName
      }
      fileList.forEach(file => {
        filenameList.push(file.name || file.label)
      })
      const newName = newFolderName
      while (filenameList.includes(newFolderName)) {
        append += 1
        newFolderName = newName + append
      }
      return newFolderName
    },
    newFolder() {
      this.newFolderName = this.getNewFileName(this.fileList, '新建文件夹')
      this.showNewFolder = true
      this.$nextTick(() => {
        this.$refs.newFolderName.focus()
        this.$refs.newFolderName.select()
      })
    },
    newFolderNameClick() {
      if (this.newFolderName) {
        if (/[\/\\"<>\?\*]/gi.test(this.newFolderName)) {
          this.$message({
            message: '文件名不能包含以下字字符:<,>,|,*,?,,/',
            type: 'warning'
          });
          return;
        }
        this.newFolderLoading = true
        api.newFolder({
          isFolder: true,
          name: this.newFolderName,
          parentId: this.currentFolder,
          userId: this.$store.state.user.userId
        }).then((res) => {
          if (res.data) {
            this.newFolderLoading = false
            this.showNewFolder = false
            this.isShowNewFolder = false
            this.$notify({
              title: '新建文件夹成功',
              type: 'success',
              duration: 1000
            })
            if (this.listModeSearch) {
              this.getFileListBySearchMode()
            } else {
              this.getFileList()
            }
          }
        }).catch(() => {
          this.newFolderLoading = false
        })
      } else {
        this.newFolderLoading = false
        this.$message({
          message: '请输入文件夹名称',
          type: 'warning'
        });
      }
    },
    getFileListBySearchMode(onLoad) {
      this.beforeLoadData(onLoad)
      api.fileList({
        userId: this.$store.state.user.userId,
        parentId: this.currentFolder,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }).then(res => {
        this.loadData(res, onLoad)
      })
    },
    searchFileByKeyWord(key) {
      this.searchFile(key)
    },
    // 删除
    deleteFile() {
      let fileList = []
      const fileIds = []
      if (this.menusIsMultiple || this.selectRowData.length > 1) {
        fileList = this.$refs.fileListTable.tableSelectData
        this.$refs.fileListTable.tableSelectData.forEach(value => {
          fileIds.push(value.id)
        })
      } else {
        fileIds.push(this.rowContextData.id)
        //由于是行操作tableSelectData并没有该值，会导致无法从列表删除
        this.$refs.fileListTable.tableSelectData.push(this.rowContextData)
      }
      const str = this.getShowSumFileAndFolder(fileList)
      this.$confirm(str + '将进入回收站, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.deleteFiles({
          userId: this.$store.getters.userId,
          fileIds: fileIds
        }).then(() => {
          // 移除列表
          this.removeSelectItem()
        }).then(() => {
          this.$notify({
            title: '删除成功',
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
          let fileIndex = this.fileList.findIndex(file => file.id === item.id)
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
        // 改变拖拽目标
        that.rowDrop()
      }, 300)
    },
    clearTreeNode() {
      let rootNode = this.$refs.directoryTree.getNode('0')
      rootNode.loaded = false
      rootNode.expanded = false
    },
    // 点击文件树
    treeNodeClick(row, node, event) {
      this.selectTreeNode = row
      this.selectTreeNode.showName = ' "' + row.name + '"'
    },
    // 节点被展开时触发
    treeNodeExpand(row, node, event) {
    },
    directoryTreeLoadNode(node, resolve) {
      let fileId = null
      if (node.level === 0) {
        const that = this
        setTimeout(function () {
          that.$refs.directoryTree.setCurrentKey('0')
        }, 0)
        return resolve([{'id': "0", 'name': '全部文件'}])
      }
      if (node.level > 1) {
        fileId = node.data.id
      }
      api.queryFolderTree({
        userId: this.$store.getters.userId,
        parentId: node.data.id
      }).then(res => {
        const nextNodes = res.data
        return resolve(nextNodes)
      })
    },
    renderContent(h, {node, data, store}) {
      if (data.newFolder) {
        return (
          <span class="custom-tree-node">
            <span><svg-icon icon-class="folder"/></span>
            <span>
            <div class="el-input el-input--mini el-input-tree">
              <input type="text" autocomplete="on" value="新建文件夹" id="treeInput" class="el-input__inner"/>
            </div>
            <button type="button" on-click={() => {
              let parentData = node.parent.data
              let treeInput = document.getElementById('treeInput')
              let filename = treeInput.value
              if (filename.indexOf("新建文件夹") === -1) {
                console.log(filename);
                data.name = filename
              }
              console.log(data.name);
              api.newFolder({
                isFolder: true,
                name: data.name,
                parentId: parentData.id,
                userId: this.$store.state.user.userId
              }).then((res) => {
                data.newFolder = false
                data.id = res.data.id
              }).catch(() => {
                window.event.preventDefault()
                window.event.stopPropagation()
              })
            }}
                    class="el-button el-icon-check el-button--mini el-input-tree-button"
                    element-loading-spinner="el-icon-loading" element-loading-background="#f6f7fa88"/>
            <button type="button" on-click={() => {
              this.$refs.directoryTree.remove(node)
              window.event.preventDefault()
              window.event.stopPropagation()
            }}
                    class="el-button el-icon-close el-button--mini el-input-tree-button"
                    element-loading-spinner="el-icon-loading" element-loading-background="#f6f7fa88"/>
            </span>
            </span>);
      }
      if (node.expanded) {
        return (
          <span class="custom-tree-node">
            <svg-icon icon-class="open-folder"/>
            <span style="margin-left: 5px;">{node.label}</span>
            <span>
            </span>
            </span>);
      } else {
        return (
          <span class="custom-tree-node">
            <svg-icon icon-class="folder"/>
            <span style="margin-left: 5px;">{node.label}</span>
            <span>
            </span>
            </span>);
      }
    },
    // 移动文件
    moveFileTree() {
      this.copyOrMove('move');
    },
    // 复制文件
    copyFileTree() {
      this.copyOrMove('copy');
    },
    moveOrCopy() {
      this.dialogMoveOrCopyVisible = true
      this.titlePrefix = '移动或复制到: '
      const that = this
      setTimeout(function () {
        that.selectTreeNode = that.$refs.directoryTree.getCurrentNode()
        that.selectTreeNode.showName = ' "' + that.selectTreeNode.name + '"'
      }, 100)
    },
    // 文件树里新建文件夹
    fileTreeAndNewFolder() {
      let newNodeId = new Date().getMilliseconds()
      let node = this.$refs.directoryTree.getNode(newNodeId)
      if (node !== null) {
        this.$refs.directoryTree.remove(node)
      }
      let childNodes = this.$refs.directoryTree.store.currentNode.childNodes
      let newFolderName = this.getNewFileName(childNodes, '新建文件夹')
      let newNode = {
        id: newNodeId,
        newFolder: true,
        name: newFolderName,
        showName: newFolderName,
        isLeaf: true
      }
      console.log(newNode, this.selectTreeNode)
      this.$refs.directoryTree.append(newNode, this.selectTreeNode)
      const that = this
      setTimeout(function () {
        let treeInput = document.getElementById("treeInput")
        if (treeInput) {
          treeInput.value = newFolderName
          treeInput.focus()
          treeInput.select()
        }
      }, 100)
    },
    copyOrMove(operating) {
      let operation = '复制'
      if (operating === 'move') {
        operation = '移动'
      }
      let fileIds = [];
      let selectId = this.selectTreeNode.id
      if (this.menusIsMultiple || this.selectRowData.length > 1) {
        const exits = this.$refs.fileListTable.tableSelectData.some(value => {
          fileIds.push(value.id)
          const thisParentId = value.parentId
          if (thisParentId === selectId) {
            this.$message({
              message: '不能将文件' + operation + '到自身或其子目录下',
              type: 'warning'
            });
            return true;
          }
        })
        if (exits) {
          return
        }
      } else {
        if (this.rowContextData.id) {
          fileIds.push(this.rowContextData.id)
        } else {
          fileIds.push(this.rowContextData[0].id)
        }
      }
      this.copyOrMoveApi(operating, fileIds, this.selectTreeNode.id)
    },
    copyOrMoveApi(operating, froms, to) {
      let operation = '复制'
      if (operating === 'move') {
        operation = '移动'
      }
      let copying = this.$message({
        iconClass: 'el-icon-loading',
        type: 'info',
        duration: 0,
        dangerouslyUseHTMLString: true,
        message: '<span>&nbsp;&nbsp;正在' + operation + '</span>'
      });
      this.dialogMoveOrCopyVisible = false
      api[operating]({
        userId: this.$store.state.user.userId,
        fileIds: froms,
        parentId: to,
      }).then(res => {
        copying.iconClass = null
        copying.type = 'success'
        copying.message = operation + '成功'
        if (this.rowContextData.isFolder) {
          this.$refs.directoryTree.append(this.rowContextData, to)
        }

        if (operating === 'move') {
          // 移除列表
          if (this.$refs.fileListTable.tableSelectData.length === 1) {
            this.fileList.splice(this.$refs.fileListTable.tableSelectData[0].index, 1)
          } else {
            this.getFileList()
          }
          this.$refs.fileListTable.clearSelection()// 删除后清空之前选择的数据
          this.$refs.fileListTable.tableSelectData = []
        }

        setTimeout(function () {
          copying.close()
        }, 1000)
      }).catch(() => {
        copying.close()
      })
    },
    searchFile(key, onLoad) {
      if (key) {
        this.beforeLoadData(onLoad)
        const item1 = {}
        this.pathList = [{'folder': '', 'id': ''}]
        item1['folder'] = '搜索: ' + '"' + key + '"'
        item1['search'] = true
        item1['searchKey'] = key
        item1['id'] = ''
        this.pathList.push(item1)
        this.$router.push(`?vmode=${this.vmode}&search-file=${key}`)
        api.searchFile({
          userId: this.$store.state.user.userId,
          searchKey: key,
          sortProp: this.sortable.prop,
          sortOrder: this.sortable.order,
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize
        }).then(res => {
          this.loadData(res.data, onLoad)
          this.path = ''
          this.listModeSearch = true
          this.listModeSearchOpenDir = false
        })
      }
    },
    searchFileAndOpenDir(row, onLoad) {
      this.beforeLoadData(onLoad)
      api.fileList({
        userId: this.$store.state.user.userId,
        folderId: row.id,
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      }).then(res => {
        this.loadData(res.data, onLoad)
        this.listModeSearch = true
        this.listModeSearchOpenDir = row
      })
      this.currentFolder = row.id
    },
    gridItemHover(item, index) {
      this.gridHoverItemIndex = index;
      this.gridHoverIntermediate = index;
    },
    gridItemOut(item, index) {
      this.gridHoverIntermediate = -1
      const _this = this
      setTimeout(function () {
        if (_this.gridHoverIntermediate !== _this.gridHoverItemIndex) {
          _this.gridHoverItemIndex = -1;
        }
      }, 10)
    },
    clickGridAllCheckBox() {
      if (this.selectRowData.length !== this.fileList.length) {
        this.$refs.fileListTable.toggleAllSelection()
      } else {
        this.$refs.fileListTable.clearSelection();
      }
    },
    gridItemClick(row) {
      if (this.isCmd) {
        this.pinSelect(null, row)
        this.$refs.fileListTable.toggleRowSelection([{row: row}])
      }
      this.fileClick(row)
    },
    clickGridItemCheckBox(row, index) {
      // 同步列表的checkbox
      if (this.selectRowData.includes(row)) {
        this.$refs.fileListTable.toggleRowSelection([{row: row, selected: false}])
      } else {
        this.$refs.fileListTable.toggleRowSelection([{row: row, selected: true}])
      }
      this.pinSelect(null, row)
    },
    shareClick(row) {
      if (!row || !row.id) {
        if (this.rowContextData.id) {
          row = this.rowContextData
        } else {
          row = this.$refs.fileListTable.tableSelectData[0]
        }
      }
      if (row.isFolder) {
        this.$message.warning('暂时不支持分享文件夹');
        return;
      }
      this.shareFilename = row.name
      this.fileShareForm.fileId = row.id
      this.dialogShareFileVisible = true
    },
    closeFileShareForm() {
      this.created = false
      this.$refs.fileShareForm.resetFields()
      this.shareLinkText = ''
      this.dialogShareFileVisible = false
    },
    fileShare() {
      api.share({
        userId: this.$store.state.user.userId,
        fileId: this.fileShareForm.fileId,
        hasVerify: this.fileShareForm.hasVerify,
        mode: this.fileShareForm.mode
      }).then(res => {
        if (res.data) {
          let data = res.data
          this.created = true
          this.fileShareForm.url = window.location.origin + '/s?s=' + data.accessKey
          this.fileShareForm.code = data.code
          this.fileShareForm.expireAt = data.expireAt ? data.expireAt : '永久有效'
          this.shareLinkText = this.genShareLinkText(this.fileShareForm.url, this.fileShareForm.code)
        }
      }).catch(() => {
      })
    },
    genShareLinkText(link, code) {
      let text1 = `链接: ${link} 提取码: ${code}`
      let text2 = `链接: ${link}`
      return code ? text1 : text2;
    },
    // 复制分享链接
    copyShareLink() {
      let clipboard = new Clipboard('.tag-share-link')
      clipboard.on('success', e => {
        this.$message({
          message: '复制成功',
          type: 'success',
          duration: 1000
        });
        // 释放内存
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
    thumbnail(file) {
      return fileConfig.thumbnailUrl(this.$store.state.user.userId, file, this.$store.state.user.token);
    },
    downloadFile() {

    }
  },
}
</script>

<style lang="scss" scoped>
@import "src/styles/index";
@import "src/styles/home-index";
/*overflow: hidden;*/
/*white-space: nowrap;*/
/*text-overflow: ellipsis;*/
.dashboard-container {
  min-width: 498px;
  height: 100%;
}

/deep/ .app-wrapper {
  overflow-y: hidden;
}

/deep/ :focus {
  outline: 0;
}

/deep/ .el-drawer__header {
  color: #000000;

  span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.details-form {
  margin: 20px 10px 0 20px;

  /deep/ .el-form-item__content {
    white-space: normal;
    word-break: break-all;
    word-wrap: break-word;
  }

  /deep/ .el-form-item {
    margin-bottom: 0;
  }

  /deep/ .details-position {
    margin: 10px 0;

    .el-form-item__content {
      line-height: 20px;
    }

    .el-form-item__label {
      line-height: 20px;
    }
  }

  a:hover {
    color: #409EFF;
  }
}

.drawer-icon {
  text-align: center;
}

.drawer-icon-font /deep/ .svg-icon {
  font-size: 8rem;
}

.list-item {
  height: 50px;
}

.table-file-name:hover {
  color: #19ACF9;
}

/deep/ .plTableBox .el-table .el-table__header {
  th {
    background-color: #FFFFFF;
  }

  .is-sortable:hover {
    background-color: #f5f7fa;
  }
}

/deep/ .el-table td {
  padding: 0;
  height: 50px !important;
}

.home-link:hover {
  color: #409EFF;
}

.info-statistics {
  padding: 5px 0;
  float: right;
  width: 30%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: end;
  -ms-flex-pack: end;
  justify-content: flex-end;

  span {
    font-size: 12px;
    line-height: 16px;
    color: #666;
  }
}


/deep/ .el-input-tree {
  width: 50% !important;
}

/deep/ .el-input-tree-button {
  margin-left: 5px !important;
}

> > > .open-file-dialog {
  .el-dialog {
    width: 420px;
  }

  .svg-icon {
    font-size: 20px;
  }

  .dialog-msg {
    margin-left: 10px;
  }
}

> > > .v-contextmenu-item {
  .svg-icon {
    font-size: 14px;
  }
}

> > > .new-text-file-dialog {
  height: 350px;
  top: calc(50% - 175px);

  .el-dialog {
    width: 420px;

    .el-dialog__header {
      padding: 15px 20px 15px;
    }

    .dialog-footer {
      .el-loading-spinner {
        margin-top: -13px;

        .circular {
          height: 26px;
          width: 26px;
        }
      }
    }
  }
}

> > > .van-grid-item__content {
  background-size: cover;
  background-position: center;
}

.vmode {
  padding: 5px 10px;
  margin-left: -5px;
}
</style>
