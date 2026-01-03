<template>
  <!-- 顶部间距（匹配首页导航栏高度） -->
  <div class="page-margin"></div>

  <!-- 分类筛选页面主体 -->
  <div class="classify-container">
    <div class="page-header">
      <h2 class="page-title">分类筛选</h2>
    </div>

    <!-- 分类筛选按钮组 -->
    <div class="category-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >
        全部
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeCategory === item }"
        @click="activeCategory = item"
        v-for="(item, idx) in categoryList" 
        :key="idx"
      >
        {{ item }}
      </button>
    </div>

    <!-- 筛选后的影视列表 -->
    <div class="film-list" v-if="filteredFilms.length > 0">
      <router-link 
        :to="`/detail/${film.id}`" 
        class="film-card" 
        v-for="(film, idx) in filteredFilms" 
        :key="idx"
      >
        <div class="card-cover">
          <img :src="film.cover" :alt="film.name" />
        </div>
        <div class="card-info">
          <h3 class="film-name">{{ film.name }}</h3>
          <div class="film-type">{{ film.type }}</div>
          <div class="film-score">⭐ {{ film.score }}</div>
          <div class="film-status">{{ film.status }}</div>
        </div>
      </router-link>
    </div>

    <!-- 无数据提示 -->
    <div class="empty-tip" v-else>
      暂无该分类的影视内容
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// 引入mock数据（确保路径和你的项目一致）
import { allFilmsData } from '@/mockData.js'

// 激活的分类（默认全部）
const activeCategory = ref('all')

// 所有分类列表（从mock数据中提取）
const categoryList = ref([
  '科幻/灾难', '动作/战争', '历史/战争', '犯罪/悬疑', '喜剧/爱情', '剧情/家庭'
])

// 筛选后的影视列表
const filteredFilms = computed(() => {
  if (activeCategory.value === 'all') {
    // 显示全部
    return allFilmsData
  } else {
    // 按分类筛选
    return allFilmsData.filter(film => film.type === activeCategory.value)
  }
})
</script>

<style scoped>
/* 匹配首页导航栏高度的顶部间距 */
.page-margin {
  height: 60px;
}

/* 页面容器 */
.classify-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

/* 分类标签栏 */
.category-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}

.tab-btn:hover {
  opacity: 0.8;
}

/* 影视列表（复用首页卡片样式） */
.film-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.film-card {
  width: 220px;
  text-decoration: none;
  color: #333;
  transition: transform 0.3s;
}

.film-card:hover {
  transform: scale(1.05);
}

.card-cover {
  width: 100%;
  height: 330px;
  border-radius: 8px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 10px 0;
}

.film-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.film-type {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.film-score {
  font-size: 14px;
  color: #ff4d4f;
  margin-bottom: 4px;
}

.film-status {
  font-size: 12px;
  color: #999;
}

/* 无数据提示 */
.empty-tip {
  text-align: center;
  padding: 50px 0;
  color: #999;
  font-size: 16px;
}

/* 响应式适配（和首页一致） */
@media (max-width: 1200px) {
  .classify-container {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .film-card {
    width: calc(50% - 10px);
  }
}
</style>