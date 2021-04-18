import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)


export const constantRoutes = [
  {
    path: '/login',
    component: require('@/views/index/login').default,
    hidden: true
  },
  {
    path: '/register',
    component: require('@/views/index/register').default,
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 404 page must be placed at the end !!!
  {path: '*', redirect: '/404', hidden: true}
]

export const dynamicRouters = []

const createRouter = () => new Router({
  mode: 'history',
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter(params) {
  router.options.routes = []
  const newRouter = createRouter()
  if (params) {
    newRouter.addRoutes(params)
  }
  newRouter.addRoutes(dynamicRouters)
  router.matcher = newRouter.matcher // reset router
}

router.addRoutes(dynamicRouters)

export default router
