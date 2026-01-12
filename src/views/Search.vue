<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-header">
      <div class="search-container">
        <input
          v-model="keyword"
          type="text"
          class="search-input"
          placeholder="搜索电影、导演、类型...（支持模糊搜索）"
          @keyup.enter="handleSearch"
          @input="handleInput"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched" class="search-results">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>搜索中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="handleSearch" class="retry-btn">重试</button>
      </div>

      <div v-else-if="results.length > 0" class="results-container">
        <h2 class="results-title">找到 {{ results.length }} 个结果</h2>
        <div class="results-grid">
          <router-link
            v-for="movie in results"
            :key="movie.id"
            :to="`/detail/${movie.id}`"
            class="movie-card"
          >
            <div class="card-cover">
              <img :src="movie.cover" :alt="movie.title" @error="setDefaultImg" />
            </div>
            <div class="card-info">
              <h3 class="movie-name">{{ movie.title }}</h3>
              <div class="movie-type">{{ movie.type }}</div>
              <div class="movie-score">⭐ {{ movie.score }}</div>
              <div class="movie-status">{{ movie.status }}</div>
            </div>
          </router-link>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>没有找到相关影片</p>
        <p class="empty-hint">试试其他关键词吧</p>
      </div>
    </div>

    <!-- 搜索提示 -->
    <div v-else class="search-hint">
      <div class="hint-content">
        <h2>搜索影片</h2>
        <p>输入电影名称、导演、类型或简介关键词进行模糊搜索，支持部分匹配</p>
        <div class="hot-keywords">
          <span class="keyword-label">热门搜索：</span>
          <span
            v-for="keyword in hotKeywords"
            :key="keyword"
            class="keyword-tag"
            @click="searchKeyword(keyword)"
          >
            {{ keyword }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '@/api/config'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const results = ref([])
const loading = ref(false)
const error = ref(null)
const hasSearched = ref(false)

const hotKeywords = ['科幻', '动作', '喜剧', '悬疑', '战争', '爱情']

// 防抖定时器
let debounceTimer = null

// 处理输入 - 实时模糊搜索
const handleInput = () => {
  const searchKeyword = keyword.value.trim()
  
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  // 如果输入为空，清空结果
  if (!searchKeyword) {
    results.value = []
    hasSearched.value = false
    return
  }
  
  // 防抖：500ms 后执行搜索
  debounceTimer = setTimeout(() => {
    performSearch(searchKeyword)
  }, 500)
}

// 搜索关键词
const searchKeyword = (kw) => {
  keyword.value = kw
  handleSearch()
}

// 执行搜索（实际搜索逻辑）
const performSearch = async (searchKeyword) => {
  if (!searchKeyword) {
    return
  }

  try {
    loading.value = true
    error.value = null
    hasSearched.value = true

    const response = await axios.get(`${API_BASE_URL}/movies/search`, {
      params: { q: searchKeyword },
      paramsSerializer: {
        // 确保中文正确编码
        encode: (param, key) => {
          return encodeURIComponent(param)
        }
      }
    })

    if (response.data.success) {
      results.value = response.data.data
    } else {
      error.value = response.data.message || '搜索失败'
      results.value = []
    }

    loading.value = false
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = err.response?.data?.message || '搜索失败，请稍后重试'
    results.value = []
    loading.value = false
  }
}

// 执行搜索（按钮点击或回车）
const handleSearch = () => {
  const searchKeyword = keyword.value.trim()
  
  // 清除防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  if (!searchKeyword) {
    return
  }
  
  // 立即执行搜索
  performSearch(searchKeyword)
}

// 设置默认图片
const setDefaultImg = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'
}

// 从路由参数获取搜索关键词
if (route.query.q) {
  keyword.value = route.query.q
  handleSearch()
}
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 80vh;
}

.search-header {
  margin-bottom: 2rem;
}

.search-container {
  display: flex;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border, #ddd);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: var(--vt-c-indigo, #646cff);
}

.search-btn {
  padding: 0.75rem 2rem;
  background: var(--vt-c-indigo, #646cff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.search-btn:hover {
  background: #2a3c5c;
}

.search-results {
  margin-top: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--color-border, #ddd);
  border-top-color: var(--vt-c-indigo, #646cff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: var(--vt-c-indigo, #646cff);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: inherit;
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-heading, #222);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.movie-card {
  text-decoration: none;
  color: var(--color-text, #333);
  background: var(--color-background-soft, #fff);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--color-border, #eee);
}

.movie-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-cover {
  width: 100%;
  height: 330px;
  overflow: hidden;
  background: #000;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-info {
  padding: 1rem;
}

.movie-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-heading, #222);
}

.movie-type {
  font-size: 0.875rem;
  color: var(--color-text, #666);
  margin-bottom: 0.25rem;
}

.movie-score {
  font-size: 0.875rem;
  color: #ff4d4f;
  margin-bottom: 0.25rem;
}

.movie-status {
  font-size: 0.75rem;
  color: var(--color-text, #999);
}

.empty-hint {
  color: var(--color-text, #999);
  margin-top: 0.5rem;
}

.search-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.hint-content {
  text-align: center;
}

.hint-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--color-heading, #222);
}

.hint-content p {
  color: var(--color-text, #666);
  margin-bottom: 2rem;
}

.hot-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

.keyword-label {
  color: var(--color-text, #666);
  font-weight: 500;
}

.keyword-tag {
  padding: 0.5rem 1rem;
  background: var(--color-background-soft, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: var(--color-text, #333);
}

.keyword-tag:hover {
  background: var(--vt-c-indigo, #646cff);
  color: white;
  border-color: var(--vt-c-indigo, #646cff);
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .card-cover {
    height: 220px;
  }
}
</style>

