<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('tasks.allTasks') }}</h1>
      <div class="page-actions" v-if="isParent">
        <router-link to="/tasks/new" class="btn btn-primary">
          {{ $t('tasks.newTask') }}
        </router-link>
      </div>
    </div>
    
    <!-- 任务过滤器 -->
    <div class="filter-bar">
      <div class="filter-group">
        <button 
          @click="activeFilter = 'all'" 
          class="filter-btn" 
          :class="{ active: activeFilter === 'all' }"
        >
          {{ $t('tasks.allTasks') }}
        </button>
        <button 
          @click="activeFilter = 'pending'" 
          class="filter-btn" 
          :class="{ active: activeFilter === 'pending' }"
        >
          {{ $t('tasks.pending') }}
        </button>
        <button 
          @click="activeFilter = 'completed'" 
          class="filter-btn" 
          :class="{ active: activeFilter === 'completed' }"
        >
          {{ $t('tasks.completed') }}
        </button>
        <button 
          @click="activeFilter = 'approved'" 
          class="filter-btn" 
          :class="{ active: activeFilter === 'approved' }"
        >
          {{ $t('tasks.approved') }}
        </button>
        <button 
          @click="activeFilter = 'rejected'" 
          class="filter-btn" 
          :class="{ active: activeFilter === 'rejected' }"
        >
          {{ $t('tasks.rejected') }}
        </button>
      </div>
    </div>
    
    <!-- 任务列表 -->
    <div v-if="loading" class="loading-container">
      <p>{{ $t('common.loading') }}</p>
    </div>
    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>{{ $t('tasks.noTasks') }}</p>
    </div>
    <div v-else class="tasks-grid">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <div class="task-header">
          <h3 class="task-title">{{ task.title }}</h3>
          <span class="task-status" :class="getStatusClass(task.status)">
            {{ $t(`tasks.${task.status}`) }}
          </span>
        </div>
        <div class="task-body">
          <p class="task-description">{{ task.description }}</p>
          <div class="task-meta">
            <div class="task-points">
              <strong>{{ $t('tasks.points') }}:</strong> {{ task.points }}
            </div>
            <div v-if="task.dueDate" class="task-due-date">
              <strong>{{ $t('tasks.dueDate') }}:</strong> {{ formatDate(task.dueDate) }}
            </div>
          </div>
        </div>
        <div class="task-footer">
          <!-- 孩子可以标记任务为已完成 -->
          <button 
            v-if="isChild && task.status === 'pending' && task.assignedTo === currentUser.id" 
            @click="completeTask(task.id)" 
            class="btn btn-primary btn-sm"
          >
            {{ $t('tasks.markAsCompleted') }}
          </button>
          
          <!-- 父母可以批准或拒绝已完成的任务 -->
          <div v-if="isParent && task.status === 'completed'" class="task-actions">
            <button @click="approveTask(task.id)" class="btn btn-primary btn-sm">
              {{ $t('tasks.approve') }}
            </button>
            <button @click="rejectTask(task.id)" class="btn btn-danger btn-sm">
              {{ $t('tasks.reject') }}
            </button>
          </div>
          
          <!-- 父母可以删除任务 -->
          <button 
            v-if="isParent" 
            @click="confirmDeleteTask(task)" 
            class="btn btn-danger btn-sm"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ $t('common.confirm') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ $t('tasks.confirmDelete') }}</p>
          <p><strong>{{ taskToDelete?.title }}</strong></p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn btn-secondary">
            {{ $t('common.cancel') }}
          </button>
          <button @click="deleteTask" class="btn btn-danger">
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Tasks',
  
  data() {
    return {
      activeFilter: 'all',
      showDeleteConfirm: false,
      taskToDelete: null
    }
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isParent', 'isChild', 'familyId']),
    ...mapGetters('task', ['allTasks', 'loading', 'error']),
    
    filteredTasks() {
      if (this.activeFilter === 'all') {
        return this.allTasks
      }
      
      return this.allTasks.filter(task => task.status === this.activeFilter)
    }
  },
  
  methods: {
    ...mapActions('task', ['getFamilyTasks', 'getUserTasks', 'updateTaskStatus', 'deleteTask']),
    
    getStatusClass(status) {
      switch (status) {
        case 'pending':
          return 'status-pending'
        case 'completed':
          return 'status-completed'
        case 'approved':
          return 'status-approved'
        case 'rejected':
          return 'status-rejected'
        default:
          return ''
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('ja-JP').format(date)
    },
    
    async completeTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'completed'
        })
        
        // 刷新任务列表
        this.loadTasks()
      } catch (error) {
        console.error('完成任务失败:', error)
      }
    },
    
    async approveTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'approved'
        })
        
        // 刷新任务列表
        this.loadTasks()
      } catch (error) {
        console.error('批准任务失败:', error)
      }
    },
    
    async rejectTask(taskId) {
      try {
        await this.updateTaskStatus({
          taskId,
          status: 'rejected'
        })
        
        // 刷新任务列表
        this.loadTasks()
      } catch (error) {
        console.error('拒绝任务失败:', error)
      }
    },
    
    confirmDeleteTask(task) {
      this.taskToDelete = task
      this.showDeleteConfirm = true
    },
    
    cancelDelete() {
      this.showDeleteConfirm = false
      this.taskToDelete = null
    },
    
    async deleteTask() {
      if (!this.taskToDelete) return
      
      try {
        await this.deleteTask(this.taskToDelete.id)
        
        // 关闭确认对话框
        this.showDeleteConfirm = false
        this.taskToDelete = null
        
        // 刷新任务列表
        this.loadTasks()
      } catch (error) {
        console.error('删除任务失败:', error)
      }
    },
    
    async loadTasks() {
      try {
        if (this.isParent) {
          await this.getFamilyTasks()
        } else {
          await this.getUserTasks()
        }
      } catch (error) {
        console.error('加载任务失败:', error)
      }
    }
  },
  
  created() {
    this.loadTasks()
  }
}
</script>

<style scoped>
.tasks-page {
  padding: 1rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.filter-bar {
  margin-bottom: 2rem;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  margin: 0;
  font-size: 1.2rem;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-approved {
  background-color: #cce5ff;
  color: #004085;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.task-body {
  flex: 1;
  margin-bottom: 1.5rem;
}

.task-description {
  margin-bottom: 1rem;
  color: #555;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.task-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.loading-container {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

/* 模态对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    justify-content: center;
  }
}
</style>