<template>
  <div class="movie-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载影片信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <h2>⚠️ 加载失败</h2>
      <p>{{ error }}</p>
      <button @click="fetchMovieData" class="retry-btn">重新加载</button>
      <button @click="$router.push('/')" class="back-home-btn">返回首页</button>
    </div>

    <!--主要内容 -->
    <div v-else class="content-wrapper">
      <!-- 顶部 Hero 区域 -->
      <div class="hero-section" :style="{ backgroundImage: `url(${movie.cover})` }">
        <div class="hero-overlay">
          <div class="hero-limit-width">
            
            <!-- 海报 -->
            <div class="poster-wrapper">
               <img 
                :src="movie.cover" 
                :alt="movie.title" 
                class="movie-poster"
                @error="setDefaultImg"
              />
            </div>

            <!-- 信息 -->
            <div class="movie-info-box">
              <h1 class="movie-title">{{ movie.title }}</h1>
              
              <div class="movie-meta-row">
                <span class="meta-tag year" v-if="movie.releaseTime">{{ movie.releaseTime.substring(0,4) }}</span>
                <span class="meta-tag type">{{ movie.type }}</span>
                <span class="meta-tag status">{{ movie.status }}</span>
                <span class="meta-tag duration" v-if="movie.duration">{{ movie.duration }}</span>
              </div>

              <div class="rating-row">
                <div class="score-box">
                   <span class="score-val">{{ movie.score }}</span>
                   <span class="score-label">分</span>
                </div>
                <div class="stars">
                   <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= Math.round(movie.score / 2) }">★</span>
                </div>
              </div>

              <div class="action-row">
                <button 
                  class="action-btn fav-btn" 
                  :class="{ active: isCollected }"
                  @click="toggleCollection"
                >
                  {{ isCollected ? '❤️ 已收藏' : '🤍 收藏影片' }}
                </button>
                <button class="action-btn play-btn" @click="handlePlay">
                  ▶ 立即播放
                </button>
              </div>

              <div class="desc-section">
                <h3>剧情简介</h3>
                <p class="description">{{ movie.description || '暂无简介' }}</p>
              </div>
              
              <div class="director-section" v-if="movie.director">
                 <span class="label">导演：</span>
                 <span class="value">{{ movie.director }}</span>
              </div>

              <div class="cast-section" v-if="movie.cast && movie.cast.length">
                 <span class="label">主演：</span>
                 <div class="cast-tags">
                   <span class="cast-tag" v-for="actor in movie.cast" :key="actor.id" @click="showActor(actor)">
                     {{ actor.name }}
                   </span>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- 下方内容区：评论等 -->
      <div class="lower-section">
         <div class="section-container">
            <h3 class="section-header">观众热评 <span class="count">({{ comments.length }})</span></h3>
            
            <!-- 发表评论 -->
            <div class="comment-publish">
               <textarea 
                  v-model="commentContent" 
                  placeholder="这个电影怎么样？写下你的感受..." 
                  class="comment-input"
                  :disabled="submitting"
               ></textarea>
               <div class="publish-footer">
                  <button class="submit-btn" @click="submitComment" :disabled="submitting || !commentContent.trim()">
                    {{ submitting ? '发送中...' : '发表评论' }}
                  </button>
               </div>
            </div>

            <!-- 评论列表 -->
            <div class="comments-list">
               <div v-if="commentLoading" class="loading-text">加载评论中...</div>
               <div v-else-if="comments.length === 0" class="empty-text">暂无评论，来做第一个发言的人吧！</div>
               
               <div v-else class="comment-item" v-for="item in comments" :key="item.id">
                  <div class="avatar-col">
                     <div class="avatar-circle">
                        {{ item.username ? item.username[0].toUpperCase() : 'U' }}
                     </div>
                  </div>
                  <div class="comment-body">
                     <div class="comment-top">
                        <span class="username">{{ item.username || '匿名用户' }}</span>
                        <span class="time">{{ formatDate(item.date) }}</span>
                     </div>
                     <div class="comment-text-content">
                        {{ item.content }}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>

    <!-- 演员弹窗 -->
    <div v-if="showActorModal && selectedActor" class="actor-modal-backdrop" @click.self="showActorModal = false">
       <div class="actor-modal-card">
          <button class="modal-close" @click="showActorModal = false">×</button>
          <div class="actor-card-header">
             <img :src="selectedActor.avatar || 'https://via.placeholder.com/150'" class="actor-card-avatar" />
             <div>
                <h3 class="actor-card-name">{{ selectedActor.name }}</h3>
                <p class="actor-card-role">演员</p>
             </div>
          </div>
          <div class="actor-card-body">
             <h4>简介</h4>
             <p>{{ selectedActor.bio || '暂无简介' }}</p>
             <h4>代表作品</h4>
             <div class="works-list">
                <span v-for="work in selectedActor.works" :key="work.id" class="work-tag" @click="goToMovie(work.id)">
                   🎬 {{ work.title }}
                </span>
                <span v-if="!selectedActor.works?.length">暂无数据</span>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { API_BASE_URL } from '@/api/config'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const movieId = ref(parseInt(route.params.id) || 1)
