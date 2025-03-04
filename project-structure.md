# 家庭任务积分兑换小程序 - 项目结构

```
family-task-rewards/
│
├── frontend/                  # 前端代码 (Vue.js)
│   ├── public/                # 静态资源
│   ├── src/                   # 源代码
│   │   ├── assets/           # 图片等资源
│   │   ├── components/       # Vue组件
│   │   ├── views/            # 页面视图
│   │   ├── router/           # 路由配置
│   │   ├── store/            # Vuex状态管理
│   │   ├── locales/          # 国际化文件 (日语)
│   │   ├── services/         # API服务
│   │   ├── App.vue           # 根组件
│   │   └── main.js           # 入口文件
│   ├── package.json          # 依赖配置
│   └── vue.config.js         # Vue配置
│
├── backend/                   # 后端代码 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # API路由
│   │   ├── middleware/       # 中间件
│   │   ├── services/         # 业务逻辑
│   │   ├── utils/            # 工具函数
│   │   └── app.js            # 应用入口
│   ├── package.json          # 依赖配置
│   └── .env                  # 环境变量
│
└── README.md                  # 项目说明
```