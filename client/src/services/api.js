const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('deyoungtech-token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  products: (params = '') => request(`/products${params ? `?${params}` : ''}`),
  createOrder: payload => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  register: payload => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: payload => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  initializePaystack: reference => request('/payments/paystack/initialize', { method: 'POST', body: JSON.stringify({ reference }) }),
  initializeFlutterwave: reference => request('/payments/flutterwave/initialize', { method: 'POST', body: JSON.stringify({ reference }) }),
  verifyPaystack: reference => request(`/payments/paystack/verify/${encodeURIComponent(reference)}`),
  verifyFlutterwave: transactionId => request(`/payments/flutterwave/verify/${encodeURIComponent(transactionId)}`),
}

export default api