const movie = ref({})
const loading = ref(true)
const error = ref(null)
const showActorModal = ref(false)
const selectedActor = ref(null)

// 评论相关
const comments = ref([])
const commentLoading = ref(false)
const commentContent = ref('')
const submitting = ref(false)

// 收藏状态
const isCollected = computed(() => {
  if (!userStore.isLoggedIn) return false;
  return userStore.favorites.some(f => f.id === movie.value.id || f.id === parseInt(movieId.value))
})

// 监听路由参数变化（解决同组件跳转不刷新问题）
watch(() => route.params.id, (newId) => {
  movieId.value = parseInt(newId)
  fetchMovieData()
})

const fetchMovieData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`${API_BASE_URL}/movies/${movieId.value}`)
    const result = await response.json()
    
    if (result.success && result.data) {
        const foundMovie = result.data
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
          cast: foundMovie.cast || []
        }
        
        // 刷新收藏
        if (userStore.isLoggedIn) {
            userStore.fetchFavorites()
        }
        
        fetchComments()
    } else {
      error.value = result.message || '找不到该电影信息'
    }
  } catch (err) {
    console.error('获取电影数据失败:', err)
    error.value = '加载失败，请检查网络或稍后重试'
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
    commentLoading.value = true
    try {
        const res = await fetch(`${API_BASE_URL}/comments/movies/${movieId.value}`)
        const data = await res.json()
        if (data.success) {
            comments.value = data.data
        }
    } catch(e) {
        console.error(e)
    } finally {
        commentLoading.value = false
    }
}

