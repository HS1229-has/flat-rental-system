import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Success message passed from registration
  const successMessage = location.state?.message;

  // Validation functions
  const validateUsername = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Username is required';
    }
    if (trimmed.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (trimmed.length > 50) {
      return 'Username cannot exceed 50 characters';
    }
    return '';
  };

  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setIsRateLimited(false);

    // If field was already touched, re-validate to clear error
    if (touched[name]) {
      const err = name === 'username' ? validateUsername(value) : validatePassword(value);
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Blur handler
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const err =
      fieldName === 'username'
        ? validateUsername(formData.username)
        : validatePassword(formData.password);
    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsRateLimited(false);

    // Mark all as touched
    setTouched({ username: true, password: true });

    const uErr = validateUsername(formData.username);
    const pErr = validatePassword(formData.password);
    setFieldErrors({ username: uErr, password: pErr });

    if (uErr) {
      usernameRef.current?.focus();
      return;
    }
    if (pErr) {
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(formData.username.trim(), formData.password);
      // Redirect based on role
      switch (user.role) {
        case 'TENANT':
          navigate('/tenant/dashboard');
          break;
        case 'OWNER':
          navigate('/owner/dashboard');
          break;
        case 'ADMIN':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      if (err.status === 429) {
        setIsRateLimited(true);
        setError('Too many failed login attempts. For security reasons, please wait 5 minutes before trying again.');
      } else {
        // Generic friendly error preventing user enumeration
        setError(
          err.status === 401
            ? 'Invalid username or password. Please verify your credentials and try again.'
            : err.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        className="card glass-effect"
        style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              marginBottom: '1rem'
            }}
          >
            <User size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to LuxeFlats</p>
        </div>

        {/* Success alert redirected from registration */}
        {successMessage && !error && (
          <div
            role="status"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontSize: '0.875rem'
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Rate limit warning banner */}
        {isRateLimited && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}
          >
            <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                Account Temporarily Locked
              </strong>
              {error}
            </div>
          </div>
        )}

        {/* General error message */}
        {error && !isRateLimited && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              fontSize: '0.875rem'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username Field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="login-username" className="form-label">
              Username <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <User size={18} />
              </div>
              <input
                ref={usernameRef}
                id="login-username"
                type="text"
                name="username"
                autoComplete="username"
                className={`form-control ${touched.username && fieldErrors.username ? 'is-invalid' : ''}`}
                style={{
                  paddingLeft: '2.75rem',
                  borderColor: touched.username && fieldErrors.username ? 'var(--danger)' : undefined
                }}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                aria-invalid={Boolean(touched.username && fieldErrors.username)}
                aria-describedby={touched.username && fieldErrors.username ? 'login-username-error' : undefined}
                required
              />
            </div>
            {touched.username && fieldErrors.username && (
              <small
                id="login-username-error"
                role="alert"
                style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
              >
                {fieldErrors.username}
              </small>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label
              htmlFor="login-password"
              className="form-label"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>Password <span style={{ color: 'var(--danger)' }}>*</span></span>
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '1rem',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <Lock size={18} />
              </div>
              <input
                ref={passwordRef}
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                className={`form-control ${touched.password && fieldErrors.password ? 'is-invalid' : ''}`}
                style={{
                  paddingLeft: '2.75rem',
                  paddingRight: '2.75rem',
                  borderColor: touched.password && fieldErrors.password ? 'var(--danger)' : undefined
                }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                aria-invalid={Boolean(touched.password && fieldErrors.password)}
                aria-describedby={touched.password && fieldErrors.password ? 'login-password-error' : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '0.75rem',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <small
                id="login-password-error"
                role="alert"
                style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
              >
                {fieldErrors.password}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
            disabled={isLoading || isRateLimited}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
