<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <h1>{{ $t('common.appName') }}</h1>
        </div>
        <div class="navbar-menu">
          <router-link to="/dashboard">{{ $t('dashboard.welcome', { name: currentUser ? currentUser.fullName : '' }) }}</router-link>
          <router-link to="/tasks">{{ $t('dashboard.tasks') }}</router-link>
          <router-link to="/rewards">{{ $t('dashboard.rewards') }}</router-link>
          <router-link to="/points">{{ $t('dashboard.points') }}</router-link>
          <router-link to="/leaderboard">{{ $t('dashboard.leaderboard') }}</router-link>
          <a href="#" @click.prevent="logout">{{ $t('common.logout') }}</a>
        </div>
      </div>
    </nav>
    
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'currentUser'])
  },
  
  methods: {
    ...mapActions('auth', ['logout', 'getCurrentUser']),
    
    async initApp() {
      // 如果已经登录，获取最新的用户信息
      if (this.isAuthenticated) {
        try {
          await this.getCurrentUser()
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }
      }
    }
  },
  
  created() {
    this.initApp()
  }
}
</script>

<style>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 导航栏样式 */
.navbar {
  background-color: #4CAF50;
  color: white;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h1 {
  font-size: 1.5rem;
  margin: 0;
}

.navbar-menu {
  display: flex;
  gap: 1.5rem;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
}

.navbar-menu a:hover,
.navbar-menu a.router-link-active {
  color: #e0e0e0;
  border-bottom: 2px solid white;
}

/* 主内容区域 */
main.container {
  padding-top: 1rem;
  padding-bottom: 3rem;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* 按钮样式 */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navbar-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>