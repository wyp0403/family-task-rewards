import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 懒加载路由组件
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Tasks = () => import('../views/Tasks.vue')
const TaskDetail = () => import('../views/TaskDetail.vue')
const Rewards = () => import('../views/Rewards.vue')
const RewardDetail = () => import('../views/RewardDetail.vue')
const Points = () => import('../views/Points.vue')
const Leaderboard = () => import('../views/Leaderboard.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: Rewards,
    meta: { requiresAuth: true }
  },
  {
    path: '/rewards/:id',
    name: 'RewardDetail',
    component: RewardDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/points',
    name: 'Points',
    component: Points,
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  
  // 需要登录的路由
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // 只有未登录用户可访问的路由（如登录页）
  else if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
  }
  // 其他情况正常导航
  else {
    next()
  }
})

export default router