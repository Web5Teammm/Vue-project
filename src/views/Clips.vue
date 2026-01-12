<template>
  <div class="clips-page">
    <!-- 返回导航 -->
    <div class="nav">
      <button @click="$router.back()" class="back-btn">← 返回</button>
      <h2 class="page-title">{{ movieTitle }} - 精彩片段</h2>
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
      <button @click="fetchClips" class="retry-btn">重新加载</button>
    </div>

    <!-- 片段列表 -->
    <div v-else-if="clips.length > 0" class="clips-container">
      <div class="clips-grid">
        <div
          v-for="clip in clips"
          :key="clip.id"
          class="clip-card"
          :class="{ active: currentClip?.id === clip.id }"
          @click="selectClip(clip)"
        >
          <div class="clip-thumbnail">
            <img
              :src="clip.thumbnail || movieCover"
              :alt="clip.title"
              @error="setDefaultImg"
            />
            <div class="play-overlay">
              <svg class="play-icon" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div class="duration-badge">{{ formatDuration(clip.duration) }}</div>
          </div>
          <div class="clip-info">
            <h3 class="clip-title">{{ clip.title }}</h3>
            <p v-if="clip.description" class="clip-description">{{ clip.description }}</p>
          </div>
        </div>
      </div>

      <!-- 视频播放器 -->
      <div v-if="currentClip" class="video-player-container">
        <div class="video-wrapper">
          <!-- 使用iframe作为备选方案 -->
          <iframe
            v-if="useIframe && currentClip"
            :src="currentClip.video_url"
            class="video-iframe"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
            referrerpolicy="no-referrer"
          ></iframe>
          <!-- 使用video标签 -->
          <video
            v-else
            ref="videoPlayer"
            :src="currentClip.video_url"
            controls
            preload="metadata"
            class="video-player"
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
            @loadstart="onVideoLoadStart"
            @canplay="onVideoCanPlay"
            @stalled="onVideoStalled"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-if="videoError" class="video-error">
            <div class="error-icon">⚠️</div>
            <p class="error-text">视频加载失败</p>
            <p class="error-hint">视频地址：{{ currentClip.video_url }}</p>
            <p class="error-tip">可能的原因：</p>
            <ul class="error-reasons">
              <li>视频文件不存在（请确保视频文件在 public/videos/ 目录下）</li>
              <li>视频文件路径不正确</li>
              <li>视频格式浏览器不支持（推荐使用MP4格式）</li>
              <li>网络连接问题（如果是外部视频）</li>
            </ul>
            <p class="error-suggestion">提示：本地视频文件应放在 public/videos/ 目录下，文件名需与数据库中的 video_url 匹配（如 /videos/clip1.mp4）</p>
            <div class="error-actions">
              <button class="error-btn" @click="tryIframe">尝试使用iframe加载</button>
              <button class="error-btn" @click="openVideoInNewTab">在新窗口打开视频</button>
              <button class="error-btn" @click="copyVideoUrl">复制视频地址</button>
            </div>
            <p class="error-debug">调试信息：请打开浏览器开发者工具（F12）查看Console标签页的详细错误信息</p>
          </div>
        </div>
        <div class="video-info">
          <h3 class="video-title">{{ currentClip.title }}</h3>
          <p v-if="currentClip.description" class="video-description">
            {{ currentClip.description }}
          </p>
        </div>
      </div>

      <!-- 无片段提示 -->
      <div v-else class="no-clip-selected">
        <p>请选择一个片段开始播放</p>
      </div>
    </div>

    <!-- 无数据状态 -->
    <div v-else class="empty-state">
      <p>暂无精彩片段</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE_URL } from '@/api/config'

const route = useRoute()
const router = useRouter()
const movieId = parseInt(route.params.id) || 1

const clips = ref([])
const currentClip = ref(null)
const movieTitle = ref('')
const movieCover = ref('')
const loading = ref(true)
const error = ref(null)
const videoPlayer = ref(null)
const videoError = ref(false)
const useIframe = ref(false) // 是否使用iframe加载

// 处理视频URL - 本地视频直接使用路径
const processVideoUrl = (url) => {
  if (!url) return url
  // 如果是本地路径（以/开头），直接返回
  if (url.startsWith('/')) {
    return url
  }
  // 如果是外部地址，使用后端代理（保留兼容性）
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `${API_BASE_URL}/movies/proxy/video?url=${encodeURIComponent(url)}`
  }
  return url
}

// 获取片段列表
const fetchClips = async () => {
  try {
    loading.value = true
    error.value = null

    // 获取电影信息
    const movieResponse = await axios.get(`${API_BASE_URL}/movies/${movieId}`)
    if (movieResponse.data.success) {
      movieTitle.value = movieResponse.data.data.title
      movieCover.value = movieResponse.data.data.cover
    }

    // 获取片段列表
    const clipsResponse = await axios.get(`${API_BASE_URL}/movies/${movieId}/clips`)
    if (clipsResponse.data.success) {
      clips.value = clipsResponse.data.data.map(clip => ({
        ...clip,
        video_url: processVideoUrl(clip.video_url)
      }))
      // 默认选择第一个片段
      if (clips.value.length > 0) {
        currentClip.value = clips.value[0]
      }
    } else {
      error.value = '获取片段列表失败'
    }

    loading.value = false
  } catch (err) {
    console.error('获取片段失败:', err)
    error.value = err.response?.data?.message || '加载失败，请稍后重试'
    loading.value = false
  }
}

