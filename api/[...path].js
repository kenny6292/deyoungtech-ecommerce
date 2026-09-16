import app, { connectDatabase } from '../server/app.js'

export default async function handler(req, res) {
  try {
    await connectDatabase()
    if (!req.url.startsWith('/api')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`
    return app(req, res)
  } catch (error) {
    console.error('API request failed:', error)
    return res.status(500).json({ success: false, message: 'API unavailable.' })
  }
}
