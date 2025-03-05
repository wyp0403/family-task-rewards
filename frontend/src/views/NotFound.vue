<template>
  <div class="container mx-auto px-4 py-16 text-center">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 class="text-3xl font-semibold text-gray-600 mb-8">页面未找到</h2>
    <p class="text-lg text-gray-500 mb-8">
      您访问的页面不存在或已被移除
    </p>
    <router-link 
      to="/" 
      class="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
    >
      返回首页
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>