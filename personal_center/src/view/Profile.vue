<template>
  <div class="profile-page">
    <div class="profile-container">
      <UserInfo />
      <FavoritesSection />
      <CommentsSection />
    </div>
  </div>
</template>

<script setup>
import UserInfo from '@/components/profile/UserInfo.vue'
import FavoritesSection from '@/components/profile/FavoritesSection.vue'
import CommentsSection from '@/components/profile/CommentsSection.vue'
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