// 选择片段
const selectClip = (clip) => {
  currentClip.value = {
    ...clip,
    video_url: processVideoUrl(clip.video_url)
  }
  videoError.value = false
  useIframe.value = false // 重置iframe状态
  // 如果视频已加载，重新加载新视频
  if (videoPlayer.value) {
    videoPlayer.value.style.display = 'block'
    videoPlayer.value.load()
  }
}

// 尝试使用iframe加载
const tryIframe = () => {
  useIframe.value = true
  videoError.value = false
}

// 视频开始加载
const onVideoLoadStart = () => {
  videoError.value = false
  console.log('视频开始加载:', currentClip.value?.video_url)
}

// 视频可以播放
const onVideoCanPlay = () => {
  console.log('视频可以播放')
  videoError.value = false
  if (videoPlayer.value) {
    videoPlayer.value.style.display = 'block'
  }
}

// 视频加载完成
const onVideoLoaded = () => {
  console.log('视频元数据加载完成')
  videoError.value = false
  if (videoPlayer.value) {
    videoPlayer.value.style.display = 'block'
  }
}

// 视频加载停滞
const onVideoStalled = () => {
  console.warn('视频加载停滞')
}

// 视频加载错误
const onVideoError = (e) => {
  console.error('视频加载失败:', e)
  const video = e.target
  const error = video.error
  
  if (error) {
    let errorMessage = '视频加载失败'
    let errorCode = error.code
    let errorMessageDetail = error.message || ''
    
    switch (errorCode) {
      case error.MEDIA_ERR_ABORTED:
        errorMessage = '视频加载被中止'
        break
      case error.MEDIA_ERR_NETWORK:
        errorMessage = '网络错误，请检查网络连接'
        break
      case error.MEDIA_ERR_DECODE:
        errorMessage = '视频解码失败'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = '视频格式不支持或视频地址无效'
        break
      default:
        errorMessage = '视频加载失败，请检查视频地址'
    }
    
    console.error('视频错误详情:', {
      code: errorCode,
      message: errorMessage,
      detail: errorMessageDetail,
      videoSrc: video.src,
      networkState: video.networkState,
      readyState: video.readyState
    })
  } else {
    // 如果没有error对象，可能是网络请求失败
    console.error('视频加载失败 - 无错误对象，可能是网络请求被拒绝')
    console.error('视频源:', video.src)
    console.error('网络状态:', video.networkState)
    console.error('就绪状态:', video.readyState)
  }
  
  videoError.value = true
  if (videoPlayer.value) {
    videoPlayer.value.style.display = 'none'
  }
}

// 在新窗口打开视频
const openVideoInNewTab = () => {
  if (currentClip.value?.video_url) {
    window.open(currentClip.value.video_url, '_blank')
  }
}

// 复制视频地址
const copyVideoUrl = async () => {
  if (currentClip.value?.video_url) {
    try {
      await navigator.clipboard.writeText(currentClip.value.video_url)
      alert('视频地址已复制到剪贴板')
    } catch (err) {
      // 如果clipboard API不可用，使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = currentClip.value.video_url
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        alert('视频地址已复制到剪贴板')
      } catch (e) {
        console.error('复制失败:', e)
      }
      document.body.removeChild(textArea)
    }
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// 设置默认图片
const setDefaultImg = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80'
}

onMounted(() => {
  fetchClips()
})
</script>

<style scoped>
.clips-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: var(--color-text, #333);
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: var(--color-background-soft, #f5f5f5);
  border: 1px solid var(--color-border, #ddd);
  color: var(--color-text, #333);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.back-btn:hover {
  background: var(--color-border-hover, #e0e0e0);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading, #222);
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

.retry-btn:hover {
  background: #2a3c5c;
}

.clips-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.clips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.clip-card {
  background: var(--color-background-soft, #fff);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.clip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.clip-card.active {
  border-color: var(--vt-c-indigo, #646cff);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
}

.clip-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: #000;
  overflow: hidden;
}

.clip-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.clip-card:hover .play-overlay {
  background: rgba(100, 108, 255, 0.8);
  transform: translate(-50%, -50%) scale(1.1);
}

.play-icon {
  width: 30px;
  height: 30px;
  margin-left: 4px;
}

.duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.clip-info {
  padding: 1rem;
}

.clip-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading, #222);
}

.clip-description {
  font-size: 0.875rem;
  color: var(--color-text, #666);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-player-container {
  background: var(--color-background-soft, #fff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-border, #ddd);
}

.video-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 比例 */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-hint {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.error-tip {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 1rem;
  font-weight: 500;
}

.error-reasons {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  text-align: left;
  font-size: 0.875rem;
}

.error-reasons li {
  padding: 0.25rem 0;
  opacity: 0.8;
  padding-left: 1.5rem;
  position: relative;
}

.error-reasons li::before {
  content: '•';
  position: absolute;
  left: 0.5rem;
  opacity: 0.6;
}

.error-suggestion {
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-style: italic;
}

.error-debug {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
  font-style: italic;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.error-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.error-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.video-info {
  padding: 0 0.5rem;
}

.video-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-heading, #222);
}

.video-description {
  color: var(--color-text, #666);
  line-height: 1.6;
}

.no-clip-selected {
  text-align: center;
  padding: 3rem;
  background: var(--color-background-soft, #f5f5f5);
  border-radius: 12px;
  color: var(--color-text, #999);
}

@media (max-width: 768px) {
  .clips-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
  }
}
</style>

