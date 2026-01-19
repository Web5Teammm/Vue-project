<template>
  <div class="favorites-section">
    <h3 class="section-title"><i class="fas fa-heart"></i> 我的收藏</h3>

    <div v-if="isLoading" class="loading-state">加载中...</div>

    <div v-else-if="hasFavorites" class="favorites-grid">
      <div v-for="movie in favorites" :key="movie.id" class="movie-card">
        <img :src="movie.cover" alt="海报" class="movie-poster" @click="$router.push('/detail/' + movie.id)" style="cursor: pointer;">
        <button class="remove-btn" @click="removeFavorite(movie.id)" title="取消收藏">
          <i class="fas fa-times"></i>
        </button>
        <div class="movie-info">
          <h4 class="movie-title">{{ movie.title }}</h4>
          <div class="movie-meta">
            <span class="movie-rating"><i class="fas fa-star"></i> {{ movie.score || movie.rating }}</span>
            <span class="movie-type">{{ movie.type }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="far fa-folder-open"></i>
      <p>暂无收藏，去首页探索吧～</p>
    </div>
  </div>
</template>

<script setup>
import { useFavorites } from '@/composables/useFavorites'

const { favorites, isLoading, hasFavorites, removeFavorite } = useFavorites()
</script>

<style scoped>
.favorites-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: calc(100% - 40px);
  box-sizing: border-box;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.movie-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: #e74c3c;
}

.movie-info {
  padding: 15px;
}

.movie-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.movie-rating {
  color: #ffc107;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
</style>
