-- =====================================================
-- 影视视界数据库初始化脚本
-- 版本: 2.0
-- 创建时间: 2026-01-19
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE movie_db;

-- 先删除已存在的表（按外键依赖顺序）
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS carousels;
DROP TABLE IF EXISTS clips;
DROP TABLE IF EXISTS movie_actors;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;

-- =====================================================
-- 1. 用户表
-- =====================================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  nickname VARCHAR(50) DEFAULT '用户' COMMENT '昵称',
  avatar VARCHAR(255) DEFAULT '/assets/images/default-avatar.jpg' COMMENT '头像',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================================================
-- 2. 电影表
-- =====================================================
CREATE TABLE movies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '电影标题',
  type VARCHAR(100) COMMENT '类型',
  score DECIMAL(3,1) DEFAULT 0.0 COMMENT '评分',
  status VARCHAR(50) DEFAULT '全片' COMMENT '状态',
  cover VARCHAR(255) COMMENT '封面图片',
  release_time DATE COMMENT '上映时间',
  duration VARCHAR(50) COMMENT '时长',
  director VARCHAR(100) COMMENT '导演',
  description TEXT COMMENT '简介',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_type (type),
  INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电影表';

-- =====================================================
-- 3. 演员表
-- =====================================================
CREATE TABLE actors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '演员姓名',
  avatar VARCHAR(255) COMMENT '演员头像',
  bio TEXT COMMENT '简介',
  birth DATE COMMENT '出生日期',
  birth_place VARCHAR(100) COMMENT '出生地',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='演员表';

