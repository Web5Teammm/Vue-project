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
      <div class="user-operate">
        <router-link v-if="!isLogin" to="/login" class="btn">登录</router-link>
        <router-link v-if="!isLogin" to="/register" class="btn btn-primary">注册</router-link>
        <router-link v-else to="/personal" class="user-avatar">
        </router-link>
      </div>
    </div>
  </header>

  <!-- 热门作品轮播 -->
  <section class="carousel-container">
    <swiper 
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :loop="true"
      :navigation="false"
      :pagination="{ clickable: true }"
      @mouseenter="stopCarousel"
      @mouseleave="startCarousel"
      ref="carouselRef"
    >
      <swiper-slide v-for="(film, idx) in hotFilms" :key="idx">
        <router-link :to="`/film/${film.id}`">
          < img :src="film.cover" :alt="film.name" class="carousel-img" />
        </router-link>
      </swiper-slide>
    </swiper>
  </section>

  <!-- 分类推荐区 -->
  <section class="classify-container">
    <div class="classify-item" v-for="(category, idx) in classifyList" :key="idx">
      <h2 class="classify-title">{{ category.name }}</h2>
      <div class="film-card-list">
        <router-link :to="`/film/${film.id}`" class="film-card" v-for="(film, fIdx) in category.films" :key="fIdx">
          <div class="card-cover">
            < img :src="film.cover" :alt="film.name" />
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
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
import 'swiper/css';
import 'swiper/css/pagination';

// 模拟登录状态（后续需对接账户管理模块，替换为Pinia/Vuex状态）
const isLogin = ref(false);
// 轮播实例引用
const carouselRef = ref(null);

// 热门轮播数据（指定电影：流浪地球2、战狼2、长津湖、无间道）
const hotFilms = ref([
  { id: 1, name: '流浪地球2', cover: '/static/covers/film1.jpg', type: '科幻/灾难', score: 8.3, status: '全片' },
  { id: 2, name: '战狼2', cover: '/static/covers/film2.jpg', type: '动作/战争', score: 7.1, status: '全片' },
  { id: 3, name: '长津湖', cover: '/static/covers/film3.jpg', type: '历史/战争', score: 7.4, status: '全片' },
  { id: 4, name: '无间道', cover: '/static/covers/film4.jpg', type: '犯罪/悬疑', score: 9.3, status: '全片' }
]);

// 分类推荐数据（包含所有指定电影）
const classifyList = ref([
  {
    name: '热门推荐',
    films: [
      { id: 1, name: '流浪地球2', cover: '/static/covers/film1.jpg', type: '科幻/灾难', score: 8.3, status: '全片' },
      { id: 2, name: '战狼2', cover: '/static/covers/film2.jpg', type: '动作/战争', score: 7.1, status: '全片' },
      { id: 3, name: '长津湖', cover: '/static/covers/film3.jpg', type: '历史/战争', score: 7.4, status: '全片' },
      { id: 4, name: '无间道', cover: '/static/covers/film4.jpg', type: '犯罪/悬疑', score: 9.3, status: '全片' }
    ]
  },
  {
    name: '喜剧专区',
    films: [
      { id: 5, name: '夏洛特烦恼', cover: '/static/covers/film5.jpg', type: '喜剧/爱情', score: 7.8, status: '全片' },
      { id: 6, name: '疯狂的外星人', cover: '/static/covers/film6.jpg', type: '喜剧/科幻', score: 6.4, status: '全片' }
    ]
  },
  {
    name: '现实题材',
    films: [
      { id: 7, name: '送你一朵小红花', cover: '/static/covers/film7.jpg', type: '剧情/家庭', score: 7.2, status: '全片' },
      { id: 8, name: '少年的你', cover: '/static/covers/film8.jpg', type: '剧情/犯罪', score: 8.2, status: '全片' }
    ]
  }
]);

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
.icon-user {
  font-size: 24px;
  color: #fff;
}

/* 轮播样式 */
.carousel-container {
  margin-top: 60px;
  width: 100%;
  height: 500px;
  overflow: hidden;
}
.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 分类推荐样式 */
.classify-container {
  width: 1200px;
  margin: 30px auto;
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
    height: 400px;
  }
}
@media (max-width: 768px) {
  .carousel-container {
    height: 250px;
  }
  .film-card {
    width: calc(50% - 10px);
  }
  .nav-links {
    display: none;
  }
}
</style>