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
  </div>
  <div class="form-item">
    <label>密码</label>
      <input type="password" v-model="password" placeholder="请输入密码">
  </div>

    <!--登录按钮-->
    <button class="login-btn" @click="handleLogin">登录</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const username = ref('')
const password = ref('')
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
</script>

<style scoped>
.login-page {
  width:400px;
  margin:100px auto;
  padding:20px;
  background-color: rgb(174, 198, 219);
  text-align: center;
  justify-content: center;
  border-radius: 10px;
}
</style>