-- =====================================================
-- 4. 电影-演员关联表
-- =====================================================
CREATE TABLE movie_actors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  actor_id INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_actor (movie_id, actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电影演员关联表';

-- =====================================================
-- 5. 精彩片段表
-- =====================================================
CREATE TABLE clips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  title VARCHAR(200) NOT NULL COMMENT '片段标题',
  video_url VARCHAR(500) NOT NULL COMMENT '视频地址',
  thumbnail VARCHAR(255) COMMENT '缩略图',
  duration INT DEFAULT 0 COMMENT '片段时长（秒）',
  description TEXT COMMENT '描述',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movie_id (movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='精彩片段表';

-- =====================================================
-- 6. 用户收藏表
-- =====================================================
CREATE TABLE user_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_movie (user_id, movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户收藏表';

-- =====================================================
-- 7. 评论表
-- =====================================================
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL COMMENT '评论内容',
  score INT DEFAULT 10 COMMENT '评分',
  likes INT DEFAULT 0 COMMENT '点赞数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_movie_id (movie_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- =====================================================
-- 8. 轮播图表
-- =====================================================
CREATE TABLE carousels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL COMMENT '轮播图片',
  title VARCHAR(200) COMMENT '标题',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_sort (sort_order, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- =====================================================
-- 插入测试用户
-- 密码: 123456 (使用 bcrypt 加密后的值)
-- =====================================================
INSERT INTO users (phone, password, nickname, avatar) VALUES
('13800138000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Sc6pZvd8.6eMhNsLRLhM4k8n/V.6H2W', '测试用户', '/assets/images/default-avatar.jpg'),
('13900139000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Sc6pZvd8.6eMhNsLRLhM4k8n/V.6H2W', '影视爱好者', '/assets/images/default-avatar.jpg'),
('13700137000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Sc6pZvd8.6eMhNsLRLhM4k8n/V.6H2W', '电影迷', '/assets/images/default-avatar.jpg');

-- =====================================================
-- 插入电影数据
-- =====================================================
INSERT INTO movies (title, type, score, status, cover, release_time, duration, director, description) VALUES
('流浪地球2', '科幻/冒险', 9.4, '全1集', '/covers/film1.jpeg', '2023-01-22', '173分钟', '郭帆', '太阳危机即将来袭，人类开启"流浪地球计划"，建造万座行星发动机推动地球离开太阳系。在此过程中，无数人前仆后继，挺身而出，用生命捍卫人类最后的希望。'),
('战狼2', '动作/战争', 7.1, '全片', '/covers/film2.jpeg', '2017-07-27', '123分钟', '吴京', '冷锋在非洲叛乱国家营救中国同胞和难民的故事。影片展现了中国军人的铁血担当和人道主义精神。'),
('长津湖', '历史/战争', 7.4, '全片', '/covers/film3.jpeg', '2021-09-30', '176分钟', '陈凯歌', '抗美援朝战争中，中国人民志愿军第9兵团在长津湖地区与美军展开的殊死搏斗。一群年轻战士在极寒天气中坚守阵地。'),
('无间道', '犯罪/悬疑', 9.3, '全片', '/covers/film4.jpeg', '2002-12-12', '101分钟', '刘伟强', '两个身份混乱的男人分别为警方和黑社会的卧底，经过一场激烈的角斗，他们决心要寻回自己的真正身份。'),
('夏洛特烦恼', '喜剧/爱情', 7.8, '全片', '/covers/film5.jpeg', '2015-09-30', '104分钟', '闫非', '夏洛在大闹初恋婚礼后意外重返青春，经历一番折腾后最终领悟人生、找回真爱的故事。'),
('疯狂的外星人', '喜剧/科幻', 6.4, '全片', '/covers/film6.jpeg', '2019-02-05', '116分钟', '宁浩', '耿浩与好友大飞经营着各自惨淡的"事业"，然而"天外来客"的意外降临，打破了二人平静又拮据的生活。'),
('送你一朵小红花', '剧情/家庭', 7.2, '全片', '/covers/film7.jpeg', '2020-12-31', '128分钟', '韩延', '两个抗癌家庭，两组生活轨迹。影片讲述了一个温情的现实故事，思考和直面了每一个普通人都会面临的终极问题。'),
('少年的你', '剧情/犯罪', 8.2, '全片', '/covers/film8.jpeg', '2019-10-25', '135分钟', '曾国祥', '一场高考前夕的校园意外，改变了两个少年的命运。陈念和刘北山相遇，从此互相守护。');

-- =====================================================
-- 插入演员数据
-- =====================================================
INSERT INTO actors (name, avatar, bio, birth, birth_place) VALUES
('吴京', '/assets/images/actor-wujing.jpg', '中国内地男演员、导演，代表中国硬核动作电影形象，多次出演主旋律与商业大片。代表作《战狼》系列、《流浪地球》系列。', '1974-04-03', '北京'),
('刘德华', '/assets/images/actor-liudehua.jpg', '华语影坛最具影响力的演员之一，涉猎警匪、文艺、商业片等多个类型。获得三届金马奖最佳男主角。', '1961-09-27', '香港'),
('沈腾', '/assets/images/actor-shenteng.jpg', '中国内地喜剧演员，开心麻花核心成员，擅长现实讽刺喜剧。代表作《夏洛特烦恼》、《西虹市首富》。', '1979-10-23', '黑龙江'),
('易烊千玺', '/assets/images/actor-yiyangqianxi.jpg', '中国内地流行歌手、舞者、演员，TFBOYS成员。凭借《少年的你》获得金像奖最佳新演员。', '2000-11-28', '湖南'),
('周冬雨', '/assets/images/actor-zhoudongyu.jpg', '中国内地女演员，凭借《七月与安生》获得金马奖最佳女主角。代表作《少年的你》、《燃冬》。', '1992-01-31', '河北');

-- =====================================================
-- 插入电影-演员关联
-- =====================================================
INSERT INTO movie_actors (movie_id, actor_id) VALUES
(1, 1), (1, 2),  -- 流浪地球2: 吴京, 刘德华
(2, 1),          -- 战狼2: 吴京
(3, 1),          -- 长津湖: 吴京
(4, 2),          -- 无间道: 刘德华
(5, 3),          -- 夏洛特烦恼: 沈腾
(6, 3),          -- 疯狂的外星人: 沈腾
(7, 4),          -- 送你一朵小红花: 易烊千玺
(8, 4), (8, 5);  -- 少年的你: 易烊千玺, 周冬雨

-- =====================================================
-- 插入精彩片段
-- =====================================================
INSERT INTO clips (movie_id, title, video_url, thumbnail, duration, description, sort_order) VALUES
(1, '流浪地球2 - 预告片', '/videos/clip1.mp4', '/covers/film1.jpeg', 120, '流浪地球2精彩预告', 1),
(1, '流浪地球2 - 太空电梯片段', '/videos/clip2.mp4', '/covers/film1.jpeg', 180, '震撼的太空电梯升空场景', 2),
(1, '流浪地球2 - 月球危机', '/videos/clip3.mp4', '/covers/film1.jpeg', 150, '月球危机精彩片段', 3),
(2, '战狼2 - 坦克大战', '/videos/clip4.mp4', '/covers/film2.jpeg', 200, '激烈的坦克大战场景', 1),
(2, '战狼2 - 水下搏斗', '/videos/clip5.mp4', '/covers/film2.jpeg', 180, '精彩的水下搏斗', 2),
(3, '长津湖 - 冰雕连', '/videos/clip6.mp4', '/covers/film3.jpeg', 160, '令人动容的冰雕连场景', 1),
(4, '无间道 - 天台对峙', '/videos/clip7.mp4', '/covers/film4.jpeg', 140, '经典天台对峙名场面', 1);

-- =====================================================
-- 插入轮播图数据
-- =====================================================
INSERT INTO carousels (movie_id, image_url, title, sort_order, is_active) VALUES
(1, '/covers/film1.jpeg', '流浪地球2', 1, 1),
(2, '/covers/film2.jpeg', '战狼2', 2, 1),
(3, '/covers/film3.jpeg', '长津湖', 3, 1),
(4, '/covers/film4.jpeg', '无间道', 4, 1);

-- =====================================================
-- 插入测试评论
-- =====================================================
INSERT INTO comments (movie_id, user_id, content, score) VALUES
(1, 1, '震撼人心的科幻大作！特效太棒了，剧情也很感人。', 10),
(1, 2, '刘德华和吴京的表演都很出色，值得二刷！', 9),
(2, 1, '吴京的动作戏真的太燃了，国产动作片的巅峰之作！', 8),
(3, 3, '向志愿军战士致敬，看哭了好几次。', 9),
(4, 2, '香港电影的经典之作，无法超越的神作。', 10),
(5, 1, '笑点很多，沈腾真的太搞笑了！', 8),
(8, 3, '周冬雨和易烊千玺的表演太催泪了。', 9);

-- =====================================================
-- 插入测试收藏数据
-- =====================================================
INSERT INTO user_favorites (user_id, movie_id) VALUES
(1, 1), (1, 4), (1, 8),
(2, 1), (2, 2), (2, 3),
(3, 5), (3, 6);

-- =====================================================
-- 验证数据
-- =====================================================
SELECT '=== 数据库初始化完成 ===' AS message;
SELECT CONCAT('用户数量: ', COUNT(*)) AS info FROM users;
SELECT CONCAT('电影数量: ', COUNT(*)) AS info FROM movies;
SELECT CONCAT('演员数量: ', COUNT(*)) AS info FROM actors;
SELECT CONCAT('评论数量: ', COUNT(*)) AS info FROM comments;
SELECT CONCAT('收藏数量: ', COUNT(*)) AS info FROM user_favorites;
