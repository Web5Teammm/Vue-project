import { ref, onMounted, computed } from 'vue'

export function useComments() {
    const comments = ref([])
    const isLoading = ref(true)

    const hasComments = computed(() => comments.value.length > 0)

    // 获取评论列表（与影视详情页评论功能对接）
    const fetchComments = async () => {
        isLoading.value = true
        try {
            const stored = localStorage.getItem('userComments')
            comments.value = stored ? JSON.parse(stored) : []
        } finally {
            isLoading.value = false
        }
    }

    // 删除评论
    const deleteComment = (commentId) => {
        if (confirm('确定要删除这条评论吗？')) {
            comments.value = comments.value.filter(comment => comment.id !== commentId)
            localStorage.setItem('userComments', JSON.stringify(comments.value))
        }
    }

    onMounted(() => {
        fetchComments()
    })

    return {
        comments,
        isLoading,
        hasComments,
        deleteComment,
        fetchComments
    }
}
