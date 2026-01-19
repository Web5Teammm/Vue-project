import { defineStore } from 'pinia'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isLoggedIn: false,
    favorites: [],
    comments: [],
  }),

  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await userApi.login(credentials)
        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isLoggedIn = true
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        return { success: false, message: '登录失败' }
      }
    },

    // 注册
    async register(userData) {
      try {
        const response = await userApi.register(userData)
        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isLoggedIn = true
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error) {
        return { success: false, message: '注册失败' }
      }
    },

    // 登出
    logout() {
      this.user = null
      this.token = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // 初始化用户信息
    initUser() {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      // Validate that we have proper data
      if (token && userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          this.token = token
          this.user = JSON.parse(userStr)
          this.isLoggedIn = true
          // Fetch fresh favorites data
          this.fetchFavorites()
        } catch (error) {
          console.error('初始化用户信息失败:', error)
          this.logout()
        }
      } else {
        // Clear invalid data
        this.logout()
      }
    },

    // 获取收藏列表
    async fetchFavorites() {
      if (!this.isLoggedIn || !this.user) return
      try {
        const response = await userApi.getFavorites(this.user.id)
        if (response.success) {
          this.favorites = response.data
        }
      } catch (error) {
        console.error('获取收藏失败:', error)
      }
    },

    // 切换收藏
    async toggleFavorite(movieId) {
      if (!this.isLoggedIn) return { success: false, message: '请先登录' }
      try {
        const response = await userApi.toggleFavorite(this.user.id, movieId)
        if (response.success) {
          // Update local favorites list based on response or manually toggle
          await this.fetchFavorites()
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: '操作失败' }
      }
    },

    // 获取用户评论
    async fetchUserComments() {
      if (!this.isLoggedIn || !this.user) return
      try {
        const response = await userApi.getUserComments(this.user.id)
        if (response.success) {
          this.comments = response.data
        }
      } catch (error) {
        console.error('获取用户评论失败:', error)
      }
    },

    // 删除评论
    async deleteUserComment(commentId) {
      if (!this.isLoggedIn) return { success: false, message: '请先登录' }
      try {
        const response = await userApi.deleteUserComment(this.user.id, commentId)
        if (response.success) {
          this.comments = this.comments.filter(c => c.id !== commentId)
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: '删除失败' }
      }
    }
  },
})
