import express from 'express'
import { pool } from '../config/database.js'

const router = express.Router()

// 获取电影评论
router.get('/movies/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId)
    
    const [comments] = await pool.execute(`
      SELECT c.*, u.nickname as username, u.avatar
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.movie_id = ?
      ORDER BY c.created_at DESC
    `, [movieId])
    
    res.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('获取评论失败:', error)
    res.status(500).json({
      success: false,
      message: '获取评论失败'
    })
  }
})

// 添加评论
router.post('/movies/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId)
    const { userId, content } = req.body
    
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: '用户ID和评论内容不能为空'
      })
    }
    
    const [result] = await pool.execute(
      'INSERT INTO comments (movie_id, user_id, content) VALUES (?, ?, ?)',
      [movieId, userId, content]
    )
    
    // 获取新添加的评论
    const [comments] = await pool.execute(`
      SELECT c.*, u.nickname as username, u.avatar
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId])
    
    res.json({
      success: true,
      data: comments[0],
      message: '评论成功'
    })
  } catch (error) {
    console.error('添加评论失败:', error)
    res.status(500).json({
      success: false,
      message: '添加评论失败'
    })
  }
})

export default router

