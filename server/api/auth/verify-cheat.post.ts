export default defineEventHandler(async (event) => {
    const body = await readBody<{ code: string }>(event)
    const config = useRuntimeConfig()

    // Artificial delay to prevent brute-forcing
    await new Promise(resolve => setTimeout(resolve, 500))

    if (body.code && body.code === config.testCheatcode) {
        return {
            success: true,
            message: 'Cheatcode validiert'
        }
    }

    throw createError({
        statusCode: 401,
        message: 'Ungültiger Cheatcode'
    })
})
