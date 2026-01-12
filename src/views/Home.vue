<template>
  <!-- 固定导航栏 -->
  <header class="nav-container">
    <div class="nav-wrapper">
      <h1 class="site-title">影视视界</h1>
      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/all-films" class="nav-link">全部影视</router-link>
        <router-link to="/classify" class="nav-link">分类筛选</router-link>
      </nav>
      <div class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索电影...（模糊搜索）"
          @keyup.enter="handleSearch"
        />
        <button class="search-icon-btn" @click="handleSearch">🔍</button>
      </div>
      <div class="user-operate">
        <router-link v-if="!isLogin" to="/login" class="btn">登录</router-link>
        <router-link v-if="!isLogin" to="/register" class="btn btn-primary">注册</router-link>
        <router-link v-else to="/personal" class="user-info-link">
          <span class="user-name">{{ user?.nickname || user?.phone || '用户' }}</span>
          <span class="user-avatar-icon">👤</span>
        </router-link>
      </div>
    </div>
  </header>

  <!-- 热门作品轮播 -->
  <section class="carousel-container">
    <swiper 
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :loop="true"
      :navigation="false"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :effect="'fade'"
      :fadeEffect="{ crossFade: true }"
      @mouseenter="stopCarousel"
      @mouseleave="startCarousel"
      ref="carouselRef"
    >
      <swiper-slide v-for="(film, idx) in hotFilms" :key="film.id || idx">
        <router-link :to="`/detail/${film.id}`">
          <img :src="film.cover" :alt="film.name" class="carousel-img" />
        </router-link>
      </swiper-slide>
    </swiper>
  </section>

  <!-- 分类推荐区 -->
  <section class="classify-container">
    <div class="classify-item" v-for="(category, idx) in classifyList" :key="idx">
      <h2 class="classify-title">{{ category.name }}</h2>
      <div class="film-card-list">
        <router-link :to="`/detail/${film.id}`" class="film-card" v-for="(film, fIdx) in category.films" :key="fIdx">
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
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { movieApi } from '@/api/movie';
import axios from 'axios';
import { API_BASE_URL } from '@/api/config';

const router = useRouter();
const userStore = useUserStore();

// 使用 store 中的登录状态
const isLogin = computed(() => userStore.isLoggedIn);
const user = computed(() => userStore.user);
// 轮播实例引用
const carouselRef = ref(null);
// 搜索关键词
const searchKeyword = ref('');
// 轮播数据
const hotFilms = ref([]);
// 分类推荐数据
const classifyList = ref([]);
// 加载状态
const loading = ref(true);

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchKeyword.value.trim() }
    });
  }
};

