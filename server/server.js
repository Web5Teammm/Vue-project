import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database.js'
import movieRoutes from './routes/movies.js'
import carouselRoutes from './routes/carousel.js'
import userRoutes from './routes/users.js'
import commentRoutes from './routes/comments.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/movies', movieRoutes)
app.use('/api/carousel', carouselRoutes)
app.use('/api/users', userRoutes)
app.use('/api/comments', commentRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  })
})

// 启动服务器
async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection()
  
  if (!dbConnected) {
    console.log('⚠️  警告: 数据库连接失败，请检查配置')
    console.log('   请确保MySQL已启动，并运行 init.sql 初始化数据库')
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
    console.log(`📡 API地址: http://localhost:${PORT}/api`)
  })
}

startServer()

