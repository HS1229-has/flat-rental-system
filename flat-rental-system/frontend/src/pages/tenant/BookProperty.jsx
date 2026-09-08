import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, IndianRupee, MapPin, Bed, Bath, Building2, 
  ArrowLeft, AlertCircle, CheckCircle, Info
} from 'lucide-react';

const BookProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    startDate: '',
    endDate: ''
  });

  // Compute min date (today)
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const getMonthsBetween = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (s >= e) return 0;
    const diffDays = (e - s) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diffDays / 30.437));
  };

  const months = getMonthsBetween(form.startDate, form.endDate);
  const totalRent = property ? months * parseFloat(property.rentAmount) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.startDate || !form.endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('End date must be after start date.');
      return;
    }
    if (new Date(form.startDate) < new Date(today)) {
      setError('Start date cannot be in the past.');
      return;
    }
    if (months < 1) {
      setError('Minimum booking period is 1 month.');
      return;
    }

    try {
      setSubmitting(true);
      setSuccess('Dates validated! Redirecting to application form...');
      setTimeout(() => {
        navigate('/tenant/apply', { 
          state: { 
            property, 
            startDate: form.startDate, 
            endDate: form.endDate, 
            totalAmount: totalRent 
          } 
        });
      }, 800);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
          <div className="glass-card" style={{ height: '400px', animation: 'pulse 1.5s infinite' }}></div>
          <div className="glass-card" style={{ height: '400px', animation: 'pulse 1.5s infinite' }}></div>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <p style={{ color: '#f87171', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/properties" className="btn btn-primary">Back to Properties</Link>
      </div>
    );
  }

  const images = property?.imageUrls ? splitImageUrls(property.imageUrls) : [];
  const firstImg = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Back link */}
      <Link 
        to={`/properties/${id}`} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={16} /> Back to Property
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>
        Request Booking
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr min(400px, 100%)', gap: '2rem', alignItems: 'start' }}>
        {/* Property Summary */}
        <div>
          <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <img 
              src={firstImg} 
              alt={property?.title}
              style={{ width: '100%', height: '280px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'; }}
            />
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem' }}>{property?.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <MapPin size={14} />
                {property?.locality ? `${property.locality}, ` : ''}{property?.city}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Bed size={16} /> {property?.bedrooms} Bed
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Bath size={16} /> {property?.bathrooms} Bath
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <Building2 size={16} /> {property?.furnishing || 'Unfurnished'}
                </span>
              </div>

              <div style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'rgba(99, 102, 241, 0.08)', 
                border: '1px solid rgba(99, 102, 241, 0.15)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monthly Rent</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                    <IndianRupee size={18} />{Number(property?.rentAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                {property?.securityDeposit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Security Deposit</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee size={14} />{Number(property.securityDeposit).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info box */}
          <div style={{ 
            padding: '1rem 1.25rem', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <Info size={18} color="#60a5fa" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <p style={{ fontSize: '0.85rem', color: '#93c5fd', lineHeight: '1.5' }}>
              After selecting dates you'll complete a <strong>Tenant Application Form</strong>, then pay a mandatory <strong>Token Amount</strong> to submit your request to the owner.
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" /> Select Dates
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Move-in Date</label>
              <input
                type="date"
                className="form-control"
                value={form.startDate}
                min={today}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Move-out Date</label>
              <input
                type="date"
                className="form-control"
                value={form.endDate}
                min={form.startDate || today}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>

            {/* Booking Summary */}
            {months > 0 && (
              <div style={{ 
                padding: '1rem', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking Summary
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Duration</span>
                  <span style={{ fontWeight: '600' }}>{months} month{months > 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Monthly Rent</span>
                  <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    <IndianRupee size={14} />{Number(property?.rentAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.75rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '700' }}>Total Rent</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                    <IndianRupee size={16} />{totalRent.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={16} /> {success}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting || !form.startDate || !form.endDate}
            >
              {submitting ? 'Redirecting...' : 'Continue to Application →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              You'll fill your application details & pay token amount on the next steps.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookProperty;
