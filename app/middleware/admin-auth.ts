export default defineNuxtRouteMiddleware((to, from) => {
    // Skip on server-side initial load if we want purely client-side or useCookie works on both
    const token = useCookie('admin_token')

    if (!token.value) {
        return navigateTo('/admin/login')
    }
})
