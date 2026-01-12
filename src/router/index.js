import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/detail/:id',
      name: 'MovieDetail',
      component: () => import('@/views/MovieDetail.vue'),
    },
    {
      path: '/clips/:id',
      name: 'Clips',
      component: () => import('@/views/Clips.vue'),
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/Search.vue'),
    },
    {
      path: '/all-films',
      name: 'AllFilms',
      component: () => import('@/views/AllFilms.vue'), 
    },
    
    {
      path: '/classify',
      name: 'Classify',
      component: () => import('@/views/Classify.vue'), 
    },
    //登录路由
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    //注册路由
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
    },
    //用户中心路由
    {
      path: '/user',
      name: 'User',
      component: () => import('@/views/user.vue'),
      meta: { requiresAuth: true }, // 需要登录才能访问
    },
    //个人中心路由（别名）
    {
      path: '/personal',
      name: 'Personal',
      component: () => import('@/views/user.vue'),
      meta: { requiresAuth: true }, // 需要登录才能访问
    },
  ],
})

//路由守卫，检查登录状态（无需修改）
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  // 如果页面需要登录，但用户未登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login') // 跳转到登录页
  } else if (to.path === '/login' && isLoggedIn) {
    next('/') // 已登录用户访问登录页，跳转到首页
  } else {
    next() // 正常放行
  }
})

export default router
