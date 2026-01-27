// Vercel Postgres - Example usage
// import { sql } from '@vercel/postgres'
//
// export default eventHandler(async () => {
//   const { rows } = await sql`SELECT * FROM users`
//   return rows
// })

// Vercel Blob - Example usage
// import { put } from '@vercel/blob'
//
// export default eventHandler(async (event) => {
//   const formData = await readFormData(event)
//   const file = formData.get('file') as File
//   const blob = await put(file.name, file, { access: 'public' })
//   return blob
// })

// Vercel KV - Example usage
// import { kv } from '@vercel/kv'
//
// export default eventHandler(async () => {
//   await kv.set('key', 'value')
//   const value = await kv.get('key')
//   return { value }
// })

export default eventHandler(() => {
    return { message: 'Hello from Nuxt API!' }
})
