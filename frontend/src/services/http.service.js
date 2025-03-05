import axios from 'axios'

// 创建axios实例，使用环境变量中的API URL
const apiClient = axios.create({
  baseURL: `${process.env.VUE_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  // 增加超时时间，因为Render免费服务可能需要时间唤醒
  timeout: 30000
})

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config) => {
    console.log(`发送请求到: ${config.baseURL}${config.url}`, config);
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    console.log(`收到响应: ${response.config.url}`, response.data);
    // 直接返回响应数据
    return response.data.data
  },
  (error) => {
    console.error('API错误:', error.message);
    console.error('请求配置:', error.config);
    
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('错误响应:', error.response.data);
      console.error('错误状态:', error.response.status);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('没有收到响应，服务器可能离线或正在启动');
      
      // 如果是超时错误，提供更友好的错误信息
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('服务器响应超时，可能正在启动中，请稍后再试'))
      }
    }
    
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

// 添加一个简单的测试方法，用于检查API是否可用
apiClient.checkConnection = async () => {
  try {
    // 尝试访问根路径，检查服务是否在线
    await axios.get(process.env.VUE_APP_API_URL);
    console.log('API服务在线');
    return true;
  } catch (error) {
    console.error('API连接测试失败:', error.message);
    return false;
  }
};

export default apiClient