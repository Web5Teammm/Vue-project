//模拟数据
//电影数据（成员1、2写）
export const movies = [
  /* ... */
   {
    id: 1,
    title: '流浪地球2',
    type: '科幻/冒险',
    score: 9.4,
    status: '全1集',
    cover: '/assets/images/movie1.jpg', // 本地测试图片路径
    releaseTime: '2023-01-22',
    duration: '173分钟',
    director: '郭帆',
    actors: [1, 2], // 关联演员ID
    description: '太阳危机即将来袭，人类开启“流浪地球计划”...'
  },
  {
    id: 2,
    title: '满江红',
    type: '剧情/悬疑',
    score: 8.0,
    status: '全1集',
    cover: '/assets/images/movie2.jpg',
    releaseTime: '2023-01-22',
    duration: '159分钟',
    director: '张艺谋',
    actors: [3, 4],
    description: '南宋绍兴年间，一群义士铲奸除恶的故事...'
  }
]

//轮播图数据（成员1）
export const bannerMovies = [
  /* ... */
  { id: 1, title: '流浪地球2', cover: '/assets/images/banner1.jpg' },
  { id: 2, title: '满江红', cover: '/assets/images/banner2.jpg' },
  { id: 3, title: '熊出没·伴我“熊芯”', cover: '/assets/images/banner3.jpg' }

]

//演员弹窗呈现的数据（成员3）
export const actors = [
  /* ... */
    {
    id: 1,
    name: '吴京',
    avatar: '/assets/images/actor1.jpg',
    birth: '1974-04-03',
    birthPlace: '北京',
    works: [1], // 关联电影ID
    intro: '中国内地男演员、导演，代表作《战狼》系列...'
  },
  {
    id: 2,
    name: '刘德华',
    avatar: '/assets/images/actor2.jpg',
    birth: '1961-09-27',
    birthPlace: '香港',
    works: [1],
    intro: '中国香港男演员、歌手，代表作《无间道》...'
  }
]

//用户登陆注册的个人信息数据
export const users = [
  /* ... */
   {
    id: 1,
    phone: '13800138000',
    password: 'Aa123456', // 真实项目需加密，模拟阶段明文
    nickname: '电影爱好者',
    avatar: '/assets/images/default-avatar.jpg',
    favorites: [1], // 收藏的电影ID
    comments: [
      {
        id: 1,
        movieId: 1,
        content: '太震撼了！国产科幻的天花板',
        createTime: '2025-01-01 12:00:00'
      }
    ],
    registerTime: '2024-12-01 10:00:00'
  }
]

//模拟登录功能
export const mockLogin = (phone, password) => {
  const user = users.find((u) => u.phone === phone)

  if (!user) {
    return {
      success: false,
      message: '该手机号未注册',
    }
  }

  if (user.password !== password) {
    return {
      success: false,
      message: '密码错误',
    }
  }

  //登录成功，返回用户信息（不包含密码）
  const { password: _, ...userInfo } = user
  return {
    success: true,
    data: userInfo,
    message: '登录成功',
  }
}

//模拟注册功能
export const mockRegister = (phone, password, nickname) => {
  //检查手机号是否已存在
  const exists = users.find((u) => u.phone === phone)
  if (exists) {
    return {
      success: false,
      message: '该手机号已注册',
    }
  }

  //创建新用户
  const newUser = {
    id: users.length + 1,
    phone,
    password,
    nickname: nickname || `用户${users.length + 1}`,
    avatar: '../assets/images/default-avatar.jpg',
    favorites: [],
    comments: [],
    registerTime: new Date().toLocaleString('zh-CN'),
  }

  users.push(newUser)

  //返回用户信息（不包含密码）
  const { password: _, ...userInfo } = newUser
  return {
    success: true,
    data: userInfo,
    message: '注册成功',
  }
}

//模拟收藏/取消收藏
export const mockToggleFavorite = async (userId, movieId) => {
  await mockDelay()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, message: '用户不存在' }
  const index = user.favorites.findIndex((id) => id === movieId)
  if (index > -1) {
    user.favorites.splice(index, 1)
    return { success: true, message: '取消收藏成功' }
  } else {
    user.favorites.push(movieId)
    return { success: true, message: '收藏成功' }
  }
}

//评论数据
export const mockAddComment = (userId, movieId, content) => {
  const user = users.find((u) => u.id === userId)
  const movie = movies.find((m) => m.id === movieId)

  if (!user || !movie) return { success: false }

  const newComment = {
    id: Date.now(),
    movieId,
    movieTitle: movie.title,
    content,
    createTime: new Date().toLocaleString('zh-CN'),
  }

  user.comments.push(newComment)
  return { success: true, data: newComment }
}

// 延迟函数
const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// 导出别名以匹配 API 文件中的导入
export const mockMovies = movies
export const mockUsers = users
export const mockCarouselItems = bannerMovies

// 评论数据（按电影ID组织）
export const mockComments = {
  1: [
    {
      id: 1,
      movieId: 1,
      userId: 1,
      username: '电影爱好者',
      avatar: '/assets/images/default-avatar.jpg',
      content: '太震撼了！国产科幻的天花板',
      createTime: '2025-01-01 12:00:00',
      likes: 128,
    },
    {
      id: 2,
      movieId: 1,
      userId: 2,
      username: '科幻迷',
      avatar: '/assets/images/default-avatar.jpg',
      content: '特效和剧情都很棒，值得二刷！',
      createTime: '2025-01-02 14:30:00',
      likes: 56,
    },
  ],
  2: [
    {
      id: 3,
      movieId: 2,
      userId: 1,
      username: '电影爱好者',
      avatar: '/assets/images/default-avatar.jpg',
      content: '张艺谋导演的又一力作，剧情紧凑',
      createTime: '2025-01-03 10:20:00',
      likes: 89,
    },
  ],
}

// 根据ID获取电影
export const getMovieById = (id) => {
  return movies.find((movie) => movie.id === id) || null
}

// 获取热门电影（按评分排序）
export const getHotMovies = () => {
  return [...movies].sort((a, b) => b.score - a.score).slice(0, 10)
}

// 获取最新电影（按发布时间排序）
export const getNewMovies = () => {
  return [...movies]
    .sort((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime))
    .slice(0, 10)
}

// 搜索电影
export const searchMovies = (keyword) => {
  if (!keyword) return movies
  const lowerKeyword = keyword.toLowerCase()
  return movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(lowerKeyword) ||
      movie.director.toLowerCase().includes(lowerKeyword) ||
      movie.type.toLowerCase().includes(lowerKeyword) ||
      movie.description.toLowerCase().includes(lowerKeyword),
  )
}
