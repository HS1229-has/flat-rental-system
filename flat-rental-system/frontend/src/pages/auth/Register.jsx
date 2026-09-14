import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'TENANT' // Default role
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    const trimmedPhone = formData.phoneNumber.trim();
    if (!trimmedPhone) {
      errs.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      errs.phoneNumber = 'Phone number must be a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Trigger validations
    if (!validateForm()) {
      setError('Please resolve all validation errors below.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        ...formData,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim()
      });
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card glass-effect" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Create an Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join LuxeFlats to find or rent properties</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.75rem', borderColor: fieldErrors.username ? '#ef4444' : '' }}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.username && <small style={{ color: '#f87171', display: 'block', marginTop: '0.25rem' }}>{fieldErrors.username}</small>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  className={`form-control ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.75rem', borderColor: fieldErrors.fullName ? '#ef4444' : '' }}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
              {fieldErrors.fullName && <small style={{ color: '#f87171', display: 'block', marginTop: '0.25rem' }}>{fieldErrors.fullName}</small>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input
                type="text"
                name="email"
                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                style={{ paddingLeft: '2.75rem', borderColor: fieldErrors.email ? '#ef4444' : '' }}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.email && <small style={{ color: '#f87171', display: 'block', marginTop: '0.25rem' }}>{fieldErrors.email}</small>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.75rem', borderColor: fieldErrors.password ? '#ef4444' : '' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.password && <small style={{ color: '#f87171', display: 'block', marginTop: '0.25rem' }}>{fieldErrors.password}</small>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  name="phoneNumber"
                  className={`form-control ${fieldErrors.phoneNumber ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: '2.75rem', borderColor: fieldErrors.phoneNumber ? '#ef4444' : '' }}
                  placeholder="e.g. 9876543210"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.phoneNumber && <small style={{ color: '#f87171', display: 'block', marginTop: '0.25rem' }}>{fieldErrors.phoneNumber}</small>}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">I want to...</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div
                onClick={() => setFormData({ ...formData, role: 'TENANT' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  border: formData.role === 'TENANT' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  flex: 1,
                  backgroundColor: formData.role === 'TENANT' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                  transition: 'var(--transition)',
                  userSelect: 'none',
                  boxShadow: formData.role === 'TENANT' ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  border: formData.role === 'TENANT' ? '2px solid var(--primary)' : '2px solid #64748b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: formData.role === 'TENANT' ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}>
                  {formData.role === 'TENANT' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }}></div>}
                </div>
                <span style={{ fontWeight: formData.role === 'TENANT' ? '700' : '500', color: formData.role === 'TENANT' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.9rem' }}>Rent a property (Tenant)</span>
              </div>

              <div
                onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  border: formData.role === 'OWNER' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  flex: 1,
                  backgroundColor: formData.role === 'OWNER' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                  transition: 'var(--transition)',
                  userSelect: 'none',
                  boxShadow: formData.role === 'OWNER' ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  border: formData.role === 'OWNER' ? '2px solid var(--primary)' : '2px solid #64748b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: formData.role === 'OWNER' ? 'var(--primary)' : 'transparent',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}>
                  {formData.role === 'OWNER' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }}></div>}
                </div>
                <span style={{ fontWeight: formData.role === 'OWNER' ? '700' : '500', color: formData.role === 'OWNER' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.9rem' }}>List my properties (Owner)</span>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
