import 'dotenv/config'
import app, { connectDatabase } from './app.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  if (process.env.MONGODB_URI) await connectDatabase()
  else if (process.env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.')
  else console.warn('MONGODB_URI is not configured. Database routes will not work.')

  app.listen(PORT, () => console.log(`NEXORA API running on port ${PORT}`))
}

startServer().catch(error => {
  console.error('Server startup failed:', error)
  process.exit(1)
})
