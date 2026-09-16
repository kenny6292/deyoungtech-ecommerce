import jwt from 'jsonwebtoken'

const getSecret = () => {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is required in production.')
  return process.env.JWT_SECRET || 'development-only-secret-change-me'
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' })
  try { req.user = jwt.verify(token, getSecret()); next() }
  catch { res.status(401).json({ success: false, message: 'Invalid or expired token.' }) }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required.' })
  next()
}