const submitComment = async () => {
    if (!userStore.isLoggedIn) {
        if(confirm('发表评论需要登录，去登录吗？')) {
           router.push('/login')
        }
        return
    }
    if (!commentContent.value.trim()) return
    
    submitting.value = true
    try {
        const payload = {
            content: commentContent.value,
            score: 10,
            userId: userStore.user?.id,
            username: userStore.user?.nickname || userStore.user?.phone
        }
        
        const res = await fetch(`${API_BASE_URL}/comments/movies/${movieId.value}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        
        if (data.success) {
            commentContent.value = ''
            fetchComments()
        } else {
            alert(data.message || '评论失败')
        }
    } catch(e) {
        console.error(e)
        alert('提交失败')
    } finally {
        submitting.value = false
    }
}

const toggleCollection = async () => {
  const result = await userStore.toggleFavorite(movieId.value)
  if (!result.success) {
      if (result.message === '请先登录') {
          router.push('/login')
      } else {
          console.error('Toggle favorite failed:', result)
          alert(result.message)
      }
  }
}

const handlePlay = () => {
   // 跳转到播放页或提示
   alert('播放功能开发中...')
}

const showActor = (actor) => {
  selectedActor.value = actor
  showActorModal.value = true
}

const goToMovie = (id) => {
  showActorModal.value = false
  router.push(`/detail/${id}`)
}

const setDefaultImg = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchMovieData()
})
</script>

<style scoped>
.movie-detail-page {
  background: #f5f5f5;
  min-height: calc(100vh - 60px); 
}

/* Loading & Error */
.loading-state, .error-state {
  padding: 100px;
  text-align: center;
}
.spinner {
   width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #ff4d4f; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.retry-btn, .back-home-btn {
   padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 10px;
}
.retry-btn { background: #ff4d4f; color: white; }
.back-home-btn { background: #ccc; }

/* Hero Section */
.hero-section {
  position: relative;
  width: 100%;
  height: 500px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-overlay {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-limit-width {
  width: 1200px;
  max-width: 100%;
  padding: 0 20px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
  color: #fff;
}

.poster-wrapper {
  flex-shrink: 0;
  width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 4px solid #fff;
}
.movie-poster {
  width: 100%;
  height: 440px;
  object-fit: cover;
  display: block;
}

.movie-info-box {
  flex: 1;
  padding-top: 10px;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.movie-meta-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.meta-tag {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  border: 1px solid rgba(255,255,255,0.3);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}
.score-box {
  color: #ffc107;
}
.score-val {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}
.score-label {
  font-size: 1rem;
  margin-left: 5px;
}
.stars {
  font-size: 1.5rem;
  color: #555;
  display: flex;
}
.star.filled {
  color: #ffc107;
}

.action-row {
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
}

.action-btn {
  padding: 10px 30px;
  border: none;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  font-weight: bold;
}
.action-btn:hover { transform: scale(1.05); }

.fav-btn {
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
}
.fav-btn.active {
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.play-btn {
  background: linear-gradient(90deg, #ff4d4f, #ff7875);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 77, 79, 0.4);
}

.desc-section {
  margin-bottom: 20px;
}
.desc-section h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #ddd;
}
.description {
  line-height: 1.6;
  opacity: 0.9;
  max-width: 800px;
}

.director-section, .cast-section {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.director-section .label, .cast-section .label {
  color: #aaa;
  margin-right: 10px;
}
.cast-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.cast-tag {
  cursor: pointer;
  color: #aecfff;
}
.cast-tag:hover {
  text-decoration: underline;
  color: #fff;
}

/* Lower Section */
.lower-section {
  width: 1200px;
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 20px;
}

.section-container {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.section-header {
  font-size: 1.5rem;
  margin-bottom: 20px;
  border-left: 5px solid #ff4d4f;
  padding-left: 15px;
}
.count { font-size: 1rem; color: #999; font-weight: normal; }

.comment-publish {
  margin-bottom: 30px;
}
.comment-input {
  width: 100%;
  height: 100px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
}
.comment-input:focus {
  outline: none;
  border-color: #ff4d4f;
}
.publish-footer {
  text-align: right;
  margin-top: 10px;
}
.submit-btn {
  background: #ff4d4f;
  color: #fff;
  border: none;
  padding: 8px 25px;
  border-radius: 20px;
  cursor: pointer;
}
.submit-btn:disabled {
  background: #ffccc7;
  cursor: not-allowed;
}

.comment-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}
.avatar-circle {
  width: 40px; height: 40px; background: #e6f7ff; color: #1890ff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}
.comment-body { flex: 1; }
.comment-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
.username { font-weight: bold; color: #333; }
.time { color: #999; font-size: 0.9rem; }
.comment-text-content { color: #555; line-height: 1.5; }

/* Modal */
.actor-modal-backdrop {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.actor-modal-card {
  background: #fff; width: 500px; border-radius: 12px; padding: 30px; position: relative;
  max-width: 90%;
}
.modal-close {
  position: absolute; top: 15px; right: 20px; font-size: 24px; border: none; background: none; cursor: pointer; color: #999;
}
.actor-card-header {
  display: flex; gap: 20px; align-items: center; margin-bottom: 20px;
}
.actor-card-avatar {
  width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
}
.actor-card-name { font-size: 1.5rem; margin-bottom: 5px; }
.actor-card-role { color: #666; }
.actor-card-body h4 {
  margin: 15px 0 10px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;
}
.works-list {
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;
}
.work-tag {
  background: #f0f0f0; padding: 4px 10px; border-radius: 15px; cursor: pointer; font-size: 0.9rem; transition: background 0.3s;
}
.work-tag:hover { background: #e6e6e6; }

@media (max-width: 768px) {
  .hero-limit-width { flex-direction: column; align-items: center; text-align: center; }
  .poster-wrapper { width: 200px; height: 300px; margin-bottom: 20px; }
  .movie-meta-row { flex-wrap: wrap; justify-content: center; }
  .rating-row { justify-content: center; }
  .action-row { justify-content: center; }
  .hero-section { height: auto; padding-bottom: 40px; }
}
</style>
