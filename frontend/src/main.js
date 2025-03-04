import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { createI18n } from 'vue-i18n'
import messages from './locales'

// 创建i18n实例
const i18n = createI18n({
  locale: 'ja', // 设置默认语言为日语
  fallbackLocale: 'en',
  messages
})

// 创建Vue应用
const app = createApp(App)

// 使用插件
app.use(store)
app.use(router)
app.use(i18n)

// 挂载应用
app.mount('#app')