// 获取轮播数据
const fetchCarousel = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carousel`);
    if (response.data.success) {
      hotFilms.value = response.data.data.map(item => ({
        id: item.movie_id,
        name: item.title,
        cover: item.image_url || item.cover
      }));
    }
  } catch (error) {
    console.error('获取轮播数据失败:', error);
    // 使用默认数据
    hotFilms.value = [
      { id: 1, name: '流浪地球2', cover: '/covers/film1.jpeg' },
      { id: 2, name: '战狼2', cover: '/covers/film2.jpeg' },
      { id: 3, name: '长津湖', cover: '/covers/film3.jpeg' },
      { id: 4, name: '无间道', cover: '/covers/film4.jpeg' }
    ];
  }
};

// 获取分类推荐数据
const fetchClassifyList = async () => {
  try {
    // 获取热门电影
    const hotResponse = await movieApi.getHotMovies();
    const hotMovies = hotResponse.data || [];
    
    // 获取最新电影
    const newResponse = await movieApi.getNewMovies();
    const newMovies = newResponse.data || [];
    
    // 获取所有电影用于分类
    const allResponse = await movieApi.getAllMovies();
    const allMovies = allResponse.data || [];
    
    // 按类型分类
    const comedyMovies = allMovies.filter(m => m.type && m.type.includes('喜剧'));
    const dramaMovies = allMovies.filter(m => m.type && (m.type.includes('剧情') || m.type.includes('家庭')));
    
    classifyList.value = [
      {
        name: '热门推荐',
        films: hotMovies.map(m => ({
          id: m.id,
          name: m.title,
          cover: m.cover,
          type: m.type,
          score: m.score,
          status: m.status
        }))
      },
      {
        name: '最新上映',
        films: newMovies.map(m => ({
          id: m.id,
          name: m.title,
          cover: m.cover,
          type: m.type,
          score: m.score,
          status: m.status
        }))
      },
      {
        name: '喜剧专区',
        films: comedyMovies.map(m => ({
          id: m.id,
          name: m.title,
          cover: m.cover,
          type: m.type,
          score: m.score,
          status: m.status
        }))
      },
      {
        name: '现实题材',
        films: dramaMovies.map(m => ({
          id: m.id,
          name: m.title,
          cover: m.cover,
          type: m.type,
          score: m.score,
          status: m.status
        }))
      }
    ].filter(category => category.films.length > 0);
    
    loading.value = false;
  } catch (error) {
    console.error('获取分类数据失败:', error);
    loading.value = false;
  }
};

// 初始化数据
onMounted(async () => {
  await Promise.all([fetchCarousel(), fetchClassifyList()]);
});

// 轮播控制：鼠标悬停暂停/离开继续
const stopCarousel = () => {
  carouselRef.value.$swiper.autoplay.stop();
};
const startCarousel = () => {
  carouselRef.value.$swiper.autoplay.start();
};
</script>

<style scoped>
/* 导航栏样式 */
.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #1d1d1f;
  color: #fff;
  z-index: 999;
}
.nav-wrapper {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.site-title {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
}
.nav-links {
  display: flex;
  gap: 30px;
}
.nav-link {
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}
.nav-link:hover {
  color: #ff4d4f;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px 12px;
  transition: background 0.3s;
}
.search-box:focus-within {
  background: rgba(255, 255, 255, 0.2);
}
.search-input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  width: 200px;
  outline: none;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.search-icon-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: transform 0.3s;
}
.search-icon-btn:hover {
  transform: scale(1.1);
}
.user-operate {
  display: flex;
  gap: 15px;
  align-items: center;
}
.btn {
  padding: 6px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}
.btn-primary {
  background: #ff4d4f;
  color: #fff;
  border: 1px solid #ff4d4f;
}
.btn {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
}
.btn:hover {
  opacity: 0.8;
}
.user-info-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background 0.3s;
}

.user-info-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-avatar-icon {
  font-size: 20px;
}

/* 轮播样式 - 全屏展示 */
.carousel-container {
  margin: 60px 0 0 0;
  width: 100vw;
  height: calc(100vh - 60px);
  min-height: 600px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.carousel-container :deep(.swiper-pagination) {
  bottom: 30px !important;
  z-index: 10;
}

.carousel-container :deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
  margin: 0 6px;
  transition: all 0.3s;
}

.carousel-container :deep(.swiper-pagination-bullet-active) {
  background: #ff4d4f;
  width: 30px;
  border-radius: 6px;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.carousel-img:hover {
  transform: scale(1.05);
}

/* 分类推荐样式 */
.classify-container {
  width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.classify-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}
.film-card-list {
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

/* 响应式适配 */
@media (max-width: 1200px) {
  .nav-wrapper, .classify-container {
    width: 90%;
  }
  .carousel-container {
    height: calc(100vh - 60px);
    min-height: 500px;
  }
  .search-input {
    width: 150px;
  }
}
@media (max-width: 768px) {
  .carousel-container {
    height: calc(100vh - 60px);
    min-height: 400px;
  }
  .film-card {
    width: calc(50% - 10px);
  }
  .nav-links {
    display: none;
  }
  .search-box {
    display: none;
  }
  .search-input {
    width: 120px;
  }
}
</style>