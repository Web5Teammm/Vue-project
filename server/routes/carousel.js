import express from 'express'
import { pool } from '../config/database.js'

const router = express.Router()

// 获取轮播图数据
router.get('/', async (req, res) => {
  try {
    const [carousels] = await pool.execute(`
      SELECT c.*, m.title, m.cover, m.id as movie_id
      FROM carousels c
      INNER JOIN movies m ON c.movie_id = m.id
      WHERE c.is_active = 1
      ORDER BY c.sort_order ASC, c.id ASC
    `)
    
    res.json({
      success: true,
      data: carousels
    })
  } catch (error) {
    console.error('获取轮播图失败:', error)
    res.status(500).json({
      success: false,
      message: '获取轮播图失败'
    })
  }
})

export default router

