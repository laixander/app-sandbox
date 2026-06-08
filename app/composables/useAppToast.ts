// ============================================================================
// Composable: useAppToast
// ============================================================================
// Provides a unified, type-safe interface for application-wide toast notifications.

export const useAppToast = () => {
    const toast = useToast()

    return {
        /**
         * Display a success notification
         */
        success: (title: string, description?: string) => {
            toast.add({
                title,
                description,
                color: 'primary',
                icon: 'i-lucide-check-circle'
            })
        },
        /**
         * Display an error notification
         */
        error: (title: string, description?: string) => {
            toast.add({
                title,
                description,
                color: 'error',
                icon: 'i-lucide-x-circle'
            })
        }
    }
}
