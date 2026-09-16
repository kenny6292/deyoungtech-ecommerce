import Order from '../models/Order.js'

const providerHeaders = secret => ({ Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' })

export async function initializePaystack(order, callbackUrl) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('Paystack is not configured.')
  const response = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: providerHeaders(process.env.PAYSTACK_SECRET_KEY), body: JSON.stringify({ email: order.customer.email, amount: Math.round(order.total * 100), reference: order.reference, callback_url: callbackUrl }) })
  const data = await response.json()
  if (!response.ok || !data.status) throw new Error(data.message || 'Paystack initialization failed.')
  return data.data
}

export async function verifyPaystack(reference) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error('Paystack is not configured.')
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: providerHeaders(process.env.PAYSTACK_SECRET_KEY) })
  const data = await response.json()
  if (!response.ok || !data.status) throw new Error(data.message || 'Paystack verification failed.')
  return data.data
}

export async function initializeFlutterwave(order, redirectUrl) {
  if (!process.env.FLW_SECRET_KEY) throw new Error('Flutterwave is not configured.')
  const response = await fetch('https://api.flutterwave.com/v3/payments', { method: 'POST', headers: providerHeaders(process.env.FLW_SECRET_KEY), body: JSON.stringify({ tx_ref: order.reference, amount: order.total, currency: 'NGN', redirect_url: redirectUrl, customer: { email: order.customer.email, name: order.customer.name, phonenumber: order.customer.phone }, customizations: { title: 'DEYOUNGTECH Store', description: `Order ${order.reference}` } }) })
  const data = await response.json()
  if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Flutterwave initialization failed.')
  return data.data
}

export async function verifyFlutterwave(transactionId) {
  if (!process.env.FLW_SECRET_KEY) throw new Error('Flutterwave is not configured.')
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, { headers: providerHeaders(process.env.FLW_SECRET_KEY) })
  const data = await response.json()
  if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Flutterwave verification failed.')
  return data.data
}

export async function markPaid(reference) {
  return Order.findOneAndUpdate({ reference }, { paymentStatus: 'paid', orderStatus: 'processing' }, { new: true })
}
