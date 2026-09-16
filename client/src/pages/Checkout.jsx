import React, { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, CreditCard, Truck, Tag, ShieldCheck } from 'lucide-react'
import api from '../services/api'

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })

export default function Checkout({ cart, onBack, onComplete }) {
  const savedUser = JSON.parse(localStorage.getItem('deyoungtech-user') || 'null')
  const [form, setForm] = useState({ name: savedUser?.name || '', email: savedUser?.email || '', phone: savedUser?.phone || '', address: '', city: '', state: '' })
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(''); const [order, setOrder] = useState(null)
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const discount = coupon?.discount || 0
  const shippingFee = subtotal - discount >= 100000 ? 0 : 5000
  const total = Math.max(0, subtotal - discount + shippingFee)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true); setError('')
    try { setCoupon(await api.validateCoupon(couponCode, subtotal)) }
    catch (err) { setCoupon(null); setError(err.message) }
    finally { setCouponLoading(false) }
  }

  const submit = async e => {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      const data = await api.createOrder({ customer: { name: form.name, email: form.email, phone: form.phone }, shippingAddress: { address: form.address, city: form.city, state: form.state, country: 'Nigeria' }, items: cart.map(item => ({ product: item._id || item.id, name: item.name, quantity: item.quantity })), paymentMethod, couponCode: coupon?.code || '' })
      if (paymentMethod === 'cash_on_delivery') { setOrder(data.order); onComplete?.(data.order); return }
      const payment = paymentMethod === 'paystack' ? await api.initializePaystack(data.order.reference) : await api.initializeFlutterwave(data.order.reference)
      window.location.href = payment.authorizationUrl || payment.paymentLink
    } catch (err) { setError(err.message); setSubmitting(false) }
  }

  if (order) return <section className="checkout-page"><div className="success-card"><CheckCircle2 size={52}/><p className="eyebrow">ORDER RECEIVED</p><h1>Thank you for your order.</h1><p>Your reference is <strong>{order.reference}</strong>.</p><p>Your cash-on-delivery order has been received and will be processed shortly.</p><button className="button dark" onClick={onBack}>Continue shopping</button></div></section>

  return <section className="checkout-page"><button className="back-link" onClick={onBack}><ArrowLeft size={17}/> Back to shopping</button><div className="checkout-layout"><form className="checkout-form" onSubmit={submit}><p className="eyebrow">SECURE CHECKOUT</p><h1>Complete your order</h1><div className="form-grid"><label>Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label><label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label><label>Phone<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label><label>Address<input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></label><label>City<input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/></label><label>State<input required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}/></label></div><div className="coupon-box"><h3><Tag size={17}/> Discount code</h3><div className="coupon-row"><input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code"/><button type="button" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? 'Checking...' : 'Apply'}</button></div>{coupon && <p className="coupon-success">{coupon.code} applied — you save {money.format(coupon.discount)}.</p>}</div><div className="payment-options"><h3>Payment method</h3><label><input type="radio" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')}/><CreditCard size={18}/> Paystack</label><label><input type="radio" checked={paymentMethod === 'flutterwave'} onChange={() => setPaymentMethod('flutterwave')}/><CreditCard size={18}/> Flutterwave</label><label><input type="radio" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')}/><Truck size={18}/> Cash on delivery</label></div>{error && <p className="form-error">{error}</p>}<div className="checkout-security"><ShieldCheck size={18}/><span>Your payment is processed securely. We never store your card details.</span></div><button className="button dark checkout-submit" disabled={submitting || !cart.length}>{submitting ? 'Processing...' : paymentMethod === 'cash_on_delivery' ? 'Place order' : `Continue to payment · ${money.format(total)}`}</button></form><aside className="checkout-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Your order</h2>{cart.map(item => <div className="summary-item" key={item.id || item._id}><span>{item.name} × {item.quantity}</span><strong>{money.format(item.price * item.quantity)}</strong></div>)}<div className="summary-total"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>{discount > 0 && <div className="summary-total"><span>Discount</span><strong>-{money.format(discount)}</strong></div>}<div className="summary-total"><span>Shipping</span><strong>{shippingFee ? money.format(shippingFee) : 'Free'}</strong></div><div className="summary-grand"><span>Total</span><strong>{money.format(total)}</strong></div></aside></div></section>
}
