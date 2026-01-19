<template>
  <div class="comments-section">
    <h3 class="section-title"><i class="fas fa-comments"></i> 我的评论</h3>

    <div v-if="isLoading" class="loading-state">加载中...</div>

    <div v-else-if="hasComments" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <img :src="comment.movieCover" alt="海报" class="movie-cover" style="cursor: pointer;" @click="$router.push('/detail/'+comment.movie_id)">
        <div class="comment-content">
          <h5 class="movie-title">{{ comment.movieTitle }}</h5>
          <p class="comment-text">{{ comment.content }}</p>
          <div class="comment-time">{{ new Date(comment.created_at).toLocaleString() }}</div>
        </div>
        <button class="delete-btn" @click="deleteComment(comment.id)" title="删除评论">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="far fa-comment-dots"></i>
      <p>暂无评论，去发表你的看法吧～</p>
    </div>
  </div>
</template>

<script setup>
import { useComments } from '@/composables/useComments'

const { comments, isLoading, hasComments, deleteComment } = useComments()
</script>

<style scoped>
.comments-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin: 0 20px 20px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: calc(100% - 40px);
  box-sizing: border-box;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
}

.movie-cover {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 15px;
}

.comment-content {
  flex: 1;
}

.movie-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.comment-text {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-time {
  font-size: 12px;
  color: #888;
}

.delete-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
</style>
