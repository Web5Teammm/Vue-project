import express from 'express'
import { pool } from '../config/database.js'

const router = express.Router()

// ============= 重要：具体路由必须在参数路由之前定义 =============

// 搜索电影（模糊搜索）- 必须在 /:id 之前
router.get('/search', async (req, res) => {
  try {
    let keyword = req.query.q || ''

    // 解码URL编码的关键词
    try {
      keyword = decodeURIComponent(keyword)
    } catch (e) {
      // 如果解码失败，使用原始值
    }

    // 去除首尾空格
    keyword = keyword.trim()

    if (!keyword) {
      return res.json({
        success: true,
        data: []
      })
    }

    console.log('搜索关键词:', keyword)

    // 使用LIKE进行模糊搜索，支持中文
    const searchPattern = `%${keyword}%`

    const [movies] = await pool.execute(`
      SELECT * FROM movies 
      WHERE title LIKE ? 
         OR director LIKE ? 
         OR type LIKE ? 
         OR description LIKE ?
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN director LIKE ? THEN 2
          WHEN type LIKE ? THEN 3
          ELSE 4
        END,
        score DESC
      LIMIT 50
    `, [
      searchPattern,  // WHERE title LIKE
      searchPattern,  // WHERE director LIKE
      searchPattern,  // WHERE type LIKE
      searchPattern,  // WHERE description LIKE
      searchPattern,  // ORDER BY title LIKE
      searchPattern,  // ORDER BY director LIKE
      searchPattern   // ORDER BY type LIKE
    ])

    console.log(`找到 ${movies.length} 个结果`)

    res.json({
      success: true,
      data: movies
    })
  } catch (error) {
    console.error('搜索电影失败:', error)
    res.status(500).json({
      success: false,
      message: '搜索失败: ' + error.message
    })
  }
})

// 获取热门电影 - 必须在 /:id 之前
router.get('/hot/list', async (req, res) => {
  try {
    const [movies] = await pool.execute(`
      SELECT * FROM movies 
      ORDER BY score DESC 
      LIMIT 10
    `)

    res.json({
      success: true,
      data: movies
    })
  } catch (error) {
    console.error('获取热门电影失败:', error)
    res.status(500).json({
      success: false,
      message: '获取热门电影失败'
    })
  }
})

// 获取最新电影 - 必须在 /:id 之前
router.get('/new/list', async (req, res) => {
  try {
    const [movies] = await pool.execute(`
      SELECT * FROM movies 
      ORDER BY release_time DESC 
      LIMIT 10
    `)

    res.json({
      success: true,
      data: movies
    })
  } catch (error) {
    console.error('获取最新电影失败:', error)
    res.status(500).json({
      success: false,
      message: '获取最新电影失败'
    })
  }
})

// 获取电影的精彩片段 - 必须在 /:id 之前
router.get('/:id/clips', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id)

    const [clips] = await pool.execute(`
      SELECT * FROM clips 
      WHERE movie_id = ? 
      ORDER BY sort_order ASC, id ASC
    `, [movieId])

    res.json({
      success: true,
      data: clips
    })
  } catch (error) {
    console.error('获取精彩片段失败:', error)
    res.status(500).json({
      success: false,
      message: '获取精彩片段失败'
    })
  }
})

// 获取所有电影
router.get('/', async (req, res) => {
  try {
    const [movies] = await pool.execute(`
      SELECT m.*, 
             GROUP_CONCAT(DISTINCT a.name) as actors
      FROM movies m
      LEFT JOIN movie_actors ma ON m.id = ma.movie_id
      LEFT JOIN actors a ON ma.actor_id = a.id
      GROUP BY m.id
      ORDER BY m.score DESC
    `)

    // 处理演员数据
    const formattedMovies = movies.map(movie => ({
      ...movie,
      actors: movie.actors ? movie.actors.split(',') : []
    }))

    res.json({
      success: true,
      data: formattedMovies
    })
  } catch (error) {
    console.error('获取电影列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取电影列表失败'
    })
  }
})

// 获取电影详情 - 必须在最后定义，因为会匹配所有路径
router.get('/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id)

    // 获取电影基本信息
    const [movies] = await pool.execute(
      'SELECT * FROM movies WHERE id = ?',
      [movieId]
    )

    if (movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: '电影不存在'
      })
    }

    const movie = movies[0]

    // 获取演员信息
    const [actors] = await pool.execute(`
      SELECT a.* FROM actors a
      INNER JOIN movie_actors ma ON a.id = ma.actor_id
      WHERE ma.movie_id = ?
    `, [movieId])

    // 为每个演员获取代表作品
    for (const actor of actors) {
      const [works] = await pool.execute(`
        SELECT m.id, m.title, m.cover, m.score
        FROM movies m
        INNER JOIN movie_actors ma ON m.id = ma.movie_id
        WHERE ma.actor_id = ?
        ORDER BY m.score DESC
        LIMIT 5
      `, [actor.id])
      actor.works = works
    }

    movie.cast = actors

    res.json({
      success: true,
      data: movie
    })
  } catch (error) {
    console.error('获取电影详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取电影详情失败'
    })
  }
})

// 视频代理 - 绕过Referer限制（必须在/:id之前）
router.get('/proxy/video', async (req, res) => {
  try {
    const videoUrl = req.query.url

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: '缺少视频URL参数'
      })
    }

    console.log('代理视频请求:', videoUrl)

    // 使用fetch获取视频，不发送Referer
    const response = await fetch(videoUrl, {
      headers: {
        'Referer': '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `视频服务器返回错误: ${response.status}`
      })
    }

    // 设置响应头
    res.setHeader('Content-Type', response.headers.get('content-type') || 'video/mp4')
    res.setHeader('Content-Length', response.headers.get('content-length') || '')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=3600')

    // 转发视频流
    const buffer = await response.arrayBuffer()
    res.send(Buffer.from(buffer))
  } catch (error) {
    console.error('视频代理失败:', error)
    res.status(500).json({
      success: false,
      message: '视频代理失败: ' + error.message
    })
  }
})

export default router
