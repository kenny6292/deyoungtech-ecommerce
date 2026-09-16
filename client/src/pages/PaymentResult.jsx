import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, LoaderCircle } from 'lucide-react'
import api from '../services/api.js'

export default function PaymentResult({ provider, onDone }) {
  const [status, setStatus] = useState('checking')
  const [message, setMessage] = useState('Confirming your payment...')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    const value = provider === 'paystack' ? params.get('reference') : params.get('transaction_id')
    if (!value) {
      setStatus('failed')
      setMessage('Payment reference was not found.')
      return () => { active = false }
    }
    const verify = provider === 'paystack' ? api.verifyPaystack(value) : api.verifyFlutterwave(value)
    verify.then(data => {
      if (!active) return
      if (data.success && data.order?.paymentStatus === 'paid') {
        localStorage.removeItem('deyoungtech-cart')
        setStatus('success')
        setMessage(`Payment confirmed for order ${data.order.reference}.`)
        onDone?.()
      } else {
        setStatus('failed')
        setMessage('The payment could not be confirmed. Your cart has been kept so you can try again.')
      }
    }).catch(error => {
      if (!active) return
      setStatus('failed')
      setMessage(error.message || 'Payment verification failed.')
    })
    return () => { active = false }
  }, [provider, onDone])

  return <main className="checkout-page"><div className="success-card">
    {status === 'checking' && <LoaderCircle className="spin" size={48} />}
    {status === 'success' && <CheckCircle2 size={48} />}
    {status === 'failed' && <XCircle size={48} />}
    <p className="eyebrow">{status === 'checking' ? 'VERIFYING' : status === 'success' ? 'PAYMENT COMPLETE' : 'PAYMENT NOT CONFIRMED'}</p>
    <h1>{status === 'checking' ? 'Please wait…' : status === 'success' ? 'Thank you for your order.' : 'We could not confirm the payment.'}</h1>
    <p>{message}</p>
    <button className="button dark" onClick={() => { window.history.replaceState({}, '', '/'); window.location.reload() }}>{status === 'success' ? 'Continue shopping' : 'Return to store'}</button>
  </div></main>
}
