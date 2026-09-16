import React, { useState } from 'react'
import api from '../services/api.js'

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async e => { e.preventDefault(); setError(''); setLoading(true); try { const data = mode === 'login' ? await api.login({ email: form.email, password: form.password }) : await api.register(form); localStorage.setItem('deyoungtech-token', data.token); localStorage.setItem('deyoungtech-user', JSON.stringify(data.user)); onLogin(data.user) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  return <section className="auth-page"><div className="auth-card"><p className="eyebrow">DEYOUNGTECH ACCOUNT</p><h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1><p>{mode === 'login' ? 'Sign in to manage your orders.' : 'Create an account for faster checkout and order tracking.'}</p><form onSubmit={submit}>{mode === 'register' && <label>Full name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>}<label>Email<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></label>{error && <p className="form-error">{error}</p>}<button className="button dark" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form><button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></div></section>
}
