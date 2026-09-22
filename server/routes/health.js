import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()
router.get('/', (_req, res) => res.json({ success: true, service: 'NEXORA E-Commerce API', status: 'ok', uptime: Math.round(process.uptime()), database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', timestamp: new Date().toISOString() }))
export default router
