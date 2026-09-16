import { Router } from 'express'
import Order from '../models/Order.js'
import { initializeFlutterwave, initializePaystack, markPaid, verifyFlutterwave, verifyPaystack } from '../services/payments.js'

const router = Router()

router.post('/paystack/initialize', async (req, res) => {
  try {
    const order = await Order.findOne({ reference: req.body.reference })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Order is already paid.' })
    const data = await initializePaystack(order, req.body.callbackUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/paystack`)
    res.json({ success: true, authorizationUrl: data.authorization_url, accessCode: data.access_code, reference: data.reference })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const payment = await verifyPaystack(req.params.reference)
    const order = await Order.findOne({ reference: req.params.reference })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    if (payment.status === 'success' && Number(payment.amount) === Math.round(order.total * 100) && payment.currency === 'NGN') await markPaid(order.reference)
    else await Order.updateOne({ reference: order.reference }, { paymentStatus: 'failed' })
    res.json({ success: payment.status === 'success', paymentStatus: payment.status, order: await Order.findOne({ reference: order.reference }) })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.post('/flutterwave/initialize', async (req, res) => {
  try {
    const order = await Order.findOne({ reference: req.body.reference })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    if (order.paymentStatus === 'paid') return res.status(400).json({ success: false, message: 'Order is already paid.' })
    const data = await initializeFlutterwave(order, req.body.redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/flutterwave`)
    res.json({ success: true, paymentLink: data.link, reference: order.reference })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

router.get('/flutterwave/verify/:transactionId', async (req, res) => {
  try {
    const payment = await verifyFlutterwave(req.params.transactionId)
    const reference = payment.tx_ref
    const order = await Order.findOne({ reference })
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
    if (payment.status === 'successful' && Number(payment.amount) === Number(order.total) && payment.currency === 'NGN') await markPaid(reference)
    else await Order.updateOne({ reference }, { paymentStatus: 'failed' })
    res.json({ success: payment.status === 'successful', paymentStatus: payment.status, order: await Order.findOne({ reference }) })
  } catch (error) { res.status(400).json({ success: false, message: error.message }) }
})

export default router
