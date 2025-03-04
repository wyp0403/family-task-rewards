<template>
  <div class="login-page">
    <div class="card login-card">
      <h2 class="card-title">{{ $t('auth.login') }}</h2>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username" class="form-label">{{ $t('auth.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('auth.login') }}
          </button>
        </div>
      </form>
      
      <div class="register-link">
        <p>{{ $t('auth.register') }}? <router-link to="/register">{{ $t('auth.register') }}</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Login',
  
  data() {
    return {
      username: '',
      password: ''
    }
  },
  
  computed: {
    ...mapGetters('auth', ['loading', 'error'])
  },
  
  methods: {
    ...mapActions('auth', ['login', 'clearError']),
    
    async handleLogin() {
      try {
        await this.login({
          username: this.username,
          password: this.password
        })
        
        // 登录成功，显示成功消息并跳转到仪表板
        this.$router.push('/dashboard')
      } catch (error) {
        // 错误已经在store中处理
        console.error('登录失败:', error)
      }
    }
  },
  
  // 组件销毁时清除错误
  beforeUnmount() {
    this.clearError()
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-title {
  text-align: center;
  margin-bottom: 2rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.btn {
  width: 100%;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>