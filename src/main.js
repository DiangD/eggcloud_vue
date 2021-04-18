// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import ViewUI from 'view-design';
import 'element-ui/lib/theme-chalk/index.css';

import '@/styles/index.scss' //global css
import 'view-design/dist/styles/iview.css';
import store from './store'
import '@/icons' // icon
import '@/permission' // permission control

import contentmenu from 'v-contextmenu'
import 'v-contextmenu/dist/index.css'

Vue.use(contentmenu)


Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(ViewUI)

import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

Vue.component('font-awesome-icon', FontAwesomeIcon);


import EVueContextmenu from 'e-vue-contextmenu'

Vue.use(EVueContextmenu)

import {
  Popup,
  Search,
  Button,
  Cell,
  CellGroup,
  Image,
  List,
  PullRefresh,
  SwipeCell,
  Col,
  Row,
  Divider,
  Sticky,
  NavBar,
  Icon,
  Tabbar,
  TabbarItem,
  ActionSheet,
  Field,
  Overlay,
  Checkbox,
  CheckboxGroup,
  Grid,
  GridItem
} from 'vant';

// 有赞的移动UI
Vue.use(Popup);
Vue.use(Search);
Vue.use(Button);
Vue.use(Cell);
Vue.use(CellGroup);
Vue.use(Image);
Vue.use(List);
Vue.use(PullRefresh);
Vue.use(SwipeCell);
Vue.use(Col);
Vue.use(Row);
Vue.use(Divider);
Vue.use(Sticky);
Vue.use(NavBar);
Vue.use(Icon);
Vue.use(Tabbar);
Vue.use(TabbarItem);
Vue.use(ActionSheet);
Vue.use(Field);
Vue.use(Overlay);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Grid);
Vue.use(GridItem);

import Viewer from 'v-viewer'

Vue.use(Viewer)

import APlayer from '@moefe/vue-aplayer'

Vue.use(APlayer, {
  defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60', // 设置播放器默认封面图片
  productionTip: false, // 是否在控制台输出版本信息
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}).$mount('#app');

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
  Vue.prototype.$pc = false
} else {
  Vue.prototype.$pc = true
  let winWidth = document.documentElement.offsetWidth ||
    document.body.offsetWidth
  winWidth = winWidth < 1366 ? 1366 : winWidth
  const oHtml = document.getElementsByTagName('html')[0]
  oHtml.style.fontSize = 100 * winWidth / 1920 + 'px'
  window.addEventListener('resize', function () {
    let winWidth = document.documentElement.offsetWidth || document.body.offsetWidth
    winWidth = winWidth < 1366 ? 1366 : winWidth
    const oHtml = document.getElementsByTagName('html')[0]
    oHtml.style.fontSize = 100 * winWidth / 1920 + 'px'
  })
}
