import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export function useFavorites() {
    const userStore = useUserStore()

    const favorites = computed(() => userStore.favorites)
    const isLoading = computed(() => false) // Store manages loading usually, or add loading state to store if needed
    const hasFavorites = computed(() => userStore.favorites.length > 0)

    // 获取收藏列表
    const fetchFavorites = async () => {
        await userStore.fetchFavorites()
    }

    // 取消收藏
    const removeFavorite = async (movieId) => {
        if (confirm('确定要取消收藏吗？')) {
            await userStore.toggleFavorite(movieId)
        }
    }

    onMounted(() => {
        if (userStore.isLoggedIn) {
            fetchFavorites()
        }
    })

    return {
        favorites,
        isLoading,
        hasFavorites,
        removeFavorite,
        fetchFavorites
    }
}