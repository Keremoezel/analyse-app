interface LoginBody {
    password: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event)
    const config = useRuntimeConfig()

    // Compare provided password with env variable
    if (body.password === config.adminPassword) {
        return {
            success: true,
        }
    }

    // Artificial delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500))

    throw createError({
        statusCode: 401,
        message: 'Falsches Passwort'
    })
})
