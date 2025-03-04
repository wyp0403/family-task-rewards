<template>
  <div class="task-detail-page">
    <div class="page-header">
      <h1 class="page-title">{{ isNewTask ? $t('tasks.newTask') : $t('tasks.updateTask') }}</h1>
      <button @click="goBack" class="btn btn-secondary">
        {{ $t('common.back') }}
      </button>
    </div>
    
    <div class="card">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title" class="form-label">{{ $t('tasks.taskName') }}</label>
          <input
            id="title"
            v-model="taskForm.title"
            type="text"
            class="form-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description" class="form-label">{{ $t('tasks.description') }}</label>
          <textarea
            id="description"
            v-model="taskForm.description"
            class="form-input"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="points" class="form-label">{{ $t('tasks.points') }}</label>
          <input
            id="points"
            v-model.number="taskForm.points"
            type="number"
            class="form-input"
            min="1"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="dueDate" class="form-label">{{ $t('tasks.dueDate') }}</label>
          <input
            id="dueDate"
            v-model="taskForm.dueDate"
            type="date"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="assignedTo" class="form-label">{{ $t('tasks.assignedTo') }}</label>
          <select
            id="assignedTo"
            v-model="taskForm.assignedTo"
            class="form-input"
            required
          >
            <option value="" disabled>{{ $t('common.select') }}</option>
            <option v-for="member in familyMembers" :key="member.id" :value="member.id">
              {{ member.fullName }} ({{ member.role === 'parent' ? $t('auth.parent') : $t('auth.child') }})
            </option>
          </select>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'TaskDetail',
  
  data() {
    return {
      taskForm: {
        title: '',
        description: '',
        points: 10,
        dueDate: '',
        assignedTo: ''
      },
      familyMembers: [],
      isNewTask: true
    }
  },
  
  computed: {
    ...mapGetters('auth', ['currentUser', 'isParent', 'familyId']),
    ...mapGetters('task', ['currentTask', 'loading', 'error']),
    
    taskId() {
      return this.$route.params.id
    }
  },
  
  methods: {
    ...mapActions('task', ['createTask', 'getTaskById', 'clearError']),
    
    async loadFamilyMembers() {
      try {
        // 这里应该调用获取家庭成员的API
        // 由于我们没有创建这个API，这里使用模拟数据
        // 实际项目中应该替换为真实API调用
        this.familyMembers = [
          {
            id: 'child1',
            fullName: '山田太郎',
            role: 'child'
          },
          {
            id: 'child2',
            fullName: '山田花子',
            role: 'child'
          }
        ]
        
        // 如果当前用户是父母，也可以给自己分配任务
        if (this.isParent && this.currentUser) {
          this.familyMembers.push({
            id: this.currentUser.id,
            fullName: this.currentUser.fullName,
            role: 'parent'
          })
        }
      } catch (error) {
        console.error('加载家庭成员失败:', error)
      }
    },
    
    async loadTask() {
      if (!this.taskId || this.taskId === 'new') {
        this.isNewTask = true
        return
      }
      
      this.isNewTask = false
      
      try {
        await this.getTaskById(this.taskId)
        
        if (this.currentTask) {
          // 填充表单数据
          this.taskForm = {
            title: this.currentTask.title,
            description: this.currentTask.description || '',
            points: this.currentTask.points,
            dueDate: this.currentTask.dueDate ? new Date(this.currentTask.dueDate).toISOString().split('T')[0] : '',
            assignedTo: this.currentTask.assignedTo
          }
        }
      } catch (error) {
        console.error('加载任务失败:', error)
      }
    },
    
    async handleSubmit() {
      try {
        const taskData = {
          ...this.taskForm,
          dueDate: this.taskForm.dueDate ? new Date(this.taskForm.dueDate).toISOString() : null
        }
        
        if (this.isNewTask) {
          await this.createTask(taskData)
        } else {
          // 更新任务的逻辑，这里省略
        }
        
        // 返回任务列表页面
        this.$router.push('/tasks')
      } catch (error) {
        console.error('保存任务失败:', error)
      }
    },
    
    goBack() {
      this.$router.back()
    }
  },
  
  async created() {
    // 检查是否有权限访问此页面
    if (!this.isParent) {
      this.$router.push('/dashboard')
      return
    }
    
    await this.loadFamilyMembers()
    await this.loadTask()
  },
  
  beforeUnmount() {
    this.clearError()
  }
}
</script>

<style scoped>
.task-detail-page {
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

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

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

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>