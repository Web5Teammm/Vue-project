import { ref, onMounted, computed } from 'vue'

export function useFavorites() {
    const favorites = ref([])
    const isLoading = ref(true)

    const hasFavorites = computed(() => favorites.value.length > 0)

    // 获取收藏列表（与首页收藏功能对接）
    const fetchFavorites = async () => {
        isLoading.value = true
        try {
            const stored = localStorage.getItem('userFavorites')
            favorites.value = stored ? JSON.parse(stored) : []
        } finally {
            isLoading.value = false
        }
    }

    // 取消收藏（与首页收藏功能对接）
    const removeFavorite = (movieId) => {
        if (confirm('确定要取消收藏吗？')) {
            favorites.value = favorites.value.filter(movie => movie.id !== movieId)
            localStorage.setItem('userFavorites', JSON.stringify(favorites.value))
        }
    }

    onMounted(() => {
        fetchFavorites()
    })

    return {
        favorites,
        isLoading,
        hasFavorites,
        removeFavorite,
        fetchFavorites
    }
}