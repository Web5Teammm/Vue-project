import { ref, computed } from 'vue'

export function useUserProfile() {
    const userData = ref({
        nickname: 'Vue爱好者',
        status: '已登录'
    })

    const userInfo = computed(() => userData.value)
    const userName = computed(() => `用户 ${userData.value.nickname}`)

    const logout = () => {
        if (confirm('确定要退出登录吗？')) {
            alert('已退出登录')
        }
    }

    return {
        userInfo,
        userName,
        logout
    }
}