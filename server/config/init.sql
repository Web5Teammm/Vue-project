-- 创建数据库
CREATE DATABASE IF NOT EXISTS movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE movie_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) DEFAULT '用户',
  avatar VARCHAR(255) DEFAULT '/assets/images/default-avatar.jpg',
  register_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 电影表
CREATE TABLE IF NOT EXISTS movies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(100),
  score DECIMAL(3,1) DEFAULT 0.0,
  status VARCHAR(50) DEFAULT '全片',
  cover VARCHAR(255),
  release_time DATE,
  duration VARCHAR(50),
  director VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  INDEX idx_type (type),
  INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 演员表
CREATE TABLE IF NOT EXISTS actors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  birth DATE,
  birth_place VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 电影-演员关联表
CREATE TABLE IF NOT EXISTS movie_actors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  actor_id INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_actor (movie_id, actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 精彩片段表
CREATE TABLE IF NOT EXISTS clips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  thumbnail VARCHAR(255),
  duration INT DEFAULT 0 COMMENT '片段时长（秒）',
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_movie_id (movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_movie (user_id, movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_movie_id (movie_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 轮播图表
CREATE TABLE IF NOT EXISTS carousels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  title VARCHAR(200),
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_sort (sort_order, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始数据
INSERT INTO movies (title, type, score, status, cover, release_time, duration, director, description) VALUES
('流浪地球2', '科幻/冒险', 9.4, '全1集', '/covers/film1.jpeg', '2023-01-22', '173分钟', '郭帆', '太阳危机即将来袭，人类开启"流浪地球计划"，建造万座行星发动机推动地球离开太阳系。'),
('战狼2', '动作/战争', 7.1, '全片', '/covers/film2.jpeg', '2017-07-27', '123分钟', '吴京', '冷锋在非洲国家叛乱期间，与当地华侨和非洲人民一起展开救援行动。'),
('长津湖', '历史/战争', 7.4, '全片', '/covers/film3.jpeg', '2021-09-30', '176分钟', '陈凯歌', '抗美援朝战争中，中国人民志愿军第9兵团在长津湖地区与美军展开的殊死搏斗。'),
('无间道', '犯罪/悬疑', 9.3, '全片', '/covers/film4.jpeg', '2002-12-12', '101分钟', '刘伟强', '两个身份混乱的男人分别为警方和黑社会的卧底，经过一场激烈的角斗，他们决心要寻回自己。'),
('夏洛特烦恼', '喜剧/爱情', 7.8, '全片', '/covers/film5.jpeg', '2015-09-30', '104分钟', '闫非', '夏洛在大闹初恋婚礼后意外重返青春并最终领悟人生、找回真爱的故事。'),
('疯狂的外星人', '喜剧/科幻', 6.4, '全片', '/covers/film6.jpeg', '2019-02-05', '116分钟', '宁浩', '耿浩与好友大飞经营着各自惨淡的"事业"，然而"天外来客"的意外降临，打破了二人平静又拮据的生活。'),
('送你一朵小红花', '剧情/家庭', 7.2, '全片', '/covers/film7.jpeg', '2020-12-31', '128分钟', '韩延', '两个抗癌家庭，两组生活轨迹。影片讲述了一个温情的现实故事，思考和直面了每一个普通人都会面临的终极问题。'),
('少年的你', '剧情/犯罪', 8.2, '全片', '/covers/film8.jpeg', '2019-10-25', '135分钟', '曾国祥', '一场高考前夕的校园意外，改变了两个少年的命运。');

INSERT INTO actors (name, avatar, bio, birth, birth_place) VALUES
('吴京', '/assets/images/actor-wujing.jpg', '中国内地男演员、导演，代表中国硬核动作电影形象，多次出演主旋律与商业大片。', '1974-04-03', '北京'),
('刘德华', '/assets/images/actor-liudehua.jpg', '华语影坛最具影响力的演员之一，涉猎警匪、文艺、商业片等多个类型。', '1961-09-27', '香港'),
('沈腾', '/assets/images/actor-shenteng.jpg', '中国内地喜剧演员，开心麻花核心成员，擅长现实讽刺喜剧。', '1979-10-23', '黑龙江'),
('易烊千玺', '/assets/images/actor-yiyangqianxi.jpg', '中国内地流行歌手、舞者、演员，TFBOYS成员。', '2000-11-28', '湖南');

INSERT INTO movie_actors (movie_id, actor_id) VALUES
(1, 1), (1, 2),
(2, 1),
(3, 1),
(4, 2),
(5, 3),
(6, 3),
(7, 4),
(8, 4);

INSERT INTO clips (movie_id, title, video_url, thumbnail, duration, description, sort_order) VALUES
(1, '流浪地球2 - 预告片', '/videos/clip1.mp4', '/covers/film1.jpeg', 120, '流浪地球2精彩预告', 1),
(1, '流浪地球2 - 太空电梯片段', '/videos/clip2.mp4', '/covers/film1.jpeg', 180, '震撼的太空电梯场景', 2),
(1, '流浪地球2 - 月球危机', '/videos/clip3.mp4', '/covers/film1.jpeg', 150, '月球危机精彩片段', 3),
(2, '战狼2 - 坦克大战', '/videos/clip4.mp4', '/covers/film2.jpeg', 200, '激烈的坦克大战场景', 1),
(2, '战狼2 - 水下搏斗', '/videos/clip5.mp4', '/covers/film2.jpeg', 180, '精彩的水下搏斗', 2);

INSERT INTO carousels (movie_id, image_url, title, sort_order, is_active) VALUES
(1, '/covers/film1.jpeg', '流浪地球2', 1, 1),
(2, '/covers/film2.jpeg', '战狼2', 2, 1),
(3, '/covers/film3.jpeg', '长津湖', 3, 1),
(4, '/covers/film4.jpeg', '无间道', 4, 1);

