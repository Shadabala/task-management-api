import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Mail, Lock, User, UserPlus, CheckSquare } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate      = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await register(form)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/dashboard')
    } catch (err) {
      const res = err.response
      if (res?.status === 422) {
        setErrors(res.data.errors || {})
      } else {
        toast.error(res?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">
            <CheckSquare size={28} color="white" />
          </div>
          <h1>TaskFlow</h1>
          <p>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={16} />
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Shadab Alam"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            {errors.name && <p className="form-error">{errors.name[0]}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && <p className="form-error">{errors.email[0]}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="password"
                name="password"
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
            {errors.password && <p className="form-error">{errors.password[0]}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                className={`form-input ${errors.password_confirmation ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
            {errors.password_confirmation && (
              <p className="form-error">{errors.password_confirmation[0]}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '8px' }}
          >
            {loading
              ? <><span className="btn-spinner" /> Creating account…</>
              : <><UserPlus size={17} /> Create Account</>
            }
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
