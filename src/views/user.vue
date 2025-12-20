<template>
  <!-- 主容器 - 使用全宽布局 -->
  <div class="user-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1><i class="fas fa-user-circle"></i> 个人中心</h1>
      <div class="user-welcome">欢迎回来！</div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <!-- 使用你的 ProfileUserInfo 组件 -->
      <ProfileUserInfo />
    </div>

    <!-- 两列内容区域 -->
    <div class="content-grid">
      <!-- 评论区域 -->
      <div class="content-card">
        <div class="card-header">
          <h2><i class="fas fa-comments"></i> 我的评论</h2>
          <span class="item-count" v-if="commentCount > 0">{{ commentCount }} 条</span>
        </div>
        <ProfileComments />
      </div>

      <!-- 收藏区域 -->
      <div class="content-card">
        <div class="card-header">
          <h2><i class="fas fa-heart"></i> 我的收藏</h2>
          <span class="item-count" v-if="favoriteCount > 0">{{ favoriteCount }} 个</span>
        </div>
        <ProfileFavorites />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProfileUserInfo from '@/components/ProfileUserInfo.vue'
import ProfileComments from '@/components/ProfileComments.vue'
import ProfileFavorites from '@/components/ProfileFavorites.vue'

// 模拟数据
const commentCount = ref(0)
const favoriteCount = ref(0)

onMounted(() => {
  // 这里可以调用composables初始化数据
  console.log('个人中心页面加载完成')

  // 模拟数据加载
  setTimeout(() => {
    commentCount.value = 5
    favoriteCount.value = 8
  }, 100)
})
</script>

<style scoped>
/* 主容器 - 解决宽度问题的关键 */
.user-page {
  width: 100%;
  min-height: calc(100vh - 60px); /* 减去可能的导航栏高度 */
  background-color: #f8f9fa;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

/* 在大屏幕上强制全宽，防止被父容器限制 */
@media (min-width: 768px) {
  .user-page {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 30px 40px !important;
  }
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eaeaea;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h1 i {
  color: #667eea;
}

.user-welcome {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 用户信息卡片容器 */
.user-card {
  width: 100%;
  margin-bottom: 30px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 两列网格布局 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
}

/* 在平板及以上屏幕显示两列 */
@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* 防止在1024px时变窄的关键代码 */
@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 30px !important;
  }

  /* 突破任何可能的父容器限制 */
  .user-page {
    width: 100vw !important;
    position: relative;
    left: 50% !important;
    right: 50% !important;
    margin-left: -50vw !important;
    margin-right: -50vw !important;
  }
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}

.card-header h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.card-header h2 i {
  color: #667eea;
}

.item-count {
  background: #e8f4ff;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .user-page {
    padding: 15px;
  }

  .content-card {
    min-height: 350px;
  }
}
</style>

<style>
/* 全局样式覆盖，确保不被父容器限制 */
/* 这是解决宽度问题的关键部分 */
@media (min-width: 1024px) {
  /* 突破可能的父容器限制 */
  .user-page ~ *,
  .user-page + * {
    max-width: 100% !important;
  }

  /* 确保页面在宽屏时不会突然变窄 */
  [class*="container"],
  [class*="content"],
  [class*="main"] {
    max-width: 100% !important;
    width: 100% !important;
  }

  /* 强制移除所有可能的max-width限制 */
  body .user-page {
    max-width: none !important;
  }
}
</style>
