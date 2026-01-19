//用户相关API
import { USE_MOCK, mockDelay, formatResponse, API_BASE_URL } from './config'
import { mockUsers, mockLogin, mockRegister } from '@/utils/mockData'

export const userApi = {
  // 用户登录
  async login(credentials) {
    if (USE_MOCK) {
      // 使用 mockData 中的 mockLogin 函数，支持 phone 或 username
      const phone = credentials.phone || credentials.username
      const result = mockLogin(phone, credentials.password)

      if (result.success) {
        const token = 'mock_token_' + Date.now()
        return mockDelay(formatResponse({ user: result.data, token }))
      } else {
        return mockDelay(formatResponse(null, false, result.message || '用户名或密码错误'))
      }
    }

    // 真实 API 调用
    // 将username转换为phone以适配后端
    const requestData = credentials.username
      ? { phone: credentials.username, password: credentials.password }
      : credentials
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
    const data = await response.json()
    return data
  },

  // 用户注册
  async register(userData) {
    if (USE_MOCK) {
      // 使用 mockData 中的 mockRegister 函数
      const phone = userData.phone || userData.username
      const nickname = userData.nickname || userData.username
      const result = mockRegister(phone, userData.password, nickname)

      if (result.success) {
        const token = 'mock_token_' + Date.now()
        return mockDelay(formatResponse({ user: result.data, token }))
      } else {
        return mockDelay(formatResponse(null, false, result.message || '注册失败'))
      }
    }

    // 将username转换为phone以适配后端
    const requestData = {
      phone: userData.username || userData.phone,
      password: userData.password,
      nickname: userData.nickname || userData.username || '用户'
    }
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
    const data = await response.json()
    return data
  },

  // 获取用户信息
  async getUserInfo(userId) {
    if (USE_MOCK) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        const { password, ...userInfo } = user
        return mockDelay(formatResponse(userInfo))
      }
      return mockDelay(formatResponse(null, false, '用户不存在'))
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`)
    const data = await response.json()
    return data
  },

  // 更新用户信息
  async updateUserInfo(userId, updates) {
    if (USE_MOCK) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        Object.assign(user, updates)
        const { password, ...userInfo } = user
        return mockDelay(formatResponse(userInfo))
      }
      return mockDelay(formatResponse(null, false, '更新失败'))
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await response.json()
    return data
  },

  // 收藏电影
  async toggleFavorite(userId, movieId) {
    if (USE_MOCK) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        const index = user.favorites.indexOf(movieId)
        if (index > -1) {
          user.favorites.splice(index, 1)
        } else {
          user.favorites.push(movieId)
        }
        return mockDelay(formatResponse({ favorites: user.favorites }))
      }
      return mockDelay(formatResponse(null, false, '操作失败'))
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId })
    })
    const data = await response.json()
    return data
  },

  // 获取收藏列表
  async getFavorites(userId) {
    if (USE_MOCK) {
      const user = mockUsers.find((u) => u.id === userId)
      if (user) {
        // Here we should probably return full movie objects, but mock data only stores IDs.
        // For simplicity, let's map IDs to basic objects or modify logic.
        // Assuming mockData utils helper exists or we just return ids for now.
        // Better:
        const { getMovieById } = await import('@/utils/mockData')
        const movies = user.favorites.map(id => getMovieById(id)).filter(Boolean)
        return mockDelay(formatResponse(movies))
      }
      return mockDelay(formatResponse([]))
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`)
    const data = await response.json()
    return data
  },

  // 获取用户评论列表
  async getUserComments(userId) {
    if (USE_MOCK) {
      const { mockComments, getMovieById } = await import('@/utils/mockData')
      // Flatten all comments and find those by userId
      // mockComments is { movieId: [comments] }
      let userComments = []
      Object.keys(mockComments).forEach(movieId => {
        const comments = mockComments[movieId]
        const found = comments.filter(c => c.userId === userId).map(c => ({
          ...c,
          movieTitle: getMovieById(parseInt(movieId))?.title || '未知影片',
          movieCover: getMovieById(parseInt(movieId))?.cover
        }))
        userComments = userComments.concat(found)
      })
      return mockDelay(formatResponse(userComments))
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/comments`)
    const data = await response.json()
    return data
  },

  // 删除用户评论
  async deleteUserComment(userId, commentId) {
    if (USE_MOCK) {
      // Mock deletion logic
      return mockDelay(formatResponse(true))
    }
    const response = await fetch(`${API_BASE_URL}/users/${userId}/comments/${commentId}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    return data
  }
}
