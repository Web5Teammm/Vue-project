<template>
  <div class="login-page">
    <h2>欢迎回来</h2>
    <p>请登录您的账户</p>

    <!--输入框-->
  <div class="form-container">
    <div class="form-item">
      <label>用户名</label>
      <input type="text" v-model="username" placeholder="请输入用户名">
    </div>
  
    <div class="form-item">
    <label>密码</label>
      <input type="password" v-model="password" placeholder="请输入密码">
    </div>
  </div>

    <div class="extra-row">
      <label class="remember-label">
        <input type="checkbox" v-model="rememberMe">记住我</label>
      <a href="#" class="forgot-link" @click.prevent="handleForgot">忘记密码?</a>
     </div>

    <!--登录按钮-->
    <button class="login-btn" @click="handleLogin">登录</button>

    <!-- 立即注册 -->
    <p class="register-link">还没有账户?<a href="#" @click.prevent="goToRegister">立即注册</a></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const router = useRouter()
const userStore = useUserStore()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert('请输入用户名和密码')
    return
  }

  const result = await userStore.login({
    username: username.value,
    password: password.value,
  })

  if (result.success) {
    router.push({ name: 'Home' })
  } else {
    alert(result.message || '登录失败')
  }
}

// 忘记密码
const handleForgot = () => {
  alert('请联系管理员重置密码。')
}

const goToRegister = () => {
  router.push({ name: 'Register' })
}
</script>

<style scoped>
.login-page {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  padding: 40px 30px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: left; 
  box-sizing: border-box;
}
.login-page h2 {
  text-align: center; 
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8px;
}

.login-page p {
  text-align: center;
  font-size: 14px;
  color: #999999;
  margin-bottom: 30px;
}

.form-container {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333333;
  outline: none;
  transition: border-color 0.2s;
}

.form-item input:focus {
  border-color: #818cf8;
}

.form-item input::placeholder {
  color: #cccccc;
}

.extra-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
}

.remember-label {
  display: flex;
  align-items: center;
  color: #4b5563;
  cursor: pointer;
}

.remember-label input {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  cursor: pointer;
}

/* 忘记密码链接 */
.forgot-link {
  color: #818cf8;
  text-decoration: none;
  cursor: pointer;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%); /* 紫色渐变 */
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

/* 立即注册链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.register-link a {
  color: #818cf8;
  text-decoration: none;
  margin-left: 4px;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
