import express from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      })
    }

    // 检查手机号是否已存在
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该手机号已注册'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入新用户
    const [result] = await pool.execute(
      'INSERT INTO users (phone, password, nickname) VALUES (?, ?, ?)',
      [phone, hashedPassword, nickname || '用户']
    )

    // 获取用户信息（不包含密码）
    const [users] = await pool.execute(
      'SELECT id, phone, nickname, avatar, register_time FROM users WHERE id = ?',
      [result.insertId]
    )

    // 生成 token
    const token = 'token_' + result.insertId + '_' + Date.now()

    res.json({
      success: true,
      data: {
        user: users[0],
        token: token
      },
      message: '注册成功'
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      success: false,
      message: '注册失败'
    })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号和密码不能为空'
      })
    }

    // 查找用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '该手机号未注册'
      })
    }

    const user = users[0]

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      })
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user

    // 生成简单的 token (生产环境应使用 JWT)
    const token = 'token_' + user.id + '_' + Date.now()

    res.json({
      success: true,
      data: {
        user: userInfo,
        token: token
      },
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败'
    })
  }
})

// 获取用户收藏
router.get('/:id/favorites', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    const [favorites] = await pool.execute(`
      SELECT m.* FROM movies m
      INNER JOIN user_favorites uf ON m.id = uf.movie_id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
    `, [userId])

    res.json({
      success: true,
      data: favorites
    })
  } catch (error) {
    console.error('获取收藏失败:', error)
    res.status(500).json({
      success: false,
      message: '获取收藏失败'
    })
  }
})

// 添加/取消收藏
router.post('/:id/favorites', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    let { movieId } = req.body

    // Ensure movieId is an integer
    movieId = parseInt(movieId)

    console.log(`用户 ${userId} 正在操作收藏电影 ${movieId}`)

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: '电影ID不能为空'
      })
    }

    // 检查用户是否存在
    const [users] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId])
    if (users.length === 0) {
      console.log(`用户 ${userId} 不存在于数据库中`)
      return res.status(404).json({
        success: false,
        message: '用户不存在，请重新登录'
      })
    }

    // 检查电影是否存在
    const [movies] = await pool.execute('SELECT id FROM movies WHERE id = ?', [movieId])
    if (movies.length === 0) {
      console.log(`电影 ${movieId} 不存在于数据库中`)
      return res.status(404).json({
        success: false,
        message: '电影不存在'
      })
    }

    // 检查是否已收藏
    const [existing] = await pool.execute(
      'SELECT id FROM user_favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    )

    if (existing.length > 0) {
      // 取消收藏
      await pool.execute(
        'DELETE FROM user_favorites WHERE user_id = ? AND movie_id = ?',
        [userId, movieId]
      )

      return res.json({
        success: true,
        message: '取消收藏成功',
        isFavorite: false
      })
    } else {
      // 添加收藏
      await pool.execute(
        'INSERT INTO user_favorites (user_id, movie_id) VALUES (?, ?)',
        [userId, movieId]
      )

      return res.json({
        success: true,
        message: '收藏成功',
        isFavorite: true
      })
    }
  } catch (error) {
    console.error('操作收藏失败:', error)
    res.status(500).json({
      success: false,
      message: '操作失败'
    })
  }

})

// 获取用户评论
router.get('/:id/comments', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    // Joint movies table to get movie title and cover
    const [comments] = await pool.execute(`
      SELECT c.*, m.title as movieTitle, m.cover as movieCover
      FROM comments c
      INNER JOIN movies m ON c.movie_id = m.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId])

    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('获取用户评论失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户评论失败'
    })
  }
})

// 删除用户评论
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const commentId = parseInt(req.params.commentId)

    // Verify ownership
    const [existing] = await pool.execute(
      'SELECT id FROM comments WHERE id = ? AND user_id = ?',
      [commentId, userId]
    )

    if (existing.length === 0) {
      return res.status(403).json({
        success: false,
        message: '无权删除此评论或评论不存在'
      })
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [commentId])

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除评论失败:', error)
    res.status(500).json({
      success: false,
      message: '删除失败'
    })
  }
})

export default router

