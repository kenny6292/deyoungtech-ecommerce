import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const secret = process.env.JWT_SECRET || 'development-only-secret-change-me'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password || password.length < 6) return res.status(400).json({ success: false, message: 'Name, valid email and password of at least 6 characters are required.' })
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' })
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' })
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

export default router
