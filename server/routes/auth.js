import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const getSecret = () => {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production.')
  return process.env.JWT_SECRET || 'development-only-secret-change-me'
}
const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone || '', avatar: user.avatar || '' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '' } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (!name || !normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !password || password.length < 6) return res.status(400).json({ success: false, message: 'Name, valid email and password of at least 6 characters are required.' })
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: String(phone).trim(), passwordHash: await bcrypt.hash(password, 12) })
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, getSecret(), { expiresIn: '7d' })
    res.status(201).json({ success: true, token, user: publicUser(user) })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, getSecret(), { expiresIn: '7d' })
    res.json({ success: true, token, user: publicUser(user) })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

export default router
