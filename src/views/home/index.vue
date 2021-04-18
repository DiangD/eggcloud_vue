<template>
  <ShowFile
    :defaultGrid="true"
    :orderCustom="true"
    :context-menus="contextMenus"
    :sortable="sortable"
  ></ShowFile>
</template>

<script>

import ShowFile from "@/components/ShowFile/ShowFile";

export default {
  name: "index",
  components: {ShowFile},
  data() {
    return {
      sortable: {
        prop: 'name', order: 'ascending'
      },
      contextMenus: [ // contextmenuClick
        {
          label: '查看', operation: 'viewMode', child: [
            {iconClass: this.grid ? '' : 'menu-point', label: '列表', operation: 'vmode-list'},
            {iconClass: this.grid ? 'menu-point' : '', label: '缩略图', operation: 'vmode-grid'},
          ]
        },
        {
          label: '排列方式', operation: 'arrangement', child: [
            {label: '名称', operation: 'orderName', orderProp: 'name'},
            {label: '大小', operation: 'orderSize', orderProp: 'size'},
            {label: '日期', operation: 'orderModifyAt', orderProp: 'modify_at'},
          ]
        },
        {label: '刷新', operation: 'refresh'},
        {divider: true, operation: 'divider'},
        {label: '写文章', operation: 'createMarkdownFile'},
        {label: '新建文件', operation: 'createTextFile'},
      ]
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>

* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -moz-user-select: none; /*火狐*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}

input {
  -webkit-user-select: auto; /*webkit浏览器*/
}

.tab-bottom {
  padding: 0 0 25px 0;

  .van-tabbar-item {
    margin-top: 25px;
    animation: ordinary .4s forwards;
    -moz-animation: ordinary .4s forwards; /* Firefox */
    -webkit-animation: ordinary .4s forwards; /* Safari and Chrome */
    -o-animation: ordinary .4s forwards; /* Opera */
  }
}

@keyframes iphoneX {
  from {
    margin-top: 25px;
  }
  to {
    margin-top: -5px;
  }
}

@keyframes ordinary {
  from {
    margin-top: -5px;
  }
  to {
    margin-top: 25px;
  }
}

.tab-bottom-iphoneX {
  padding: 0 0 25px 0;

  .van-tabbar-item {
    animation: iphoneX .4s forwards;
    -moz-animation: iphoneX .4s forwards; /* Firefox */
    -webkit-animation: iphoneX .4s forwards; /* Safari and Chrome */
    -o-animation: iphoneX .5s forwards; /* Opera */
  }
}

.tab-bottom-iphoneXS {
  padding: 0 0 25px 0;

  .van-tabbar-item {
    animation: iphoneX .4s forwards;
    -moz-animation: iphoneX .4s forwards; /* Firefox */
    -webkit-animation: iphoneX .4s forwards; /* Safari and Chrome */
    -o-animation: iphoneX .4s forwards; /* Opera */
  }
}

.van-tabbar-item {
  color: #646566;
  text-align: center;
  margin-top: 20px;
  font-size: 10px;

  .tab-text {
    margin-top: 2px;
  }
}

.container {
  font-size: 14px;

  .classification {
    padding: 1rem 0 1rem 0;
    background: wheat;
  }

}

/deep/ .svg-icon {
  width: 2.5em;
  height: 2.5em;
}

/*.van-divider {*/
/*margin: 5px 15px 0px 15px;*/
/*}*/
.file-description {
  color: #646566;
  font-size: 12px;
}

.van-col {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.list-item {
  padding: 5px 10px;

  .list-cell-icon {
    font-size: 18px;
  }

  .list-item-content {
    margin-left: 5px;
  }
}

.overlay-content-class {
  -webkit-transition: all .1s ease-in-out 0s;
  transition: all .1s ease-in-out 0s;
  box-shadow: 2px 3px 3px #888888;

}

.list-item:active {
  background-color: #bfcbd930;
}

/deep/ .van-sticky {
  background: inherit;
  -webkit-backdrop-filter: saturate(180%) blur(10px);
  backdrop-filter: saturate(180%) blur(10px);
  background-color: rgba(255, 255, 255, 0.72);
  box-shadow: 2px 0 2px rgba(0, 0, 0, 0.25);
}

[class*=van-hairline]::after {
  border: 0 solid rgba(255, 255, 255, 0.72);
}

/deep/ .van-sticky--fixed {
  z-index: 1;
}

.van-nav-bar {
  /*height: 59px;*/
  /*line-height: 59px;*/
  background-color: unset;
  -webkit-transition: all .15s ease-in-out 0s;
  transition: all .15s ease-in-out 0s;
  /*position: relative;*/
  /*box-shadow: 4px 0 2px rgba(0,0,0,0.5);*/
}

.van-nav-bar::after {
  /*background: inherit;*/
  /*!*-webkit-filter: blur(15px);*!*/
  /*!*filter: blur(20px);*!*/
  /*-webkit-backdrop-filter: saturate(180%) blur(20px);*/
  /*backdrop-filter: saturate(180%) blur(20px);*/
  /*background-color: rgba(255,255,255,0.72);*/
}

.van-overlay {
  -webkit-backdrop-filter: saturate(180%) blur(1.5px);
  backdrop-filter: saturate(180%) blur(1.5px);
  background-color: rgba(0, 0, 0, .7);
}

.van-nav-bar__title {
  width: 30%;
  position: absolute;
  margin-left: 35%;
  z-index: 11;
}

.van-nav-bar__left {
  //  max-width: 30%;
  z-index: 11;

  .van-icon-arrow-left {
    font-size: 24px;
  }
}

/*.van-nav-bar__left:active {*/
/*background-color: #f8f8f8;*/
/*!*background-color: hsl(0, 94%, 47%);*!*/
/*}*/
.van-nav-bar__right {
  z-index: 11;
}

.van-nav-bar__arrow + .van-nav-bar__text {
  max-width: 7.5rem;
  min-width: 5.5rem;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.new-folder-input /deep/ .van-field__body {
  height: 40px;
}

.newFileMenu ul {
  list-style: none;
  padding-inline-start: 0px;
  margin-top: 0;
  margin-bottom: 0;
}

.newFileMenu {
  color: #000000db;
  background-color: #efefef;
  padding: 1px 0;
}

/deep/ .menu-background::after {
  background: inherit;
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  background-color: rgba(255, 255, 255, 0.72);
}

.newFileMenu li {
  cursor: pointer;
  margin: 0;
  padding: 0;
  font-size: 1em;
  min-width: 136px;
  height: 3em;
}

.newFileMenu .remove {
  color: rgba(255, 0, 0, 0.8);
}

.newFileMenu .menu-list-first li:active {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  background-color: #E1E1E1;
}

.newFileMenu .menu-list li:active {
  background-color: #E1E1E1;
}

.newFileMenu .menu-list-last li:active {
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
  background-color: #E1E1E1;
}

/*.newFileMenu li:active {*/
/*cursor: pointer;*/
/*border-radius: 1rem;*/
/*background-color: #cccccc;*/
/*}*/

.newFileMenu li .menuitem {
  cursor: pointer;
  line-height: 3em;;
  margin-left: 10%;
}

.newFileMenu li .menuitem .text {
  cursor: pointer;
  margin-left: 10%;
  font-weight: normal;
}

.newFileMenu li .menuitem .svg-icon {
  width: 1rem;
  height: 1rem;
}

/deep/ .ctx-menu-container {
  top: unset;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 1rem;
  -webkit-box-shadow: 0 0 0 #ccc;
  box-shadow: 0 0 0 #ccc;
}

.header-button {
  margin: 0 -16px;
  padding: 0 16px;
}

.header-button-icon {
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}

.header-button:active {
  background-color: #f2f3f5;
}

.left-menu {
  padding: 1rem 0 0 0;
  height: 100%;
  width: 100%;
  text-align: center;
}

.logout {
  padding: 1rem 0 0 0;
}

.classification {
  padding: 1rem 0 0 0;

  /deep/ .van-cell:active {
    background-color: #f8f8f8;
  }
}

.searchbar {
  height: 48px;
  background-color: unset;
  -webkit-transition: all .3s ease-in-out 0s;
  transition: all .3s ease-in-out 0s;
  /*background: inherit;*/
  /*background-color: #fff;*/
  /*-webkit-backdrop-filter: saturate(180%) blur(20px);*/
  /*backdrop-filter: saturate(180%) blur(20px);*/
  /*background-color: rgba(255,255,255,0.72);*/
}

/*.searchbar::after{*/
/*background: inherit;*/
/*background-color: #fff;*/
/*-webkit-backdrop-filter: saturate(180%) blur(20px);*/
/*backdrop-filter: saturate(180%) blur(20px);*/
/*background-color: rgba(255,255,255,0.72);*/
/*}*/
.van-search {
  padding: 0 12px;
}

.van-search__action {
  -webkit-transition: all .3s ease-in-out 0s;
  transition: all .3s ease-in-out 0s;
  margin-right: -44px;
  visibility: hidden;
}

.search-result {
  font-weight: 600;
  font-size: 20px;
}

.search-result-no {
  height: 80px;
  line-height: 80px;
  font-weight: 600;
  font-size: 20px;
  text-align: center;
}

.operating-header {
  .operating-header-col {
    height: 28px;
    color: #1989fa;

    .sortable {
      font-size: 14px !important;
    }

    .van-icon {
      line-height: 28px;
      font-size: 20px;
      color: #1989fa;
    }
  }

  .operating-header-col:active {
    color: #C2CCD1;

    .van-icon {
      color: #C2CCD1;
    }
  }
}

/deep/ .grid-item-text {
  text-align: center;
  color: #606266;
  font-size: smaller;
  word-wrap: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
