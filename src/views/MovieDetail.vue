<template>
  <div class="movie-detail">
    <!-- 返回导航 -->
    <div class="nav">
      <button @click="$router.back()" class="back-btn">← 返回</button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <h2>加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchMovieData" class="retry-btn">重新加载</button>
    </div>

    <!-- 主要内容 -->
    <div v-else class="content">
      <!-- 左侧海报 -->
      <div class="poster-side">
        <div class="poster-container">
          <img 
            :src="movie.cover" 
            :alt="movie.title + '海报'"
            class="movie-poster"
            @error="setDefaultImg"
          />
          <div class="rating-badge">
            <span class="rating-score">{{ movie.score }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            class="btn-primary"
            :class="{ 'active': isCollected }"
            @click="toggleCollection"
          >
            {{ isCollected ? '❤️ 已收藏' : '🤍 收藏' }}
          </button>
          <button 
            class="btn-secondary"
            @click="goToClips"
          >
            🎬 精彩片段
          </button>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="info-side">
        <header class="movie-header">
          <h1 class="movie-title">{{ movie.title }}</h1>
          <div class="movie-meta">
            <span class="year">{{ movie.releaseTime.split('-')[0] }}</span>
            <span class="divider">•</span>
            <span class="duration">{{ movie.duration }}</span>
            <span class="divider">•</span>
            <span class="status">{{ movie.status }}</span>
          </div>
        </header>

        <div class="detail-card">
          <div class="detail-row">
            <label class="detail-label">类型：</label>
            <span class="detail-value">{{ movie.type }}</span>
          </div>

          <div class="detail-row">
            <label class="detail-label">上映时间：</label>
            <span class="detail-value">{{ formatDate(movie.releaseTime) }}</span>
          </div>

          <div class="detail-row">
            <label class="detail-label">导演：</label>
            <span class="detail-value">{{ movie.director }}</span>
          </div>

          <!-- 主演列表 -->
          <div class="detail-row">
            <label class="detail-label">主演：</label>
            <div class="cast-list">
              <span 
                v-for="actor in movie.cast" 
                :key="actor.id"
                class="actor-item"
                @click="showActor(actor)"
              >
                {{ actor.name }}
              </span>
            </div>
          </div>

          <div class="detail-row">
            <label class="detail-label">评分：</label>
            <div class="rating-detail">
              <div class="stars">
                <span 
                  v-for="n in 5" 
                  :key="n"
                  class="star"
                  :class="{ 'filled': n <= Math.floor(movie.score/2) }"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">{{ movie.score }}分</span>
            </div>
          </div>
        </div>

        <!-- 剧情简介 -->
        <section class="synopsis">
          <h3 class="section-title">剧情简介</h3>
          <div class="synopsis-content">
            <p>{{ movie.description }}</p>
          </div>
        </section>
      </div>
    </div>
        <!-- ===== [修改] 演员详情弹窗（增强版）===== -->
    <div
      v-if="showActorModal && selectedActor"
      class="actor-modal"
      @click.self="showActorModal = false"
    >
      <div class="actor-modal-content">
        <!-- 头部 -->
        <div class="actor-header">
          <img
            class="actor-avatar"
            :src="selectedActor.avatar"
            alt="演员头像"
          />

          <div class="actor-basic">
            <h2 class="actor-name">{{ selectedActor.name }}</h2>
            <p class="actor-role">演员 / 影视从业者</p>
          </div>

          <button class="close-btn" @click="showActorModal = false">×</button>
        </div>

        <!-- 简介 -->
        <div class="actor-section">
          <h3 class="section-title">演员简介</h3>
          <p class="actor-bio">
            {{ selectedActor.bio }}
          </p>
        </div>

        <!-- 代表作品 -->
        <div class="actor-section">
          <h3 class="section-title">代表作品</h3>
          <ul class="actor-works">
            <li
              v-for="work in selectedActor.works"
              :key="work.id"
              class="work-item"
              @click="goToMovie(work.id)"
            >
              🎬 {{ work.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/api/config'

// 模拟数据
const mockMovies = [
  {
    id: 1,
    title: '流浪地球2',
    type: '科幻/冒险',
    score: 9.4,
    status: '全1集',
    cover: '/assets/images/movie1.jpg',
    releaseTime: '2023-01-22',
    duration: '173分钟',
    director: '郭帆',
    actors: [1, 2],
    description: '太阳危机即将来袭，人类开启"流浪地球计划"...'
  },
  {
    id: 2,
    title: '满江红',
    type: '剧情/悬疑',
    score: 8.0,
    status: '全1集',
    cover: '/assets/images/movie2.jpg',
    releaseTime: '2023-01-22',
    duration: '159分钟',
    director: '张艺谋',
    actors: [3,4],
    description: '南宋绍兴年间，一群义士铲奸除恶的故事...'
  }
]
import wujingAvatar from '@/assets/images/actor-wujing.jpg'
import liudehuaAvatar from '@/assets/images/actor-liudehua.jpg'
import shentengAvatar from '@/assets/images/actor-shenteng.jpg'
import yiyangqianxiAvatar from '@/assets/images/actor-yiyangqianxi.jpg'
// =====  模拟演员数据，补充详情字段 =====
const mockActors = [
  {
    id: 1,
    name: '吴京',
    //avatar: '/assets/images/actor-wujing.jpg',
    avatar: wujingAvatar,
    bio: '中国内地男演员、导演，代表中国硬核动作电影形象，多次出演主旋律与商业大片。',
    works: [
      { id: 1, title: '流浪地球2' },
      { id: 5, title: '战狼2' },
      { id: 6, title: '长津湖' }
    ]
  },
  {
    id: 2,
    name: '刘德华',
    avatar: liudehuaAvatar,
    bio: '华语影坛最具影响力的演员之一，涉猎警匪、文艺、商业片等多个类型。',
    works: [
      { id: 1, title: '流浪地球2' },
      { id: 7, title: '无间道' }
    ]
  },
  {
    id: 3,
    name: '沈腾',
    avatar: shentengAvatar,
    bio: '中国内地喜剧演员，开心麻花核心成员，擅长现实讽刺喜剧。',
    works: [
      { id: 8, title: '夏洛特烦恼' },
      { id: 9, title: '疯狂的外星人' }
    ]
  },
  {
    id:4,
    name:'易烊千玺',
    avatar:yiyangqianxiAvatar,
    bio:'中国内地流行歌手,舞者,演员,TFBOYS成员。',
    works:[
      {id:10,title:'送你一朵小红花'},
      {id:11,title:'少年的你'}
    ]
  }
]
//可跳转到其他影视作品
import { useRouter } from 'vue-router'
const router = useRouter()

const goToMovie = (movieId) => {
  showActorModal.value = false
  router.push(`/movie/${movieId}`)
}

const goToClips = () => {
  router.push(`/clips/${movieId}`)
}

const route = useRoute()
const movieId = parseInt(route.params.id) || 1

// 响应式数据
const movie = ref({})
const loading = ref(true)
const error = ref(null)
const isCollected = ref(false)
const showActorModal = ref(false)
const selectedActor = ref(null)

// 获取电影数据
const fetchMovieData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 从后端API获取数据
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`)
    const result = await response.json()
    
    if (result.success && result.data) {
      const foundMovie = result.data
      
      // 转换数据结构
      movie.value = {
        ...foundMovie,
        title: foundMovie.title,
        type: foundMovie.type,
        score: foundMovie.score,
        status: foundMovie.status,
        cover: foundMovie.cover,
        releaseTime: foundMovie.release_time || foundMovie.releaseTime,
        duration: foundMovie.duration,
        director: foundMovie.director,
        description: foundMovie.description,
        // 演员数据已从后端获取
        cast: foundMovie.cast || []
      }
      
      // 模拟收藏状态（后续可对接真实API）
      isCollected.value = false
    } else {
      error.value = result.message || '找不到该电影信息'
    }
    
    loading.value = false
  } catch (err) {
    console.error('获取电影数据失败:', err)
    error.value = '加载失败，请稍后重试'
    loading.value = false
  }
}

// 工具函数
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const setDefaultImg = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'
}

// 交互函数
const toggleCollection = () => {
  isCollected.value = !isCollected.value
  console.log(`收藏状态: ${isCollected.value ? '已收藏' : '未收藏'}`)
}

const showActor = (actor) => {
  selectedActor.value = actor
  showActorModal.value = true
}

// 生命周期
onMounted(() => {
  fetchMovieData()
})
</script>

<style scoped>
.movie-detail {
  color: var(--color-text);
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

/* 导航 */
.nav {
  margin-bottom: 2rem;
}

.back-btn {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.back-btn:hover {
  background: var(--color-border-hover);
  border-color: var(--color-border-hover);
}

/* 加载和错误状态 */
.loading-state, .error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--color-border);
  border-top-color: var(--vt-c-indigo);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state h2 {
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.retry-btn {
  background: var(--vt-c-indigo);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: inherit;
}

.retry-btn:hover {
  background: #2a3c5c;
}

/* 主要内容布局 */
.content {
  display: flex;
  gap: 2rem;
  background: var(--color-background-soft);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
    padding: 1.5rem;
  }
}

/* 左侧海报区 */
.poster-side {
  flex: 0 0 300px;
}

@media (max-width: 768px) {
  .poster-side {
    flex: none;
    max-width: 300px;
    margin: 0 auto;
  }
}

.poster-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.movie-poster {
  width: 100%;
  height: 450px;
  object-fit: cover;
  display: block;
}

.rating-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.75);
  color: #fbbf24;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1.25rem;
  font-weight: bold;
}

.action-buttons {
  margin-top: 1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: var(--vt-c-indigo);
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #2a3c5c;
}

.btn-primary.active {
  background: #10b981;
}

.btn-secondary {
  width: 100%;
  padding: 0.75rem;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.btn-secondary:hover {
  background: #ff7875;
}

/* 右侧信息区 */
.info-side {
  flex: 1;
}

.movie-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.movie-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  opacity: 0.8;
  font-size: 0.9rem;
}

.divider {
  opacity: 0.5;
}

.status {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* 详细信息卡片 */
.detail-card {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-border);
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: var(--color-heading);
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--color-text);
}

.cast-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.actor-item {
  color: var(--vt-c-indigo);
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.3s;
}

.actor-item:hover {
  text-decoration-color: var(--vt-c-indigo);
}

.rating-detail {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars {
  display: flex;
  font-size: 1.25rem;
  color: var(--color-border);
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  color: var(--color-text);
}

/* 剧情简介 */
.synopsis {
  background: var(--color-background);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-border);
}

.synopsis-content p {
  line-height: 1.7;
  color: var(--color-text);
}

/* 简化版弹窗 */
.temp-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-btn:hover {
  background: var(--color-border);
}

.modal-body {
  padding: 1.5rem;
  color: var(--color-text);
  text-align: center;
}

.modal-body p {
  margin-bottom: 0.75rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.confirm-btn {
  background: var(--vt-c-indigo);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}
.actor-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}
.confirm-btn:hover {
  background: #2a3c5c;
}
/* ===== [新增] 演员详情弹窗样式 ===== */
.actor-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.actor-modal-content {
  width: 90%;
  max-width: 700px;
  background: var(--color-background);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
}

.actor-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.actor-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.actor-basic {
  flex: 1;
}

.actor-name {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.actor-role {
  opacity: 0.7;
}

.actor-section {
  margin-bottom: 2rem;
}

.actor-bio {
  line-height: 1.8;
}

.actor-works {
  list-style: none;
  padding: 0;
  margin: 0;
}

.work-item {
  cursor: pointer;
  padding: 0.5rem 0;
  color: var(--vt-c-indigo);
  font-weight: 500;
}

.work-item:hover {
  text-decoration: underline;
}

</style>
