import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Plus, Trash2, Eye, IndianRupee, Calendar,
  CheckCircle, XCircle, Home, MapPin, Bed, Bath, Clock, Users, Edit,
  ShieldCheck, FileText, CalendarCheck, Download, UserCheck, RefreshCw, AlertCircle, Shield, ShieldAlert, Image
} from 'lucide-react';

const statusColors = {
  PENDING: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
  CONFIRMED: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  CANCELLED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  DECLINED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  REFUND_PENDING: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)', text: '#d97706' },
  TOKEN_PAID: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#818cf8' },
  APPLICATION_DRAFT: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' },
  PENDING_OWNER_APPROVAL: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

const StatusBadge = ({ status }) => {
  const c = statusColors[status] || statusColors.PENDING;
  const displayLabel = status === 'TOKEN_PAID' ? 'AWAITING VERIFICATION'
    : status === 'PENDING_OWNER_APPROVAL' ? 'PENDING REVIEW'
    : status === 'APPLICATION_DRAFT' ? 'DRAFT'
    : status;
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text, textTransform: 'uppercase' }}>
      {displayLabel}
    </span>
  );
};

const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [deletingId, setDeletingId] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  // Persistent Owner Contact states
  const [ownerContactProfile, setOwnerContactProfile] = useState({ fullName: '', contactPhone: '', contactEmail: '', preferredContactMethod: 'Phone' });
  const [loadingContactProfile, setLoadingContactProfile] = useState(true);
  const [savingContactProfile, setSavingContactProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Selective sharing checkboxes
  const [sharePhone, setSharePhone] = useState(true);
  const [shareEmail, setShareEmail] = useState(true);

  // Verification & Meetup Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verification, setVerification] = useState(null);
  const [profileVerification, setProfileVerification] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  // Owner review check
  const [docsReviewed, setDocsReviewed] = useState(false);

  // Meetup fields
  const [meetupsList, setMeetupsList] = useState([]);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetupMessage, setMeetupMessage] = useState('');
  const [schedulingMeetup, setSchedulingMeetup] = useState(false);

  // Reject reason dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Contact Share dialog (shown when owner approves)
  const [showContactShareDialog, setShowContactShareDialog] = useState(false);
  const [contactShareForm, setContactShareForm] = useState({ fullName: '', phone: '', email: '', preferredContactMethod: 'Phone', message: '' });
  const [savingContactShare, setSavingContactShare] = useState(false);

  // Image Manager Modal states
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [managerImages, setManagerImages] = useState([]);
  const [managerSaving, setManagerSaving] = useState(false);
  const [managerError, setManagerError] = useState('');

  const openImageManager = (property) => {
    setSelectedProperty(property);
    setManagerImages(property.imageUrls ? splitImageUrls(property.imageUrls) : []);
    setManagerError('');
  };

  const handleManagerFileUpload = (e) => {
    setManagerError('');
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setManagerError('Please upload a valid JPG, JPEG, PNG or WebP image.');
        return;
      }
      if (file.size > maxSize) {
        setManagerError('Image file size must be less than 5MB.');
        return;
      }
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManagerImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeManagerImage = (index) => {
    setManagerImages(prev => prev.filter((_, i) => i !== index));
  };

  const setManagerImageAsCover = (index) => {
    setManagerImages(prev => {
      const newImgs = [...prev];
      const item = newImgs.splice(index, 1)[0];
      newImgs.unshift(item);
      return newImgs;
    });
  };

  const handleSaveImages = async () => {
    if (!selectedProperty) return;
    setManagerSaving(true);
    setManagerError('');
    try {
      const payload = {
        title: selectedProperty.title,
        description: selectedProperty.description,
        address: selectedProperty.address,
        city: selectedProperty.city,
        rentAmount: selectedProperty.rentAmount,
        propertyType: selectedProperty.propertyType,
        bedrooms: selectedProperty.bedrooms,
        bathrooms: selectedProperty.bathrooms,
        locality: selectedProperty.locality,
        furnishing: selectedProperty.furnishing,
        area: selectedProperty.area,
        securityDeposit: selectedProperty.securityDeposit,
        imageUrls: managerImages.length > 0 ? managerImages.join('|') : '',
        amenities: selectedProperty.amenities || '',
        state: selectedProperty.state,
        latitude: selectedProperty.latitude,
        longitude: selectedProperty.longitude
      };

      const res = await api.put(`/properties/${selectedProperty.id}`, payload, {
        headers: { 'X-User-Id': user.userId }
      });

      setProperties(prev => prev.map(p => p.id === selectedProperty.id ? res.data : p));
      setSelectedProperty(null);
      alert('Property images updated successfully.');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      setManagerError('Failed to save images: ' + errMsg);
    } finally {
      setManagerSaving(false);
    }
  };

  const loadOwnerContactProfile = async () => {
    if (!user) return;
    try {
      setLoadingContactProfile(true);
      const res = await api.get(`/auth/users/${user.userId}`);
      setOwnerContactProfile({
        fullName: res.data.fullName || '',
        contactPhone: res.data.contactPhone || '',
        contactEmail: res.data.contactEmail || user.email || '',
        preferredContactMethod: res.data.preferredContactMethod || 'Phone'
      });
    } catch (err) {
      console.error("Failed to load owner contact profile", err);
    } finally {
      setLoadingContactProfile(false);
    }
  };

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const propRes = await api.get(`/properties/owner/${user.userId}`);
      const propList = propRes.data || [];
      setProperties(propList);

      const bookingsPromises = propList.map(p => 
        api.get(`/bookings/property/${p.id}`)
          .then(res => res.data || [])
          .catch(() => [])
      );
      
      const results = await Promise.all(bookingsPromises);
      const allBookings = results.flat();
      allBookings.sort((a, b) => b.id - a.id);
      setBookings(allBookings);

      let totalEarned = 0;
      try {
        const payRes = await api.get('/payments');
        const payList = payRes.data || [];
        const ownerBookingIds = new Set(allBookings.map(b => b.id));
        const ownerPayments = payList.filter(p => ownerBookingIds.has(p.bookingId) && p.status === 'COMPLETED');
        totalEarned = ownerPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      } catch (payErr) {
        console.error('Error loading payments:', payErr);
      }
      setTotalEarnings(totalEarned);
    } catch (err) {
      console.error('Error loading owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadOwnerContactProfile();
  }, [user]);

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    try {
      setDeletingId(propertyId);
      await api.delete(`/properties/${propertyId}`);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setBookings(prev => prev.filter(b => b.propertyId !== propertyId));
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  // Opens booking details popup and fetches tenant credentials + meetup lists
  const handleOpenDetails = async (booking) => {
    setSelectedBooking(booking);
    setVerification(null);
    setVerificationError('');
    setDocsReviewed(false);
    setMeetupsList([]);
    setProfileVerification(null);

    try {
      const pvRes = await api.get(`/bookings/tenant/${booking.tenantId}/police-verification`);
      setProfileVerification(pvRes.data);
    } catch (err) {
      console.error('Error loading tenant profile verification', err);
    }

    // Set default meeting location to the property location if matches
    const prop = properties.find(p => p.id === booking.propertyId);
    if (prop) {
      setMeetingLocation(`${prop.title}, ${prop.city}`);
    } else {
      setMeetingLocation('');
    }

    setLoadingVerification(true);
    try {
      const vRes = await api.get(`/bookings/${booking.id}/verification`);
      setVerification(vRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setVerificationError('Tenant has not submitted verification details yet.');
      } else {
        setVerificationError('Error retrieving verification profile.');
      }
    }

    try {
      const mRes = await api.get(`/bookings/${booking.id}/meetups`);
      setMeetupsList(mRes.data || []);
    } catch (err) {
      console.error('Error loading meetups', err);
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleBookingAction = async (bookingId, newStatus) => {
    try {
      setActioningId(bookingId);
      
      // 1. Call API to update booking status
      await api.patch(`/bookings/${bookingId}/status?status=${newStatus}`);
      
      // 2. Persist decline reason locally or in memory if needed
      if ((newStatus === 'DECLINED' || newStatus === 'REJECTED') && rejectionReason) {
        localStorage.setItem(`reject_reason_${bookingId}`, rejectionReason);
      }

      // 3. If declining/rejecting request, trigger backend refund
      if (newStatus === 'DECLINED' || newStatus === 'REJECTED') {
        try {
          const payRes = await api.get(`/payments/booking/${bookingId}`);
          const paymentList = payRes.data || [];
          for (const p of paymentList) {
            if (p.status === 'COMPLETED' || p.status === 'SUCCESS') {
              await api.post(`/payments/${p.id}/refund`);
            }
          }
        } catch (errPay) {
          console.error('Error mapping refund updates:', errPay);
        }
      }

      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      setSelectedBooking(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (err) {
      alert(`Failed to update booking status.`);
    } finally {
      setActioningId(null);
    }
  };

  const handleApproveWithContact = async () => {
    if (!selectedBooking) return;
    try {
      setSavingContactShare(true);

      // Save default contact details to profile if currently empty
      if (!ownerContactProfile.contactPhone || !ownerContactProfile.contactEmail) {
        await api.put(`/auth/users/${user.userId}/contact`, {
          contactPhone: contactShareForm.phone,
          contactEmail: contactShareForm.email,
          preferredContactMethod: contactShareForm.preferredContactMethod
        });
        setOwnerContactProfile({
          fullName: contactShareForm.fullName,
          contactPhone: contactShareForm.phone,
          contactEmail: contactShareForm.email,
          preferredContactMethod: contactShareForm.preferredContactMethod
        });
      }

      // Build payload based on checkboxes
      const payload = {
        fullName: contactShareForm.fullName,
        phone: sharePhone ? contactShareForm.phone : '',
        email: shareEmail ? contactShareForm.email : '',
        preferredContactMethod: contactShareForm.preferredContactMethod,
        message: contactShareForm.message
      };

      await api.post(`/bookings/${selectedBooking.id}/approve-with-contact`, payload);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'APPROVED' } : b));
      setShowContactShareDialog(false);
      setSelectedBooking(null);
      alert('Booking approved and your selected contact details have been shared with the tenant.');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert('Failed to approve booking: ' + errMsg);
    } finally {
      setSavingContactShare(false);
    }
  };


  // Creates physical meetup
  const handleScheduleMeetup = async (e) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime || !meetingLocation) {
      alert('Please fill out all meetup parameters.');
      return;
    }

    setSchedulingMeetup(true);
    try {
      const payload = {
        bookingId: selectedBooking.id,
        meetingDate,
        meetingTime,
        location: meetingLocation,
        message: meetupMessage
      };

      await api.post(`/bookings/${selectedBooking.id}/meetup`, payload);
      
      // Reload meetups list
      const mRes = await api.get(`/bookings/${selectedBooking.id}/meetups`);
      setMeetupsList(mRes.data || []);
      
      // Clear fields
      setMeetingDate('');
      setMeetingTime('');
      setMeetupMessage('');
      alert('Meetup request sent successfully!');
    } catch (err) {
      alert('Failed to schedule meetup.');
    } finally {
      setSchedulingMeetup(false);
    }
  };

  // Responds to counter proposals
  const handleAcceptCounter = async (meetup) => {
    try {
      const payload = {
        status: 'ACCEPTED',
        meetingDate: meetup.counterDate,
        meetingTime: meetup.counterTime
      };
      await api.put(`/bookings/meetup/${meetup.id}/status`, payload);
      
      // Reload meetups list
      const mRes = await api.get(`/bookings/${selectedBooking.id}/meetups`);
      setMeetupsList(mRes.data || []);
      alert('Rescheduled slot accepted!');
    } catch (err) {
      alert('Failed to accept proposed reschedule.');
    }
  };

  const handleCompleteMeetup = async (meetupId) => {
    try {
      await api.put(`/bookings/meetup/${meetupId}/status`, { status: 'COMPLETED' });
      // Reload meetups
      const mRes = await api.get(`/bookings/${selectedBooking.id}/meetups`);
      setMeetupsList(mRes.data || []);
    } catch (err) {
      alert('Failed to mark meetup as completed.');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem', border: 'none',
    backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-muted)',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s'
  });

  const pendingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'PENDING_OWNER_APPROVAL').length;
  const awaitingVerificationBookings = bookings.filter(b => b.status === 'TOKEN_PAID' || b.status === 'APPLICATION_DRAFT').length;

  const getPropertyName = (propertyId) => {
    const p = properties.find(prop => prop.id === propertyId);
    return p ? p.title : `Property #${propertyId}`;
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Owner Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your properties and review tenant applications</p>
        </div>
        <Link to="/owner/property/add" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'My Properties', value: properties.length, icon: Building2, color: '#6366f1' },
          { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: '#34d399' },
          { label: 'Awaiting Action', value: pendingBookings + awaitingVerificationBookings, icon: Clock, color: '#fbbf24' },
          { label: 'Total Earnings', value: `₹${Number(totalEarnings).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#10b981' },
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
        <button style={tabStyle('properties')} onClick={() => setActiveTab('properties')}>
          My Properties ({properties.length})
        </button>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
          Bookings {(pendingBookings + awaitingVerificationBookings) > 0 && (
            <span style={{ marginLeft: '0.4rem', padding: '0.1rem 0.45rem', borderRadius: '10px', backgroundColor: '#fbbf24', color: '#000', fontSize: '0.7rem', fontWeight: '800' }}>
              {pendingBookings + awaitingVerificationBookings}
            </span>
          )}
        </button>
        <button style={tabStyle('contact')} onClick={() => setActiveTab('contact')}>
          Contact Profile Settings
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '280px', animation: 'pulse 1.5s infinite' }}></div>)}
        </div>
      ) : activeTab === 'properties' ? (
        properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Building2 size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No properties yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>List your first property to start receiving bookings.</p>
            <Link to="/owner/property/add" className="btn btn-primary">Add Property</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {properties.map(p => (
              <div key={p.id} className="glass-card" style={{ overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={p.imageUrls ? (splitImageUrls(p.imageUrls)[0] || FALLBACK) : FALLBACK} alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = FALLBACK; }} />
                  <span style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700',
                    backgroundColor: p.available ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white'
                  }}>
                    {p.available ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontWeight: '750', fontSize: '1.05rem', marginBottom: '0.35rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                    <MapPin size={13} /> {p.city}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Bed size={14} /> {p.bedrooms}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Bath size={14} /> {p.bathrooms}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-color)', fontWeight: '800' }}>
                      <IndianRupee size={14} />{Number(p.rentAmount).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/properties/${p.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                      <Eye size={14} /> View
                    </Link>
                    <Link to={`/owner/property/edit/${p.id}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit size={14} />
                    </Link>
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                      className="btn btn-sm" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={14} /> {deletingId === p.id ? '...' : 'Delete'}
                    </button>
                  </div>
                  <button 
                    onClick={() => openImageManager(p)}
                    className="btn btn-secondary btn-sm" 
                    style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Image size={14} /> Manage Images ({p.imageUrls ? splitImageUrls(p.imageUrls).length : 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'bookings' ? (
        /* Bookings tab */
        bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Calendar size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
            <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No bookings yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Booking requests for your properties will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Booking #{b.id}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{getPropertyName(b.propertyId)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> Tenant #{b.tenantId}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(b.status === 'PENDING' || b.status === 'TOKEN_PAID' || b.status === 'PENDING_OWNER_APPROVAL') ? (
                    <button 
                      onClick={() => handleOpenDetails(b)} 
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <UserCheck size={14} /> View Tenant & Review
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleOpenDetails(b)} 
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </button>
                  )}
                  <Link to={`/properties/${b.propertyId}`} className="btn btn-secondary btn-sm">
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}

      {/* VIEW APPLICATION & VERIFICATION DETAILS MODAL OVERLAY */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div className="glass-card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', border: '1px solid var(--border-color)', backgroundColor: '#ffffff', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  Rental Application Review
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Booking ID: #{selectedBooking.id} | Property: <strong>{getPropertyName(selectedBooking.propertyId)}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', fontWeight: '300' }}
              >
                &times;
              </button>
            </div>

            {loadingVerification ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', animation: 'spin 2s linear infinite' }} />
                <p>Retrieving Tenant Verification Profile...</p>
              </div>
            ) : verificationError ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <AlertCircle size={40} color="#fbbf24" style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.5rem' }}>{verificationError}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setSelectedBooking(null)} className="btn btn-secondary btn-sm">Close Review</button>
                  <button 
                    onClick={() => handleBookingAction(selectedBooking.id, 'DECLINED')}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                  >
                    Decline Request
                  </button>
                </div>
              </div>
            ) : verification ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
                  
                  {/* Left Column: Tenant Credentials */}
                  <div>
                    {/* Basic info */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                        Tenant Credentials
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Full Legal Name</td>
                            <td style={{ padding: '0.5rem 0', fontWeight: '700', color: 'var(--text-main)' }}>{verification.fullName}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>CCTNS Verification</td>
                            <td style={{ padding: '0.5rem 0', fontWeight: '700' }}>
                              {profileVerification?.status === 'VERIFIED' ? (
                                <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <ShieldCheck size={14} /> ✓ CCTNS VERIFIED
                                </span>
                              ) : profileVerification?.status === 'PENDING_VERIFICATION' ? (
                                <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={14} /> PENDING REVIEW
                                </span>
                              ) : (
                                <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <ShieldAlert size={14} /> UNVERIFIED / NOT SUBMITTED
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Date of Birth</td>
                            <td style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--text-main)' }}>{verification.dateOfBirth}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Current City & Address</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>{verification.currentCity}, {verification.currentAddress}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Professional Profile</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}><strong>{verification.occupation}</strong> at {verification.companyName || 'N/A'}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Monthly Income</td>
                            <td style={{ padding: '0.5rem 0', fontWeight: '700', color: '#10b981' }}>{verification.monthlyIncome}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Stay Specifications</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>{verification.expectedDuration} | From {verification.expectedMoveInDate}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Occupants count</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>{verification.occupantsCount} occupant(s) ({verification.relationship || 'Self'})</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Pets / Smoking</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>
                              Pets: {verification.pets ? `Yes (${verification.petType}, Qty: ${verification.numberOfPets})` : 'No'} | {verification.smokingPreference}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Reason for Renting</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)', fontStyle: 'italic' }}>"{verification.reasonForRenting}"</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>Emergency Contact</td>
                            <td style={{ padding: '0.5rem 0', color: 'var(--text-main)' }}>{verification.emergencyContactName} ({verification.emergencyContactRelationship}) - {verification.emergencyContactNumber}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Document Previews */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                        Uploaded Audits
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        
                        {/* ID Document Proof */}
                        <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={18} color="var(--primary-color)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{verification.documentType} ({verification.documentFileName || 'Identity-Proof.png'})</span>
                          </div>
                          {verification.documentData && (
                            <a 
                              href={verification.documentData} 
                              download={verification.documentFileName || 'Identity-Proof.png'}
                              className="btn btn-secondary btn-sm" 
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Download size={12} /> Download
                            </a>
                          )}
                        </div>

                        {/* In-browser image preview */}
                        {verification.documentData && verification.documentData.startsWith('data:image') && (
                          <div style={{ textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', backgroundColor: '#fafafa' }}>
                            <img src={verification.documentData} alt="identity preview" style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        )}

                        {/* Police Status */}
                        <div style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShieldCheck size={18} color="#10b981" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                              Police Status: <strong>{verification.policeVerificationStatus}</strong>
                            </span>
                          </div>
                          {verification.policeVerificationCertificate && (
                            <a 
                              href={verification.policeVerificationCertificate} 
                              download={verification.policeCertificateFileName || 'police-certificate.pdf'}
                              className="btn btn-secondary btn-sm" 
                              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Download size={12} /> Download Cert
                            </a>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Right Column: Meetups Negotiation & Actions */}
                  <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                    
                    {/* Meetup Schedule Panel */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                        Physical Meetup scheduler
                      </h4>

                      <form onSubmit={handleScheduleMeetup} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem', margin: '0 0 2px 0' }}>Preferred Date</label>
                          <input 
                            type="date" 
                            className="form-control form-control-sm"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem', margin: '0 0 2px 0' }}>Time Slot</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="e.g. 11:00 AM - 1:00 PM"
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem', margin: '0 0 2px 0' }}>Meeting Location</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm"
                            placeholder="e.g. Cafe Coffee Day"
                            value={meetingLocation}
                            onChange={(e) => setMeetingLocation(e.target.value)}
                            required 
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem', margin: '0 0 2px 0' }}>Invitation Message</label>
                          <textarea 
                            className="form-control form-control-sm" 
                            rows="2"
                            placeholder="Please come with original documents..."
                            value={meetupMessage}
                            onChange={(e) => setMeetupMessage(e.target.value)}
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="btn btn-secondary btn-sm"
                          disabled={schedulingMeetup}
                        >
                          {schedulingMeetup ? 'Sending...' : 'Schedule physical meetup'}
                        </button>
                      </form>
                    </div>

                    {/* Scheduled Meetup list */}
                    {meetupsList.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ fontSize: '0.825rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Arrangement logs:</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {meetupsList.map(m => (
                            <div key={m.id} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '0.775rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '0.25rem' }}>
                                <span>{m.meetingDate} ({m.meetingTime})</span>
                                <span style={{ color: m.status === 'ACCEPTED' ? '#10b981' : '#d97706' }}>{m.status}</span>
                              </div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Loc: {m.location}</div>
                              
                              {/* Counterproposal details */}
                              {m.status === 'RESCHEDULE_REQUESTED' && (
                                <div style={{ marginTop: '0.5rem', padding: '0.4rem', border: '1px dashed #fbbf24', borderRadius: '4px', backgroundColor: '#fffbeb', color: '#b45309' }}>
                                  <strong>Tenant Counter Proposal:</strong> {m.counterDate} at {m.counterTime}. Message: "{m.counterMessage}"
                                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem' }}>
                                    <button 
                                      onClick={() => handleAcceptCounter(m)}
                                      className="btn btn-primary btn-sm" 
                                      style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
                                    >
                                      Accept Slot
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Complete meetup option if accepted */}
                              {m.status === 'ACCEPTED' && (
                                <button 
                                  onClick={() => handleCompleteMeetup(m.id)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
                                >
                                  Complete meetup audit
                                </button>
                              )}

                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Verification checklist checkbox & Decisions */}
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  
                  {/* Reviewed by Owner Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="reviewedCheck" 
                      checked={docsReviewed}
                      onChange={(e) => setDocsReviewed(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="reviewedCheck" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534', cursor: 'pointer', margin: 0 }}>
                      I verify that I have reviewed the tenant's government identification cards and credentials.
                    </label>
                  </div>

                  {/* Reject Dialog section */}
                  {showRejectDialog ? (
                    <div style={{ padding: '1rem', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: '#fef2f2', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#b91c1c', marginBottom: '0.5rem' }}>Reject Application Confirmation</h4>
                      <p style={{ fontSize: '0.8rem', color: '#991b1b', marginBottom: '0.75rem' }}>
                        Declining this application will automatically cancel the booking and prompt a full token refund back to the tenant's payment method.
                      </p>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-main)' }}>Reason for rejection (Will be displayed to tenant) *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Property rules conflict / Pet policy..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }} className="btn btn-secondary btn-sm">Cancel</button>
                        <button 
                          onClick={() => handleBookingAction(selectedBooking.id, 'DECLINED')}
                          disabled={actioningId === selectedBooking.id || !rejectionReason.trim()}
                          className="btn btn-sm"
                          style={{ backgroundColor: '#ef4444', color: 'white', border: '1px solid #ef4444' }}
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setShowRejectDialog(true)}
                        disabled={actioningId === selectedBooking.id}
                        className="btn btn-sm"
                        style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.65rem 1.5rem' }}
                      >
                        Decline Application
                      </button>
                      
                      <button 
                        onClick={() => {
                           setContactShareForm({
                             fullName: ownerContactProfile.fullName || user?.fullName || '',
                             phone: ownerContactProfile.contactPhone || '',
                             email: ownerContactProfile.contactEmail || '',
                             preferredContactMethod: ownerContactProfile.preferredContactMethod || 'Phone',
                             message: ''
                           });
                          setShowContactShareDialog(true);
                        }}
                        disabled={actioningId === selectedBooking.id || !docsReviewed}
                        className="btn btn-primary"
                        style={{ padding: '0.65rem 2rem', opacity: docsReviewed ? 1 : 0.6 }}
                      >
                        Approve & Share Contact Details
                      </button>
                    </div>
                  )}

                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Contact Profile Settings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Set up your default contact details. These are saved in your profile and can be selectively shared when approving tenant bookings.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                setSavingContactProfile(true);
                setProfileError('');
                setProfileSuccess('');
                const res = await api.put(`/auth/users/${user.userId}/contact`, ownerContactProfile);
                setOwnerContactProfile({
                  contactPhone: res.data.contactPhone || '',
                  contactEmail: res.data.contactEmail || user.email || '',
                  preferredContactMethod: res.data.preferredContactMethod || 'Phone'
                });
                setProfileSuccess('Contact profile updated successfully!');
              } catch (err) {
                setProfileError('Failed to update contact settings.');
              } finally {
                setSavingContactProfile(false);
              }
            }} style={{ display: 'grid', gap: '1rem' }}>
              {profileError && <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>{profileError}</div>}
              {profileSuccess && <div className="alert alert-success" style={{ fontSize: '0.85rem' }}>{profileSuccess}</div>}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Default Contact Phone *</label>
                <input className="form-control" value={ownerContactProfile.contactPhone} onChange={e => setOwnerContactProfile(prev => ({ ...prev, contactPhone: e.target.value }))} placeholder="+91 XXXXX XXXXX" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Default Contact Email *</label>
                <input className="form-control" type="email" value={ownerContactProfile.contactEmail} onChange={e => setOwnerContactProfile(prev => ({ ...prev, contactEmail: e.target.value }))} placeholder="email@example.com" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Preferred Contact Method</label>
                <select className="form-select" value={ownerContactProfile.preferredContactMethod} onChange={e => setOwnerContactProfile(prev => ({ ...prev, preferredContactMethod: e.target.value }))}>
                  {['Phone', 'Email', 'WhatsApp', 'Any'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <button className="btn btn-primary" type="submit" disabled={savingContactProfile} style={{ marginTop: '0.5rem' }}>
                {savingContactProfile ? 'Saving...' : 'Save Default Contact Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Contact Share Dialog */}
      {showContactShareDialog && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Approve & Share Contact</h3>
            
            {(!ownerContactProfile.contactPhone || !ownerContactProfile.contactEmail) ? (
              <div className="alert alert-warning" style={{ fontSize: '0.8rem', padding: '0.75rem', marginBottom: '1rem', display: 'flex', gap: '0.4rem' }}>
                <span>⚠️ You haven't saved default contact details in your profile yet. Details filled below will be saved as your profile defaults.</span>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Select which contact details you would like to share for this booking request.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Your Name (shared) *</label>
                <input className="form-control" value={contactShareForm.fullName} onChange={e => setContactShareForm(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Your name" required />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Phone Number</label>
                <input className="form-control" value={contactShareForm.phone} onChange={e => setContactShareForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sharePhone} onChange={e => setSharePhone(e.target.checked)} />
                  Share phone number with tenant
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Email</label>
                <input className="form-control" type="email" value={contactShareForm.email} onChange={e => setContactShareForm(prev => ({ ...prev, email: e.target.value }))} placeholder="your@email.com" />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', marginTop: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={shareEmail} onChange={e => setShareEmail(e.target.checked)} />
                  Share email address with tenant
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Preferred Contact Method</label>
                <select className="form-select" value={contactShareForm.preferredContactMethod} onChange={e => setContactShareForm(prev => ({ ...prev, preferredContactMethod: e.target.value }))}>
                  {['Phone', 'Email', 'WhatsApp', 'Any'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>Message to Tenant (optional)</label>
                <textarea className="form-control" rows={2} value={contactShareForm.message} onChange={e => setContactShareForm(prev => ({ ...prev, message: e.target.value }))} placeholder="e.g. Please call me between 10am-6pm" style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowContactShareDialog(false)} disabled={savingContactShare}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleApproveWithContact} disabled={savingContactShare || !contactShareForm.fullName}>
                {savingContactShare ? 'Approving...' : 'Confirm Approval & Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Manager Modal */}
      {selectedProperty && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '650px', backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)', borderRadius: '12px',
            padding: '2rem', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Manage Property Images
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Upload new photos, delete old ones, or reorder to set the primary cover image.
            </p>

            {managerError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                {managerError}
              </div>
            )}

            {/* Photo Uploader */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleManagerFileUpload} 
                style={{ display: 'none' }} 
                id="manager-file-upload" 
              />
              <label 
                htmlFor="manager-file-upload" 
                className="btn btn-secondary" 
                style={{ display: 'inline-flex', cursor: 'pointer', gap: '0.5rem', fontSize: '0.9rem' }}
              >
                Upload Images
              </label>
            </div>

            {/* Images Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
              gap: '1rem', 
              marginBottom: '2rem' 
            }}>
              {managerImages.map((base64Url, index) => {
                const isCover = index === 0;
                return (
                  <div key={index} style={{
                    position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden',
                    border: isCover ? '2px solid var(--primary-color)' : '1px solid var(--border-color)'
                  }}>
                    <img src={base64Url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.src = FALLBACK; }} />
                    
                    {isCover && (
                      <span style={{ 
                        position: 'absolute', top: '4px', left: '4px',
                        backgroundColor: 'var(--primary-color)', color: 'white',
                        fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 4px', borderRadius: '3px'
                      }}>
                        Cover
                      </span>
                    )}

                    <div style={{
                      position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '2px'
                    }}>
                      {!isCover && (
                        <button 
                          type="button" 
                          onClick={() => setManagerImageAsCover(index)}
                          title="Set as Cover"
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#fbbf24',
                            width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                          }}
                        >
                          ★
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => removeManagerImage(index)}
                        title="Delete Image"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#ff4d4f',
                          width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setSelectedProperty(null)} 
                disabled={managerSaving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }} 
                onClick={handleSaveImages} 
                disabled={managerSaving}
              >
                {managerSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
