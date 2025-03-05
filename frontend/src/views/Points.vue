<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">积分历史</h1>
    
    <div class="bg-white shadow rounded-lg p-6">
      <div class="mb-6">
        <p class="text-xl font-medium">
          当前积分: <span class="text-blue-600">{{ currentPoints }}</span>
        </p>
      </div>
      
      <div v-if="loading" class="text-center py-4">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="pointHistory.length === 0" class="text-center py-4">
        <p>暂无积分记录</p>
      </div>
      
      <div v-else>
        <h2 class="text-xl font-semibold mb-4">积分历史记录</h2>
        
        <div class="space-y-4">
          <div 
            v-for="record in pointHistory" 
            :key="record.id" 
            class="border-b border-gray-100 pb-4"
          >
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">{{ record.description }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(record.timestamp) }}</p>
              </div>
              <div :class="record.points > 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold">
                {{ record.points > 0 ? '+' : '' }}{{ record.points }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Points',
  
  setup() {
    const store = useStore()
    const loading = ref(true)
    const pointHistory = ref([])
    
    const currentPoints = computed(() => {
      return store.getters['point/getCurrentPoints'] || 0
    })
    
    onMounted(async () => {
      try {
        // 这里可以添加获取积分历史的逻辑
        // 例如: await store.dispatch('point/fetchPointHistory')
        // 目前使用模拟数据
        pointHistory.value = [
          { 
            id: 1, 
            description: '完成任务: 整理房间', 
            points: 10, 
            timestamp: new Date(Date.now() - 86400000) 
          },
          { 
            id: 2, 
            description: '完成任务: 做家庭作业', 
            points: 15, 
            timestamp: new Date(Date.now() - 172800000) 
          },
          { 
            id: 3, 
            description: '兑换奖品: 冰淇淋', 
            points: -20, 
            timestamp: new Date(Date.now() - 259200000) 
          }
        ]
      } catch (error) {
        console.error('获取积分历史失败:', error)
      } finally {
        loading.value = false
      }
    })
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return {
      loading,
      pointHistory,
      currentPoints,
      formatDate
    }
  }
}
</script>