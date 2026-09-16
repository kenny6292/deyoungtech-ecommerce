import { Router } from 'express'
import Product from '../models/Product.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { search = '', category } = req.query
    const filter = { isActive: true }
    if (category) filter.category = category
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, products })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, product })
  } catch (error) { res.status(500).json({ success: false, message: error.message }) }
})

export default router
