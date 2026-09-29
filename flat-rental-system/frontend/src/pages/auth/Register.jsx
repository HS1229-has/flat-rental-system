import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosConfig';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'TENANT'
  });

  const [touched, setTouched] = useState({
    username: false,
    fullName: false,
    email: false,
    password: false,
    phoneNumber: false
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Username availability state: 'idle' | 'checking' | 'available' | 'taken' | 'error'
  const [usernameAvailability, setUsernameAvailability] = useState({
    status: 'idle',
    message: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Field refs for auto-focusing the first invalid field on submit
  const usernameRef = useRef(null);
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);
  const checkUsernameTimerRef = useRef(null);
  const checkUsernameAbortRef = useRef(0);

  // Helper to normalize phone
  const cleanPhone = (val) => {
    if (!val) return '';
    let digits = val.replace(/[\s\-+]/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.substring(2);
    }
    return digits;
  };

  // --- Field Validation Functions ---
  const validateUsername = useCallback((val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Username is required';
    }
    if (trimmed.length < 3 || trimmed.length > 30) {
      return 'Username must be between 3 and 30 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  }, []);

  const validateFullName = useCallback((val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Full Name is required';
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      return 'Full Name must be between 2 and 50 characters';
    }
    // Disallow HTML/scripts/tags
    if (/[<>{}]/.test(trimmed)) {
      return 'Full Name contains invalid characters';
    }
    // Allow unicode letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\u00C0-\u017F\s'-]+$/.test(trimmed)) {
      return 'Full Name must only contain letters, spaces, hyphens, or apostrophes';
    }
    return '';
  }, []);

  const validateEmail = useCallback((val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Email address is required';
    }
    if (trimmed.length > 100) {
      return 'Email address cannot exceed 100 characters';
    }
    // RFC 5322 compliant regex avoiding consecutive dots
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed) || trimmed.includes('..')) {
      return 'Please enter a valid email address (e.g. name@domain.com)';
    }
    return '';
  }, []);

  const validatePassword = useCallback((val) => {
    if (!val) {
      return 'Password is required';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (val.length > 100) {
      return 'Password cannot exceed 100 characters';
    }
    return '';
  }, []);

  const validatePhone = useCallback((val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Phone number is required';
    }
    const digits = cleanPhone(trimmed);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return 'Must be a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)';
    }
    return '';
  }, []);

  // Compute password strength score (0 to 4)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 6) {
      return { score: 1, label: 'Too short (min 6)', color: '#ef4444' };
    }
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (strength === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (strength === 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong', color: '#10b981' };
  };

  // Perform backend check for username availability
  const checkUsernameOnServer = useCallback(async (username) => {
    const trimmed = (username || '').trim();
    if (validateUsername(trimmed)) {
      setUsernameAvailability({ status: 'idle', message: '' });
      return;
    }

    const currentCallId = ++checkUsernameAbortRef.current;
    setUsernameAvailability({ status: 'checking', message: 'Checking availability...' });

    try {
      const res = await api.get('/auth/check-username', { params: { username: trimmed } });
      if (checkUsernameAbortRef.current !== currentCallId) return; // Stale request

      if (res.data && res.data.available) {
        setUsernameAvailability({ status: 'available', message: 'Username is available' });
        setFieldErrors((prev) => {
          if (prev.username === 'Username is already taken') {
            return { ...prev, username: '' };
          }
          return prev;
        });
      } else {
        setUsernameAvailability({ status: 'taken', message: 'Username is already taken' });
        setFieldErrors((prev) => ({ ...prev, username: 'Username is already taken' }));
      }
    } catch (err) {
      if (checkUsernameAbortRef.current !== currentCallId) return;
      if (err.response?.status === 400) {
        setUsernameAvailability({ status: 'idle', message: '' });
      } else {
        // Fallback gracefully without blocking submission if check endpoint is unavailable
        setUsernameAvailability({ status: 'error', message: 'Could not verify username' });
      }
    }
  }, [validateUsername]);

  // Debounce username availability check on change
  useEffect(() => {
    if (checkUsernameTimerRef.current) {
      clearTimeout(checkUsernameTimerRef.current);
    }

    const trimmed = formData.username.trim();
    if (!trimmed || validateUsername(trimmed)) {
      setUsernameAvailability({ status: 'idle', message: '' });
      return;
    }

    checkUsernameTimerRef.current = setTimeout(() => {
      checkUsernameOnServer(trimmed);
    }, 450);

    return () => {
      if (checkUsernameTimerRef.current) {
        clearTimeout(checkUsernameTimerRef.current);
      }
    };
  }, [formData.username, validateUsername, checkUsernameOnServer]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');

    // If field was already touched, validate dynamically to clear error
    if (touched[name]) {
      let err = '';
      if (name === 'username') err = validateUsername(value);
      else if (name === 'fullName') err = validateFullName(value);
      else if (name === 'email') err = validateEmail(value);
      else if (name === 'password') err = validatePassword(value);
      else if (name === 'phoneNumber') err = validatePhone(value);

      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // Handle Blur - marks touched and executes immediate validation
  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    let err = '';
    const val = formData[fieldName];

    switch (fieldName) {
      case 'username':
        err = validateUsername(val);
        if (!err && usernameAvailability.status === 'taken') {
          err = 'Username is already taken';
        } else if (!err && usernameAvailability.status === 'idle') {
          checkUsernameOnServer(val);
        }
        break;
      case 'fullName':
        err = validateFullName(val);
        break;
      case 'email':
        err = validateEmail(val);
        break;
      case 'password':
        err = validatePassword(val);
        break;
      case 'phoneNumber':
        err = validatePhone(val);
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  // Validate entire form and collect errors
  const validateAll = () => {
    const errors = {
      username: validateUsername(formData.username),
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      phoneNumber: validatePhone(formData.phoneNumber)
    };

    if (!errors.username && usernameAvailability.status === 'taken') {
      errors.username = 'Username is already taken';
    }

    setFieldErrors(errors);
    return errors;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Mark all as touched
    setTouched({
      username: true,
      fullName: true,
      email: true,
      password: true,
      phoneNumber: true
    });

    const errors = validateAll();
    const hasError = Object.values(errors).some((err) => !!err);

    if (hasError) {
      setError('Please resolve all validation errors before proceeding.');
      // Auto-focus first invalid input
      if (errors.username) usernameRef.current?.focus();
      else if (errors.fullName) fullNameRef.current?.focus();
      else if (errors.email) emailRef.current?.focus();
      else if (errors.password) passwordRef.current?.focus();
      else if (errors.phoneNumber) phoneRef.current?.focus();
      return;
    }

    if (usernameAvailability.status === 'checking') {
      setError('Verifying username availability. Please wait a moment...');
      return;
    }

    setIsLoading(true);

    try {
      const canonicalPhone = cleanPhone(formData.phoneNumber.trim());
      await register({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: canonicalPhone,
        role: formData.role
      });

      navigate('/login', {
        state: { message: 'Account created successfully! Please sign in with your credentials.' }
      });
    } catch (err) {
      // Map API validation errors if provided by GlobalExceptionHandler
      if (err.details && Array.isArray(err.details) && err.details.length > 0) {
        const backendErrors = {};
        err.details.forEach((msg) => {
          const lower = msg.toLowerCase();
          if (lower.includes('username')) backendErrors.username = msg;
          else if (lower.includes('name')) backendErrors.fullName = msg;
          else if (lower.includes('email')) backendErrors.email = msg;
          else if (lower.includes('password')) backendErrors.password = msg;
          else if (lower.includes('phone')) backendErrors.phoneNumber = msg;
        });

        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...backendErrors }));
        }
        setError(err.message || 'Registration failed. Please check the fields below.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation for accessible radiogroup
  const handleRoleKeyDown = (e, targetRole) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, role: targetRole }));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, role: 'OWNER' }));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFormData((prev) => ({ ...prev, role: 'TENANT' }));
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
        style={{ maxWidth: '640px', width: '100%', padding: '2.5rem' }}
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
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Create an Account
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Join LuxeFlats to find or rent verified properties
          </p>
        </div>

        {error && (
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
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Username & Full Name Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.25rem'
            }}
          >
            {/* Username Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="register-username" className="form-label">
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
                  id="register-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  className={`form-control ${touched.username && fieldErrors.username ? 'is-invalid' : ''}`}
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: '2.75rem',
                    borderColor:
                      touched.username && fieldErrors.username
                        ? 'var(--danger)'
                        : usernameAvailability.status === 'available'
                        ? '#10b981'
                        : undefined
                  }}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={() => handleBlur('username')}
                  aria-invalid={Boolean(touched.username && fieldErrors.username)}
                  aria-describedby={
                    touched.username && fieldErrors.username ? 'username-error' : 'username-status'
                  }
                  required
                />
                {/* Username availability indicator icon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '1rem',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  {usernameAvailability.status === 'checking' && (
                    <Loader2 size={18} className="spin-animation" style={{ color: 'var(--primary)' }} />
                  )}
                  {usernameAvailability.status === 'available' && !fieldErrors.username && (
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                  )}
                  {touched.username && fieldErrors.username && (
                    <XCircle size={18} style={{ color: 'var(--danger)' }} />
                  )}
                </div>
              </div>

              {/* Status / Error Messages */}
              {touched.username && fieldErrors.username ? (
                <small
                  id="username-error"
                  role="alert"
                  style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
                >
                  {fieldErrors.username}
                </small>
              ) : usernameAvailability.status === 'available' && formData.username.trim().length >= 3 ? (
                <small
                  id="username-status"
                  style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
                >
                  <CheckCircle2 size={12} /> {usernameAvailability.message}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  3-30 characters (letters, numbers, underscores)
                </small>
              )}
            </div>

            {/* Full Name Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="register-fullname" className="form-label">
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
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
                  ref={fullNameRef}
                  id="register-fullname"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  className={`form-control ${touched.fullName && fieldErrors.fullName ? 'is-invalid' : ''}`}
                  style={{
                    paddingLeft: '2.75rem',
                    borderColor: touched.fullName && fieldErrors.fullName ? 'var(--danger)' : undefined
                  }}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  aria-invalid={Boolean(touched.fullName && fieldErrors.fullName)}
                  aria-describedby={touched.fullName && fieldErrors.fullName ? 'fullname-error' : undefined}
                  required
                />
              </div>
              {touched.fullName && fieldErrors.fullName ? (
                <small
                  id="fullname-error"
                  role="alert"
                  style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
                >
                  {fieldErrors.fullName}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Your official name (letters and spaces only)
                </small>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="register-email" className="form-label">
              Email Address <span style={{ color: 'var(--danger)' }}>*</span>
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
                <Mail size={18} />
              </div>
              <input
                ref={emailRef}
                id="register-email"
                type="email"
                name="email"
                autoComplete="email"
                className={`form-control ${touched.email && fieldErrors.email ? 'is-invalid' : ''}`}
                style={{
                  paddingLeft: '2.75rem',
                  borderColor: touched.email && fieldErrors.email ? 'var(--danger)' : undefined
                }}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                aria-invalid={Boolean(touched.email && fieldErrors.email)}
                aria-describedby={touched.email && fieldErrors.email ? 'email-error' : undefined}
                required
              />
            </div>
            {touched.email && fieldErrors.email && (
              <small
                id="email-error"
                role="alert"
                style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
              >
                {fieldErrors.email}
              </small>
            )}
          </div>

          {/* Password & Phone Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.25rem'
            }}
          >
            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="register-password" className="form-label">
                Password <span style={{ color: 'var(--danger)' }}>*</span>
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
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  className={`form-control ${touched.password && fieldErrors.password ? 'is-invalid' : ''}`}
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: '2.75rem',
                    borderColor: touched.password && fieldErrors.password ? 'var(--danger)' : undefined
                  }}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  aria-invalid={Boolean(touched.password && fieldErrors.password)}
                  aria-describedby="password-feedback"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      height: '4px',
                      borderRadius: '2px',
                      backgroundColor: 'var(--border-color)',
                      overflow: 'hidden',
                      gap: '3px'
                    }}
                  >
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          flex: 1,
                          backgroundColor:
                            passwordStrength.score >= step ? passwordStrength.color : 'transparent',
                          transition: 'background-color 0.25s ease'
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: '600' }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {touched.password && fieldErrors.password && (
                <small
                  id="password-feedback"
                  role="alert"
                  style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
                >
                  {fieldErrors.password}
                </small>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="register-phone" className="form-label">
                Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
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
                  <Phone size={18} />
                </div>
                <input
                  ref={phoneRef}
                  id="register-phone"
                  type="tel"
                  name="phoneNumber"
                  autoComplete="tel"
                  className={`form-control ${touched.phoneNumber && fieldErrors.phoneNumber ? 'is-invalid' : ''}`}
                  style={{
                    paddingLeft: '2.75rem',
                    borderColor: touched.phoneNumber && fieldErrors.phoneNumber ? 'var(--danger)' : undefined
                  }}
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phoneNumber')}
                  aria-invalid={Boolean(touched.phoneNumber && fieldErrors.phoneNumber)}
                  aria-describedby={touched.phoneNumber && fieldErrors.phoneNumber ? 'phone-error' : undefined}
                  required
                />
              </div>
              {touched.phoneNumber && fieldErrors.phoneNumber ? (
                <small
                  id="phone-error"
                  role="alert"
                  style={{ color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}
                >
                  {fieldErrors.phoneNumber}
                </small>
              ) : (
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  10-digit Indian mobile number
                </small>
              )}
            </div>
          </div>

          {/* Role Selection (Radiogroup) */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" id="role-group-label">
              I want to... <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div
              role="radiogroup"
              aria-labelledby="role-group-label"
              style={{ display: 'flex', gap: '1rem' }}
            >
              {/* Tenant Option */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={formData.role === 'TENANT'}
                onClick={() => setFormData({ ...formData, role: 'TENANT' })}
                onKeyDown={(e) => handleRoleKeyDown(e, 'TENANT')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  border:
                    formData.role === 'TENANT'
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  flex: 1,
                  backgroundColor:
                    formData.role === 'TENANT' ? 'var(--primary-light)' : 'var(--bg-card)',
                  transition: 'var(--transition)',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border:
                      formData.role === 'TENANT'
                        ? '2px solid var(--primary)'
                        : '2px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: formData.role === 'TENANT' ? 'var(--primary)' : 'transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {formData.role === 'TENANT' && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  )}
                </div>
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: formData.role === 'TENANT' ? '700' : '600',
                      color: formData.role === 'TENANT' ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.925rem'
                    }}
                  >
                    Rent a property
                  </span>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Looking for a home (Tenant)
                  </span>
                </div>
              </div>

              {/* Owner Option */}
              <div
                role="radio"
                tabIndex={0}
                aria-checked={formData.role === 'OWNER'}
                onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                onKeyDown={(e) => handleRoleKeyDown(e, 'OWNER')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  border:
                    formData.role === 'OWNER'
                      ? '2px solid var(--primary)'
                      : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  flex: 1,
                  backgroundColor:
                    formData.role === 'OWNER' ? 'var(--primary-light)' : 'var(--bg-card)',
                  transition: 'var(--transition)',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border:
                      formData.role === 'OWNER'
                        ? '2px solid var(--primary)'
                        : '2px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: formData.role === 'OWNER' ? 'var(--primary)' : 'transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  {formData.role === 'OWNER' && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  )}
                </div>
                <div>
                  <span
                    style={{
                      display: 'block',
                      fontWeight: formData.role === 'OWNER' ? '700' : '600',
                      color: formData.role === 'OWNER' ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.925rem'
                    }}
                  >
                    List properties
                  </span>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Property landlord (Owner)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem' }}
            disabled={isLoading || usernameAvailability.status === 'checking'}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
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
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
