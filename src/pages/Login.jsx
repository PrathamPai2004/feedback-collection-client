import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode]     = useState('login')   // 'login' | 'signup'
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const switchMode = (m) => { setMode(m); setError(''); setForm({ name: '', email: '', password: '', confirm: '' }) }

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim())             return setError('Name is required')
        if (form.password.length < 6)      return setError('Password must be at least 6 characters')
        if (form.password !== form.confirm) return setError('Passwords do not match')
        await register(form.name, form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || (mode === 'login' ? 'Login failed. Check your credentials.' : 'Sign up failed. Try again.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="login-bg">
      <div className="login-card glass">

        {/* ── Logo ── */}
        <div className="login-logo">
          <i className="fas fa-comment-dots" />
          <span>FeedbackFlow</span>
        </div>

        {/* ── Tab Toggle ── */}
        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            <i className="fas fa-sign-in-alt" /> Sign In
          </button>
          <button
            id="tab-signup"
            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            <i className="fas fa-user-plus" /> Sign Up
          </button>
        </div>

        {/* ── Heading ── */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {mode === 'login'
              ? 'Sign in to manage your feedback forms'
              : 'Join FeedbackFlow and start collecting insights'}
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle" /> {error}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={submit}>

          {mode === 'signup' && (
            <div className="field">
              <label>Full Name</label>
              <div className="input-wrap">
                <i className="fas fa-user" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handle}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email Address</label>
            <div className="input-wrap">
              <i className="fas fa-envelope" />
              <input
                id="auth-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                placeholder={mode === 'login' ? 'admin@feedbacksystem.com' : 'you@example.com'}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-wrap">
              <i className="fas fa-lock" />
              <input
                id="auth-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="field">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <i className="fas fa-lock" />
                <input
                  id="signup-confirm"
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handle}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            className="btn btn-primary btn-full"
            type="submit"
            disabled={loading}
            style={{ marginTop: '0.4rem' }}
          >
            {loading
              ? <><span className="spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : <><i className={`fas ${mode === 'login' ? 'fa-arrow-right' : 'fa-user-plus'}`} /> {mode === 'login' ? 'Sign In' : 'Create Account'}</>
            }
          </button>
        </form>

        {/* ── Footer hint ── */}
        {mode === 'login' && (
          <p style={{ marginTop: '1.2rem', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text3)' }}>
            Default admin: <strong style={{ color: 'var(--text2)' }}>admin@feedbacksystem.com</strong> / <strong style={{ color: 'var(--text2)' }}>Admin@123456</strong>
          </p>
        )}
      </div>
    </div>
  )
}
