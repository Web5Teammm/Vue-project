import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

export function useComments() {
    const userStore = useUserStore()

    const comments = computed(() => userStore.comments)
    const isLoading = computed(() => false)
    const hasComments = computed(() => userStore.comments.length > 0)

    // 获取评论列表
    const fetchComments = async () => {
        await userStore.fetchUserComments()
    }

    // 删除评论
    const deleteComment = async (commentId) => {
        if (confirm('确定要删除这条评论吗？')) {
            await userStore.deleteUserComment(commentId)
        }
    }

    onMounted(() => {
        if (userStore.isLoggedIn) {
            fetchComments()
        }
    })

    return {
        comments,
        isLoading,
        hasComments,
        deleteComment,
        fetchComments
    }
}