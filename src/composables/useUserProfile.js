import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function useUserProfile() {
    const router = useRouter()
    const userStore = useUserStore()

    const userInfo = computed(() => ({
        nickname: userStore.user?.nickname || userStore.user?.phone || '用户',
        status: userStore.isLoggedIn ? '已登录' : '未登录'
    }))
    
    const userName = computed(() => {
        const user = userStore.user
        if (user) {
            return user.nickname || user.phone || '用户'
        }
        return '用户'
    })

    const logout = () => {
        if (confirm('确定要退出登录吗？')) {
            userStore.logout()
            router.push({ name: 'Home' })
        }
    }

    return {
        userInfo,
        userName,
        logout
    }
}