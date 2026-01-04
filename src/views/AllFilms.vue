<template>
  <!-- 顶部间距（匹配首页导航栏高度） -->
  <div class="page-margin"></div>

  <!-- 全部影视页面主体 -->
  <div class="all-films-container">
    <div class="page-header">
      <h2 class="page-title">全部影视</h2>
      <div class="sort-bar">
        <button 
          class="sort-btn" 
          :class="{ active: sortType === 'default' }"
          @click="sortType = 'default'"
        >
          默认排序
        </button>
        <button 
          class="sort-btn" 
          :class="{ active: sortType === 'score' }"
          @click="sortType = 'score'"
        >
          评分从高到低
        </button>
      </div>
    </div>

    <!-- 影视列表 -->
    <div class="film-list">
      <router-link 
        :to="`/detail/${film.id}`" 
        class="film-card" 
        v-for="(film, idx) in sortedFilms" 
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
// 引入mock数据（确保路径和你的项目一致）
import { allFilmsData } from '@/mockData.js'

// 排序类型：default-默认，score-按评分排序
const sortType = ref('default')

// 按排序规则处理影视列表
const sortedFilms = computed(() => {
  const films = [...allFilmsData] // 深拷贝避免修改原数据
  if (sortType.value === 'score') {
    // 按评分从高到低排序
    return films.sort((a, b) => b.score - a.score)
  }
  // 默认排序
  return films
})
</script>

<style scoped>
/* 匹配首页导航栏高度的顶部间距 */
.page-margin {
  height: 60px;
}

/* 页面容器 */
.all-films-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

/* 页面头部（标题+排序） */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.sort-bar {
  display: flex;
  gap: 10px;
}

.sort-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-btn.active {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}

.sort-btn:hover {
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

/* 响应式适配（和首页一致） */
@media (max-width: 1200px) {
  .all-films-container {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .film-card {
    width: calc(50% - 10px);
  }
}
</style>