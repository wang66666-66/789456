import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/Home.vue'),
    meta: { title: '地图探索' }
  },
  {
    path: '/solar-term',
    name: 'solar-term',
    component: () => import('@/views/SolarTerm.vue'),
    meta: { title: '二十四节气' }
  },
  {
    path: '/academy',
    name: 'academy',
    component: () => import('@/views/Academy.vue'),
    meta: { title: '知味学堂' }
  },
  {
    path: '/academy/login',
    name: 'academy-login',
    component: () => import('@/views/AcademyLogin.vue'),
    meta: { title: '学堂登录' }
  },
  {
    path: '/academy/register',
    name: 'academy-register',
    component: () => import('@/views/AcademyRegister.vue'),
    meta: { title: '学堂注册' }
  },
  {
    path: '/four-seasons-eight-cuisines',
    name: 'four-seasons-eight-cuisines',
    component: () => import('@/views/FourSeasonsEightCuisines.vue'),
    meta: { title: '四时八珍' }
  },
  {
    path: '/season-cuisine',
    redirect: '/four-seasons-eight-cuisines'
  },
  {
    path: '/solar',
    redirect: '/solar-term'
  },
  {
    path: '/dish/:id',
    name: 'dish-detail',
    component: () => import('@/views/DishDetail.vue'),
    meta: { title: '美食详情' }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `知味集 | ${to.meta.title}`

  // 知味学堂需要登录
  const userStore = useUserStore()
  if (to.name === 'academy' && !userStore.isLoggedIn) {
    next({ name: 'academy-login', query: { redirect: to.fullPath } })
    return
  }
  if (to.name === 'academy-login' && userStore.isLoggedIn) {
    next({ name: 'academy' })
    return
  }
  if (to.name === 'academy-register' && userStore.isLoggedIn) {
    next({ name: 'academy' })
    return
  }

  next()
})