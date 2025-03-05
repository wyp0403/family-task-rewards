<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">积分排行榜</h1>
    
    <div class="bg-white shadow rounded-lg p-6">
      <div v-if="loading" class="text-center py-4">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="leaderboardData.length === 0" class="text-center py-4">
        <p>暂无排行数据</p>
      </div>
      
      <div v-else>
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-left py-2">排名</th>
              <th class="text-left py-2">用户名</th>
              <th class="text-right py-2">总积分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in leaderboardData" :key="user.id" class="border-b border-gray-100">
              <td class="py-3">{{ index + 1 }}</td>
              <td class="py-3">{{ user.username }}</td>
              <td class="py-3 text-right font-medium">{{ user.totalPoints }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Leaderboard',
  
  setup() {
    const store = useStore()
    const loading = ref(true)
    const leaderboardData = ref([])
    
    onMounted(async () => {
      try {
        // 这里可以添加获取排行榜数据的逻辑
        // 例如: const response = await pointService.getLeaderboard()
        // 目前使用模拟数据
        leaderboardData.value = [
          { id: 1, username: '小明', totalPoints: 250 },
          { id: 2, username: '小红', totalPoints: 180 },
          { id: 3, username: '小华', totalPoints: 120 }
        ]
      } catch (error) {
        console.error('获取排行榜数据失败:', error)
      } finally {
        loading.value = false
      }
    })
    
    return {
      loading,
      leaderboardData
    }
  }
}
</script>