<template>
  <header class="nav-container">
    <div class="nav-wrapper">
      <h1 class="site-title" @click="$router.push('/')">影视视界</h1>
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
          placeholder="搜索电影..."
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
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const isLogin = computed(() => userStore.isLoggedIn);
const user = computed(() => userStore.user);
const searchKeyword = ref('');

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchKeyword.value.trim() }
    });
  }
};
</script>

<style scoped>
.nav-container {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  background: #1d1d1f;
  color: #fff;
  z-index: 999;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
.nav-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1rem;
}
.site-title {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
  cursor: pointer;
}
.nav-links {
  display: flex;
  gap: 30px;
}
.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}
.nav-link:hover, .router-link-active {
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

@media (max-width: 768px) {
  .nav-links, .search-box {
    display: none;
  }
}
</style>
