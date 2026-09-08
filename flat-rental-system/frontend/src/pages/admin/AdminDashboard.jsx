import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Building2, Calendar, CreditCard, IndianRupee, TrendingUp,
  CheckCircle, XCircle, Clock, Shield, Eye, Trash2, AlertCircle
} from 'lucide-react';

const statusColors = {
  PENDING: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  CONFIRMED: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  CANCELLED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  FAILED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  REFUNDED: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc' },
};

const StatusBadge = ({ status }) => {
  const c = statusColors[status] || statusColors.PENDING;
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text, textTransform: 'uppercase' }}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [propRes, bookRes, payRes, userRes] = await Promise.allSettled([
          api.get('/properties'),
          api.get('/bookings'),
          api.get('/payments'),
          api.get('/auth/users')
        ]);
        
        if (propRes.status === 'fulfilled') setProperties(propRes.value.data || []);
        if (bookRes.status === 'fulfilled') setBookings(Array.isArray(bookRes.value.data) ? bookRes.value.data : []);
        if (payRes.status === 'fulfilled') setPayments(Array.isArray(payRes.value.data) ? payRes.value.data : []);
        if (userRes.status === 'fulfilled') setUsersList(Array.isArray(userRes.value.data) ? userRes.value.data : []);
      } catch (err) {
        setError('Failed to fetch admin data.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const tabStyle = (tab) => ({
    padding: '0.7rem 1.25rem', border: 'none',
    backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-muted)',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', borderRadius: '8px', transition: 'all 0.2s'
  });

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete property #' + id + '?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getRoleBadgeClass = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) return 'badge-admin';
    if (r.includes('OWNER')) return 'badge-owner';
    return 'badge-tenant';
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="#f87171" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Platform overview and management</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Properties Listed', value: properties.length, icon: Building2, color: '#6366f1' },
          { label: 'Bookings Tracked', value: bookings.length, icon: Calendar, color: '#34d399' },
          { label: 'Registered Users', value: usersList.length, icon: Users, color: '#c084fc' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#fbbf24' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{value}</div>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: 'var(--bg-card)', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>Users ({usersList.length})</button>
        <button style={tabStyle('properties')} onClick={() => setActiveTab('properties')}>Properties ({properties.length})</button>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>Bookings ({bookings.length})</button>
        <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>Payments ({payments.length})</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}><AlertCircle size={16} /> {error}</div>}

      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '80px', animation: 'pulse 1.5s infinite' }}></div>)}
        </div>
      ) : (
        <>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Recent bookings */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No bookings yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {bookings.slice(0, 5).map(b => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(30,41,59,0.4)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Booking #{b.id}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Property #{b.propertyId} • Tenant #{b.tenantId}</div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent payments */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Recent Payments</h3>
                {payments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No payments yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {payments.slice(0, 5).map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(30,41,59,0.4)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Payment #{p.id}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.paymentMethod} • {formatDate(p.createdAt)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={14} />{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>All Registered Users ({usersList.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Username', 'Full Name', 'Email', 'Phone', 'Role'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{u.id}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>{u.username}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>{u.fullName || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{u.phoneNumber || 'N/A'}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {(u.role || 'ROLE_TENANT').replace('ROLE_', '')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>All Properties ({properties.length})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['ID', 'Title', 'City', 'Type', 'Rent', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{p.id}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', fontWeight: '600', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.city}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem' }}>{(p.propertyType || '').replace('_', ' ')}</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <IndianRupee size={13} />{Number(p.rentAmount).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', backgroundColor: p.available ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: p.available ? '#34d399' : '#f87171' }}>
                          {p.available ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <button onClick={() => handleDeleteProperty(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.3rem' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>All Bookings ({bookings.length})</h3>
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No bookings in the system.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {['ID', 'Property', 'Tenant', 'Start Date', 'End Date', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{b.id}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{b.propertyId}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{b.tenantId}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(b.startDate)}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(b.endDate)}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>All Payments ({payments.length})</h3>
              {payments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No payments in the system.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {['ID', 'Booking', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{p.id}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem' }}>#{p.bookingId}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={13} />{Number(p.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.paymentMethod}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}><StatusBadge status={p.status} /></td>
                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
