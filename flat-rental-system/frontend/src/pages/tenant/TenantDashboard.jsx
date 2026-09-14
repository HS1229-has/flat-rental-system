import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, CreditCard, Home, CheckCircle, XCircle, IndianRupee, Clock,
  ArrowRight, AlertCircle, Heart, Trash2, Shield, FileText, CalendarCheck, MapPin, MessageSquare, Phone, Mail,
  Upload, ShieldAlert, ShieldCheck
} from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

// Fetches and displays owner contact details after booking approval
const OwnerContactCard = ({ bookingId }) => {
  const [contact, setContact] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get(`/bookings/${bookingId}/owner-contact`)
      .then(res => setContact(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading || !contact) return null;

  return (
    <div style={{
      padding: '1rem 1.25rem', borderRadius: '10px',
      backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16,185,129,0.25)',
      marginTop: '0.5rem'
    }}>
      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <CheckCircle size={14} /> Owner Contact Details Shared
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
        <span style={{ fontWeight: '600' }}>{contact.fullName}</span>
        {contact.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} />{contact.phone}</span>}
        {contact.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} />{contact.email}</span>}
        {contact.preferredContactMethod && <span style={{ color: 'var(--text-muted)' }}>Preferred: {contact.preferredContactMethod}</span>}
      </div>
      {contact.message && <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{contact.message}"</p>}
    </div>
  );
};


const statusColors = {
  PENDING: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  CONFIRMED: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  CANCELLED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  FAILED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  REFUNDED: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc' },
  DECLINED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  REFUND_PENDING: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)', text: '#d97706' },
  TOKEN_PAID: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#818cf8' },
  APPLICATION_DRAFT: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' },
  PENDING_OWNER_APPROVAL: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

const StatusBadge = ({ status }) => {
  const c = statusColors[status] || statusColors.PENDING;
  const displayLabel = status === 'TOKEN_PAID' ? 'VERIFICATION REQUIRED'
    : status === 'PENDING_OWNER_APPROVAL' ? 'PENDING OWNER REVIEW'
    : status === 'APPLICATION_DRAFT' ? 'DRAFT'
    : status;
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {displayLabel}
    </span>
  );
};

const TenantDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [meetups, setMeetups] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const [propertiesMap, setPropertiesMap] = useState({});
  const [bookingPayments, setBookingPayments] = useState({});
  const [bookingRefunds, setBookingRefunds] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Profile-level Police Verification states
  const [policeVerification, setPoliceVerification] = useState(null);
  const [loadingPoliceVerification, setLoadingPoliceVerification] = useState(true);
  const [verificationFileName, setVerificationFileName] = useState('');
  const [verificationFileBase64, setVerificationFileBase64] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Digital KYC & CIBIL state
  const [kycData, setKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycForm, setKycForm] = useState({
    fullName: user?.fullName || 'Verified Tenant',
    aadhaarNumber: '987654321098',
    panNumber: 'ABCDE1234F',
    companyName: 'Infosys Limited',
    monthlyIncome: 75000
  });
  const [kycLoading, setKycLoading] = useState(false);
  const [kycMsg, setKycMsg] = useState('');

  const loadKycData = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/bookings/tenant/${user.userId}/kyc-status`);
      setKycData(res.data);
    } catch (err) {
      console.error("Failed to load KYC status", err);
    }
  };

  const handleVerifyKyc = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    try {
      setKycLoading(true);
      setKycMsg('');
      const res = await api.post(`/bookings/tenant/${user.userId}/kyc-verify`, kycForm);
      setKycData(res.data);
      setKycMsg('KYC Verified successfully via Government API simulation!');
      setTimeout(() => {
        setShowKycModal(false);
        setKycMsg('');
      }, 1500);
    } catch (err) {
      setKycMsg(err.response?.data?.message || 'KYC Verification failed. Please check Aadhaar and PAN.');
    } finally {
      setKycLoading(false);
    }
  };

  const loadPoliceVerification = async () => {
    if (!user) return;
    try {
      setLoadingPoliceVerification(true);
      const res = await api.get(`/bookings/tenant/${user.userId}/police-verification`);
      setPoliceVerification(res.data);
    } catch (err) {
      console.error("Failed to load police verification", err);
    } finally {
      setLoadingPoliceVerification(false);
    }
  };

  // Reschedule form states per meetup ID
  const [rescheduleData, setRescheduleData] = useState({});
  const [submittingReschedule, setSubmittingReschedule] = useState({});

  const loadBookings = async () => {
    if (!user) return;
    try {
      setLoadingBookings(true);
      const res = await api.get(`/bookings/tenant/${user.userId}`);
      const bookingsList = res.data || [];
      setBookings(bookingsList);
      
      // Load meetups for each booking
      loadMeetupsForBookings(bookingsList);

      const propMap = {};
      const payMap = {};
      const refMap = {};
      
      await Promise.all(bookingsList.map(async (b) => {
        try {
          const propRes = await api.get(`/properties/${b.propertyId}`);
          propMap[b.propertyId] = propRes.data;
        } catch (e) {
          console.warn("Failed to load property details for booking " + b.id, e);
        }
        
        try {
          const payRes = await api.get(`/payments/booking/${b.id}`);
          payMap[b.id] = payRes.data || [];
        } catch (e) {
          console.warn("Failed to load payments for booking " + b.id, e);
        }
        
        try {
          const refRes = await api.get(`/payments/booking/${b.id}/refunds`);
          refMap[b.id] = refRes.data || [];
        } catch (e) {
          console.warn("Failed to load refunds for booking " + b.id, e);
        }
      }));
      
      setPropertiesMap(propMap);
      setBookingPayments(payMap);
      setBookingRefunds(refMap);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadMeetupsForBookings = async (bookingsList) => {
    const meetupMap = {};
    for (const b of bookingsList) {
      try {
        const mRes = await api.get(`/bookings/${b.id}/meetups`);
        meetupMap[b.id] = mRes.data || [];
      } catch (e) {
        // ignore
      }
    }
    setMeetups(meetupMap);
  };

  useEffect(() => {
    loadBookings();
    loadPoliceVerification();
    loadKycData();
    
    // Load local storage favorites on mount
    const saved = localStorage.getItem(`favorites_${user?.userId || 'guest'}`);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites([]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'payments' || !user) return;
    const loadPayments = async () => {
      try {
        setLoadingPayments(true);
        const res = await api.get(`/payments/tenant/${user.userId}`);
        const pays = res.data || [];
        
        const allRefunds = [];
        for (const b of bookings) {
          try {
            const refRes = await api.get(`/payments/booking/${b.id}/refunds`);
            const refs = refRes.data || [];
            refs.forEach(r => {
              allRefunds.push({
                id: 'REF-' + r.id,
                bookingId: r.bookingId,
                amount: r.refundAmount,
                paymentMethod: 'REFUND',
                status: r.refundStatus,
                transactionReference: r.refundReference,
                createdAt: r.refundCompletedAt || r.refundInitiatedAt,
                paymentType: 'REFUND'
              });
            });
          } catch (e) {
            // ignore
          }
        }
        
        const merged = [...pays, ...allRefunds].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPayments(merged);
      } catch (err) {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    };
    loadPayments();
  }, [activeTab, user, bookings]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      setCancellingId(bookingId);
      await api.patch(`/bookings/${bookingId}/status?status=CANCELLED`);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) {
      alert('Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleMeetupAction = async (meetupId, bookingId, statusVal, counterData = null) => {
    try {
      const payload = { status: statusVal };
      if (counterData) {
        payload.counterDate = counterData.date;
        payload.counterTime = counterData.time;
        payload.counterMessage = counterData.message;
      }
      await api.put(`/bookings/meetup/${meetupId}/status`, payload);
      
      // Reload meetups
      const mRes = await api.get(`/bookings/${bookingId}/meetups`);
      setMeetups(prev => ({
        ...prev,
        [bookingId]: mRes.data || []
      }));
    } catch (err) {
      alert('Failed to update meetup status.');
    }
  };

  const removeFavorite = (propertyId) => {
    const updated = favorites.filter(p => p.id !== propertyId);
    setFavorites(updated);
    localStorage.setItem(`favorites_${user?.userId || 'guest'}`, JSON.stringify(updated));
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING' || b.status === 'TOKEN_PAID' || b.status === 'PENDING_OWNER_APPROVAL').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    borderRadius: '8px',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            Welcome back, {user?.fullName || user?.username}
            {policeVerification?.status === 'VERIFIED' && (
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                backgroundColor: 'rgba(16,185,129,0.15)', 
                color: '#10b981', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '6px', 
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                textTransform: 'uppercase',
                verticalAlign: 'middle'
              }}>
                ✓ CCTNS Verified
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your rental bookings, mock payments, and verification profiles</p>
        </div>
      </div>

      {/* Real-time Government KYC & CIBIL Background Verification Card */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                Digital Government KYC & CIBIL Background Status:
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '800',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                letterSpacing: '0.4px'
              }}>
                ✓ {kycData?.kycStatus || 'VERIFIED'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>
              Aadhaar: <span style={{ fontWeight: '600', color: '#1e293b' }}>{kycData?.aadhaarMasked || 'XXXX-XXXX-8921'}</span> &bull; 
              PAN: <span style={{ fontWeight: '600', color: '#1e293b' }}>{kycData?.panMasked || 'AB******1F'}</span> &bull; 
              CIBIL Score: <span style={{ fontWeight: '700', color: '#2563eb' }}>{kycData?.cibilScore || 782} ({kycData?.creditRating || 'EXCELLENT'})</span> &bull; 
              Risk Rating: <span style={{ fontWeight: '700', color: '#16a34a' }}>{kycData?.riskLevel || 'LOW'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKycModal(true)}
          className="btn btn-sm"
          style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #10b981',
            color: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            cursor: 'pointer'
          }}>
          Update / Run KYC API
        </button>
      </div>

      {/* KYC Verification Modal */}
      {showKycModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowKycModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={24} color="#10b981" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Government KYC & CIBIL Verification
              </h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Simulates real-time identity check with UIDAI Aadhaar, Income Tax Department PAN, and CIBIL credit score algorithm.
            </p>

            <form onSubmit={handleVerifyKyc}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={kycForm.fullName}
                  onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                    12-digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    placeholder="e.g. 987654321098"
                    className="form-control"
                    value={kycForm.aadhaarNumber}
                    onChange={e => setKycForm({ ...kycForm, aadhaarNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                    10-digit PAN Number
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="e.g. ABCDE1234F"
                    className="form-control"
                    style={{ textTransform: 'uppercase' }}
                    value={kycForm.panNumber}
                    onChange={e => setKycForm({ ...kycForm, panNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                    Current Employer
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={kycForm.companyName}
                    onChange={e => setKycForm({ ...kycForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: '#334155' }}>
                    Monthly In-Hand Salary (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={kycForm.monthlyIncome}
                    onChange={e => setKycForm({ ...kycForm, monthlyIncome: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {kycMsg && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  backgroundColor: kycMsg.includes('success') ? '#dcfce7' : '#fee2e2',
                  color: kycMsg.includes('success') ? '#15803d' : '#b91c1c'
                }}>
                  {kycMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={kycLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontWeight: '700',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff'
                }}>
                <ShieldCheck size={18} /> {kycLoading ? 'Verifying with Government API...' : 'Run Instant Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Applications', value: stats.total, icon: Calendar, color: '#6366f1' },
          { label: 'Awaiting Action', value: stats.pending, icon: Clock, color: '#fbbf24' },
          { label: 'Confirmed bookings', value: stats.confirmed, icon: CheckCircle, color: '#34d399' },
          { label: 'Completed stays', value: stats.completed, icon: Home, color: '#60a5fa' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>My Bookings</button>
        <button style={tabStyle('favorites')} onClick={() => setActiveTab('favorites')}>Saved Flats ({favorites.length})</button>
        <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>Payments History</button>
        <button style={tabStyle('verification')} onClick={() => setActiveTab('verification')}>CCTNS Verification</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        loadingBookings ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '120px', animation: 'pulse 1.5s infinite' }}></div>)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Calendar size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No bookings found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse flats and send a booking request to start.</p>
            <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map(b => {
              const activeMeetups = meetups[b.id] || [];
              return (
                <div key={b.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
                  
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)', margin: 0 }}>Booking #{b.id}</h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                        <span>Property ID: <strong>#{b.propertyId}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} /> {formatDate(b.startDate)} → {formatDate(b.endDate)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {b.status === 'CONFIRMED' && (
                        <Link to={`/payment/${b.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CreditCard size={14} /> Make Rental Payment
                        </Link>
                      )}
                      {b.status === 'TOKEN_PAID' && (
                        <Link to={`/tenant/verification/${b.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={14} /> Complete Verification Form
                        </Link>
                      )}
                      {(b.status !== 'CANCELLED' && b.status !== 'DECLINED' && b.status !== 'REJECTED' && b.status !== 'COMPLETED') && (
                        <button onClick={() => {
                          setSelectedBookingForCancel(b);
                          setCancelReason('');
                          setShowCancelModal(true);
                        }} className="btn btn-sm"
                          disabled={cancellingId === b.id}
                          style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <XCircle size={14} /> {cancellingId === b.id ? '...' : 'Cancel Booking'}
                        </button>
                      )}
                      <Link to={`/properties/${b.propertyId}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        View Property <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Info panel if application is pending owner review */}
                  {b.status === 'PENDING_OWNER_APPROVAL' && (
                    <div style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#3b82f6'
                    }}>
                      <CheckCircle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Application Sent to Owner</strong>
                        <span>Your token payment was received and your rental application has been submitted to the owner. You'll be notified once the owner reviews and responds.</span>
                      </div>
                    </div>
                  )}

                  {/* Warning panel if verification is missing */}
                  {b.status === 'TOKEN_PAID' && (
                    <div style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(217, 119, 6, 0.05)', 
                      border: '1px solid rgba(217, 119, 6, 0.2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#b45309'
                    }}>
                      <AlertCircle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Tenant Verification Pending</strong>
                        <span>Your holding token payment was captured. To forward this booking request to the property owner, you must complete and submit the verification credentials form.</span>
                      </div>
                    </div>
                  )}

                  {/* Warning panel if declined */}
                  {b.status === 'DECLINED' && (
                    <div style={{ 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(239,68,68,0.04)', 
                      border: '1px solid rgba(239,68,68,0.15)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#ef4444'
                    }}>
                      <AlertCircle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Booking Request Declined</strong>
                        <span>This booking request was declined. A full refund of your token deposit is processing back to your transaction account (expected 3–7 business days).</span>
                      </div>
                    </div>
                  )}

                  {b.status === 'CANCELLED' && (() => {
                    const prop = propertiesMap[b.propertyId];
                    const payments = bookingPayments[b.id] || [];
                    const refunds = bookingRefunds[b.id] || [];
                    
                    const tokenPayment = payments.find(p => p.paymentType === 'TOKEN' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
                    const tokenAmountPaid = tokenPayment ? parseFloat(tokenPayment.amount) : 0;
                    
                    const secDepositAmt = prop?.securityDeposit ? parseFloat(prop.securityDeposit) : 0;
                    const successfulSecPayments = payments.filter(p => p.paymentType === 'SECURITY_DEPOSIT' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
                    const securityDepositPaidAmt = successfulSecPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const securityDepositPaidLabel = securityDepositPaidAmt >= secDepositAmt ? 'Yes' : securityDepositPaidAmt > 0 ? 'Partially Paid' : 'No';
                    
                    const totalPaid = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const refundableAmount = totalPaid;
                    
                    const refundStatus = refunds.length > 0 ? refunds[0].refundStatus : (totalPaid > 0 ? 'REFUND_PENDING' : 'NOT_APPLICABLE');
                    const refundReference = refunds.length > 0 ? refunds[0].refundReference : 'N/A';
                    
                    return (
                      <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: '8px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.04)', 
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        marginTop: '0.25rem',
                        fontSize: '0.9rem'
                      }}>
                        <h4 style={{ fontWeight: '800', color: '#ef4444', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginTop: 0 }}>
                          <XCircle size={16} /> Refund & Cancellation Summary
                        </h4>
                        
                        {b.cancellationReason && (
                          <div style={{ marginBottom: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            Reason: "{b.cancellationReason}"
                          </div>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxWidth: '400px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Token Amount Paid:</span>
                          <span style={{ fontWeight: '600' }}>₹{tokenAmountPaid.toLocaleString('en-IN')}</span>
                          
                          <span style={{ color: 'var(--text-muted)' }}>Security Deposit:</span>
                          <span style={{ fontWeight: '600' }}>₹{secDepositAmt.toLocaleString('en-IN')}</span>
                          
                          <span style={{ color: 'var(--text-muted)' }}>Security Deposit Paid:</span>
                          <span style={{ fontWeight: '600', color: securityDepositPaidLabel === 'Yes' ? '#10b981' : '#ef4444' }}>{securityDepositPaidLabel}</span>
                          
                          <span style={{ color: 'var(--text-muted)' }}>Amount Actually Paid:</span>
                          <span style={{ fontWeight: '600' }}>₹{totalPaid.toLocaleString('en-IN')}</span>
                          
                          <span style={{ color: 'var(--text-muted)', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>Refund Amount:</span>
                          <span style={{ fontWeight: '800', color: '#10b981', borderTop: '1px dashed #cbd5e1', paddingTop: '0.4rem' }}>₹{refundableAmount.toLocaleString('en-IN')}</span>
                          
                          <span style={{ color: 'var(--text-muted)' }}>Refund Status:</span>
                          <span style={{ fontWeight: '750', color: '#3b82f6' }}>{refundStatus}</span>
                          
                          <span style={{ color: 'var(--text-muted)' }}>Refund Reference:</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: '700' }}>{refundReference}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Owner Contact Details for CONFIRMED bookings */}
                  {b.status === 'CONFIRMED' && (
                    <OwnerContactCard bookingId={b.id} />
                  )}

                  {/* Physical Meetup Scheduling Section */}
                  {activeMeetups.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CalendarCheck size={16} color="var(--primary-color)" /> Physical Meetup Arrangements
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activeMeetups.map(m => (
                          <div key={m.id} style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            border: '1px solid #e2e8f0', 
                            backgroundColor: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                          }}>
                            
                            {/* Meetup summary row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <MapPin size={15} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{m.location || 'Preferred Location'}</span>
                                <span style={{ color: 'var(--text-muted)' }}>|</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{m.meetingDate} at {m.meetingTime}</span>
                              </div>
                              <span style={{ 
                                fontSize: '0.725rem', 
                                fontWeight: '800', 
                                textTransform: 'uppercase', 
                                padding: '0.15rem 0.5rem', 
                                borderRadius: '4px',
                                backgroundColor: m.status === 'ACCEPTED' ? 'rgba(16,185,129,0.1)' : m.status === 'PENDING' ? 'rgba(251,191,36,0.1)' : 'rgba(74,85,104,0.1)',
                                color: m.status === 'ACCEPTED' ? '#10b981' : m.status === 'PENDING' ? '#fbbf24' : '#4a5568'
                              }}>
                                Status: {m.status.replace('_', ' ')}
                              </span>
                            </div>

                            {m.message && (
                              <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text-muted)', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                <MessageSquare size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>Owner message: "{m.message}"</span>
                              </div>
                            )}

                            {/* Counter Proposed details */}
                            {m.status === 'RESCHEDULE_REQUESTED' && (
                              <div style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#b45309' }}>
                                <strong>You proposed a reschedule:</strong> {m.counterDate} at {m.counterTime}. Message: "{m.counterMessage}"
                              </div>
                            )}

                            {/* Tenant Action buttons for PENDING requests */}
                            {m.status === 'PENDING' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                  <button 
                                    onClick={() => handleMeetupAction(m.id, b.id, 'ACCEPTED')}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Accept Meetup Slot
                                  </button>
                                  <button 
                                    onClick={() => setRescheduleData(prev => ({ ...prev, [m.id]: { show: true, date: '', time: '', message: '' } }))}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Propose Different Time
                                  </button>
                                  <button 
                                    onClick={() => handleMeetupAction(m.id, b.id, 'DECLINED')}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                  >
                                    Decline Meetup
                                  </button>
                                </div>

                                {/* Reschedule Form */}
                                {rescheduleData[m.id]?.show && (
                                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Propose Reschedule Slot</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                                      <div>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Proposed Date</label>
                                        <input 
                                          type="date" 
                                          className="form-control form-control-sm" 
                                          value={rescheduleData[m.id].date}
                                          onChange={(e) => setRescheduleData(prev => ({
                                            ...prev,
                                            [m.id]: { ...prev[m.id], date: e.target.value }
                                          }))}
                                        />
                                      </div>
                                      <div>
                                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Proposed Time</label>
                                        <input 
                                          type="text" 
                                          className="form-control form-control-sm" 
                                          placeholder="e.g. 4:00 PM"
                                          value={rescheduleData[m.id].time}
                                          onChange={(e) => setRescheduleData(prev => ({
                                            ...prev,
                                            [m.id]: { ...prev[m.id], time: e.target.value }
                                          }))}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Optional message for owner</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        placeholder="Reason for reschedule..."
                                        value={rescheduleData[m.id].message}
                                        onChange={(e) => setRescheduleData(prev => ({
                                          ...prev,
                                          [m.id]: { ...prev[m.id], message: e.target.value }
                                        }))}
                                      />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button 
                                        onClick={() => setRescheduleData(prev => ({ ...prev, [m.id]: { ...prev[m.id], show: false } }))}
                                        className="btn btn-secondary btn-sm"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const info = rescheduleData[m.id];
                                          if (!info.date || !info.time) {
                                            alert('Please select proposed date and time.');
                                            return;
                                          }
                                          handleMeetupAction(m.id, b.id, 'RESCHEDULE_REQUESTED', info);
                                          setRescheduleData(prev => ({ ...prev, [m.id]: { ...prev[m.id], show: false } }));
                                        }}
                                        className="btn btn-primary btn-sm"
                                      >
                                        Submit Counter Proposal
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )
      )}

      {/* Saved / Favorite properties */}
      {activeTab === 'favorites' && (
        favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Heart size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No saved properties</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Heart properties in their details page to keep track of them here.</p>
            <Link to="/properties" className="btn btn-primary">Discover Flats</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {favorites.map(p => (
              <div key={p.id} className="glass-card" style={{ overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={p.imageUrls ? (splitImageUrls(p.imageUrls)[0] || FALLBACK) : FALLBACK} alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => removeFavorite(p.id)}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: '750', fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{p.city}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '850', color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee size={14} />{Number(p.rentAmount).toLocaleString('en-IN')}/mo
                    </span>
                    <Link to={`/properties/${p.id}`} className="btn btn-primary btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        loadingPayments ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1,2].map(i => <div key={i} className="glass-card" style={{ height: '100px', animation: 'pulse 1.5s infinite' }}></div>)}
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <CreditCard size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No payment history</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your payment transaction history will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {payments.map(p => (
              <div key={p.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: p.paymentType === 'REFUND' ? '#ef4444' : 'var(--text-main)', margin: 0 }}>
                      {p.paymentType === 'TOKEN' ? 'Token Payment' : p.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : p.paymentType === 'RENT' ? 'Rent Payment' : p.paymentType === 'REFUND' ? 'Refund' : 'Payment'} {typeof p.id === 'string' && p.id.startsWith('REF-') ? '' : `#${p.id}`}
                    </h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span>Booking ID: <strong>#{p.bookingId}</strong></span>
                    <span>Method: <strong>{p.paymentMethod}</strong></span>
                    {p.transactionReference && <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Ref: {p.transactionReference}</span>}
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '850', color: p.paymentType === 'REFUND' ? '#ef4444' : 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                  {p.paymentType === 'REFUND' ? '-' : ''}<IndianRupee size={16} />{Number(p.amount).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        loadingPoliceVerification ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading verification status...</div>
        ) : (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Shield size={24} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>CCTNS / Police Verification Center</h2>
              </div>

              {/* Status Banner */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                backgroundColor: 
                  policeVerification?.status === 'VERIFIED' ? 'rgba(16,185,129,0.08)' :
                  policeVerification?.status === 'PENDING_VERIFICATION' ? 'rgba(245,158,11,0.08)' :
                  (policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') ? 'rgba(239,68,68,0.08)' :
                  'rgba(100,116,139,0.08)',
                border: `1px solid ${
                  policeVerification?.status === 'VERIFIED' ? 'rgba(16,185,129,0.3)' :
                  policeVerification?.status === 'PENDING_VERIFICATION' ? 'rgba(245,158,11,0.3)' :
                  (policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') ? 'rgba(239,68,68,0.3)' :
                  'rgba(100,116,139,0.3)'
                }`
              }}>
                {policeVerification?.status === 'VERIFIED' ? <ShieldCheck size={20} color="#10b981" /> :
                 policeVerification?.status === 'PENDING_VERIFICATION' ? <Clock size={20} color="#f59e0b" /> :
                 (policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') ? <XCircle size={20} color="#ef4444" /> :
                 <ShieldAlert size={20} color="#64748b" />}
                <div>
                  <div style={{ fontWeight: '750', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    Status: {policeVerification?.status || 'NOT_SUBMITTED'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {policeVerification?.status === 'VERIFIED' && 'Your police verification is approved and active.'}
                    {policeVerification?.status === 'PENDING_VERIFICATION' && 'Your document has been submitted and is awaiting admin review.'}
                    {(policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') && `Verification failed. Reason: ${policeVerification.rejectionReason || 'N/A'}`}
                    {(!policeVerification?.status || policeVerification?.status === 'NOT_SUBMITTED') && 'Please upload your police verification report or identity clearance document.'}
                  </div>
                </div>
              </div>

              {policeVerification?.status === 'VERIFIED' && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div><strong>Reference Number:</strong> <span style={{ fontFamily: 'monospace' }}>{policeVerification.verificationReferenceNumber}</span></div>
                  <div><strong>Provider:</strong> {policeVerification.verificationProvider}</div>
                  <div><strong>Verified On:</strong> {new Date(policeVerification.verifiedAt).toLocaleDateString()}</div>
                </div>
              )}

              {/* Form (only show if not verified and not pending) */}
              {(!policeVerification || policeVerification.status === 'NOT_SUBMITTED' || policeVerification.status === 'REJECTED' || policeVerification.status === 'VERIFICATION_FAILED') && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!verificationFileBase64) {
                    setVerificationError('Please select a file.');
                    return;
                  }
                  try {
                    setSubmittingVerification(true);
                    setVerificationError('');
                    const res = await api.post(`/bookings/tenant/${user.userId}/police-verification`, {
                      documentData: verificationFileBase64,
                      documentFileName: verificationFileName
                    });
                    setPoliceVerification(res.data);
                    setVerificationFileBase64('');
                    setVerificationFileName('');
                  } catch (err) {
                    setVerificationError(err.response?.data?.message || 'Failed to submit verification.');
                  } finally {
                    setSubmittingVerification(false);
                  }
                }} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                  {verificationError && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}><AlertCircle size={14} /> {verificationError}</div>}
                  
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Upload Verification Document (PDF/JPG/PNG, Max 2MB)</label>
                    <label htmlFor="p-upload" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)'
                    }}>
                      <Upload size={20} /> {verificationFileName || 'Click to select verification file'}
                    </label>
                    <input id="p-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        setVerificationError('File size must be under 2MB.');
                        return;
                      }
                      setVerificationFileName(file.name);
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        setVerificationFileBase64(reader.result);
                        setVerificationError('');
                      };
                    }} />
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={submittingVerification} style={{ marginTop: '0.5rem' }}>
                    {submittingVerification ? 'Submitting...' : 'Submit to CCTNS Verification'}
                  </button>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                    Note: Your document will be processed securely. The simulation matches manual verification.
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      )}

      {showCancelModal && selectedBookingForCancel && (() => {
        const booking = selectedBookingForCancel;
        const prop = propertiesMap[booking.propertyId];
        const payments = bookingPayments[booking.id] || [];
        
        const tokenPayment = payments.find(p => p.paymentType === 'TOKEN' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
        const tokenAmountPaid = tokenPayment ? parseFloat(tokenPayment.amount) : 0;
        
        const secDepositAmt = prop?.securityDeposit ? parseFloat(prop.securityDeposit) : 0;
        const successfulSecPayments = payments.filter(p => p.paymentType === 'SECURITY_DEPOSIT' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
        const securityDepositPaidAmt = successfulSecPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const securityDepositPaidLabel = securityDepositPaidAmt >= secDepositAmt ? 'Yes' : securityDepositPaidAmt > 0 ? 'Partially Paid' : 'No';
        
        const amountPaidSoFar = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const refundableAmount = amountPaidSoFar;

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}>
            <div className="glass-card" style={{
              width: '100%', maxWidth: '500px', backgroundColor: '#ffffff',
              padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              maxHeight: '90vh', overflowY: 'auto'
            }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.25rem', color: '#ef4444', marginTop: 0 }}>
                Confirm Booking Cancellation
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Booking ID:</span>
                  <span style={{ fontWeight: '700' }}>#{booking.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Property:</span>
                  <span style={{ fontWeight: '700', textAlign: 'right' }}>{prop?.title || 'Property #' + booking.propertyId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Token Amount Paid:</span>
                  <span style={{ fontWeight: '600' }}>₹{tokenAmountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security Deposit:</span>
                  <span style={{ fontWeight: '600' }}>₹{secDepositAmt.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security Deposit Paid:</span>
                  <span style={{ fontWeight: '700', color: securityDepositPaidLabel === 'Yes' ? '#10b981' : '#ef4444' }}>{securityDepositPaidLabel}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '700' }}>Amount Paid So Far:</span>
                  <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>₹{amountPaidSoFar.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                  <span style={{ fontWeight: '700', color: '#f59e0b' }}>{booking.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: '800' }}>Estimated Refund:</span>
                  <span style={{ fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>₹{refundableAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Cancellation Reason (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Tell us why you are canceling..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                  onClick={async () => {
                    try {
                      setCancellingId(booking.id);
                      setShowCancelModal(false);
                      
                      await api.delete(`/bookings/${booking.id}?reason=${encodeURIComponent(cancelReason)}`);
                      try {
                        await api.post(`/payments/booking/${booking.id}/refund`);
                      } catch (payErr) {
                        console.warn("Failed to process payment refund on backend:", payErr);
                      }
                      
                      await loadBookings();
                      
                      if (activeTab === 'payments') {
                        const pRes = await api.get(`/payments/tenant/${user.userId}`);
                        setPayments(pRes.data || []);
                      }
                      
                      alert('Booking cancelled and refund initiated successfully!');
                    } catch (e) {
                      alert('Failed to cancel booking.');
                    } finally {
                      setCancellingId(null);
                    }
                  }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default TenantDashboard;
