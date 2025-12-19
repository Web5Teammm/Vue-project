<template>
  <div class="user-info-section">
    <div class="user-avatar">
      <div class="avatar-img">👤</div>
    </div>
    <div class="user-details">
      <h2 class="user-name">{{ userName }}</h2>
      <div class="user-status">{{ userInfo.status }}</div>
      <button class="logout-btn" @click="logout">
        <i class="fas fa-sign-out-alt"></i> 退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUserProfile } from '@/composables/useUserProfile'

const { userInfo, userName, logout } = useUserProfile()
</script>

<style scoped>
.user-info-section {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 100px;
  height: 100px;
  margin-right: 25px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.user-status {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 20px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 25px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .user-info-section {
    flex-direction: column;
    text-align: center;
  }

  .user-avatar {
    margin-right: 0;
    margin-bottom: 20px;
  }
}
</style>