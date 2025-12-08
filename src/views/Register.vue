<template>
  <div class="register">
    <h2>新用户注册</h2>
    <p>创建您的账户</p>

  <div class="form-container">
      <!--用户名-->
      <div class="form-item">
      <label>用户名</label>
        <input type="text" v-model="username" placeholder="请输入用户名">
      </div>
      <!--密码 -->
      <div class="form-item">
        <label>密码</label>
        <input type="password" v-model="password" placeholder="请输入密码">
      </div>
      <!--确认密码-->
      <div class="form-item">
        <label>确认密码</label>
        <input type="password" v-model="confirmPwd" placeholder="请再次输入密码">
      </div>
  </div>

  <button class="register-btn" @click="handleRegister">注册</button>
    <p class="login-link" @click="goToLogin">已有账户？去登录</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' 

const username = ref('') 
const password = ref('') 
const confirmPwd = ref('') 

const router = useRouter()
const userStore = useUserStore()

const handleRegister = async () => {
  if (!username.value || !password.value) {
    alert('用户名和密码不能为空！')
    return
  }
  if (password.value !== confirmPwd.value) {
    alert('两次输入的密码不一致！')
    return
  }

  const result = await userStore.register({
    username: username.value,
    password: password.value,
    confirmPwd: confirmPwd.value
  })

  if (result.success) {
    alert('注册成功！即将跳转到登录页')
    router.push({ name: 'Login' }) 
  } else {
    alert(result.message || '注册失败')
  }
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}
</script>


<style scoped>
.register {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  padding: 40px 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  text-align: left;
}

.register h2 {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.register p:first-of-type {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 30px;
}

.form-container {
  width: 100%;
  margin-bottom: 20px;
}

.form-item {
  width: 100%;
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-item input:focus {
  border-color: #818cf8;
}

.register-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 16px;
}

.register-btn:hover {
  opacity: 0.9;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #818cf8;
  cursor: pointer;
  margin: 0;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
