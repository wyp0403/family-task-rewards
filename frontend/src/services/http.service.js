import axios from 'axios'

// 创建axios实例，使用环境变量中的API URL
const apiClient = axios.create({
  baseURL: `${process.env.VUE_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data.data
  },
  (error) => {
    // 处理错误响应
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'サーバーエラーが発生しました'
    
    // 如果是401错误（未授权），可能是令牌过期
    if (error.response && error.response.status === 401) {
      // 清除本地存储中的令牌
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // 如果不在登录页，重定向到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiClient