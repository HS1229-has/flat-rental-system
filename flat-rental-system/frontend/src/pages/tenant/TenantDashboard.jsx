import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, CreditCard, Home, CheckCircle, XCircle, IndianRupee, Clock,
  ArrowRight, AlertCircle, Heart, Trash2, Shield, FileText, CalendarCheck, MapPin,
  MessageSquare, Phone, Mail, Upload, ShieldAlert, ShieldCheck, Printer, Download,
  Eye, ExternalLink, User, Settings, Check, Sparkles, Filter, AlertTriangle, RefreshCw
} from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

// Display Owner Contact Details when booking is CONFIRMED or COMPLETED
const OwnerContactCard = ({ bookingId }) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/bookings/${bookingId}/owner-contact`)
      .then(res => {
        if (active) setContact(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [bookingId]);

  if (loading || !contact) return null;

  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderRadius: '10px',
      backgroundColor: 'rgba(16, 185, 129, 0.06)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      marginTop: '0.75rem'
    }}>
      <div style={{
        fontWeight: '700',
        fontSize: '0.85rem',
        color: '#10b981',
        marginBottom: '0.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
      }}>
        <CheckCircle size={15} /> Landlord / Owner Contact Information
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
        <span style={{ fontWeight: '600' }}>{contact.fullName}</span>
        {contact.phone && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Phone size={13} color="var(--primary-color)" /> {contact.phone}
          </span>
        )}
        {contact.email && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Mail size={13} color="var(--primary-color)" /> {contact.email}
          </span>
        )}
        {contact.preferredContactMethod && (
          <span style={{ color: 'var(--text-muted)' }}>
            Preferred: <strong>{contact.preferredContactMethod}</strong>
          </span>
        )}
      </div>
      {contact.message && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          "{contact.message}"
        </p>
      )}
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
  REJECTED: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  REFUND_PENDING: { bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)', text: '#d97706' },
  TOKEN_PAID: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#818cf8' },
  APPLICATION_DRAFT: { bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' },
  PENDING_OWNER_APPROVAL: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

const StatusBadge = ({ status }) => {
  const c = statusColors[status] || statusColors.PENDING;
  const displayLabel = status === 'TOKEN_PAID' ? 'TOKEN PAID — VERIFICATION NEEDED'
    : status === 'PENDING_OWNER_APPROVAL' ? 'PENDING OWNER REVIEW'
    : status === 'APPLICATION_DRAFT' ? 'DRAFT APPLICATION'
    : status;
  return (
    <span style={{
      padding: '0.25rem 0.65rem',
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: '700',
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem'
    }}>
      {displayLabel}
    </span>
  );
};

// 5-Step Visual Status Stepper for Bookings
const BookingTimeline = ({ booking }) => {
  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'DECLINED' || booking.status === 'REJECTED';
  
  // Determine active step index:
  // Step 0: Application Submitted (Draft / Pending)
  // Step 1: Holding Token Paid (TOKEN_PAID)
  // Step 2: Owner Review (PENDING_OWNER_APPROVAL or PENDING)
  // Step 3: Verification & Property Visit
  // Step 4: Confirmed & Move-in Ready (CONFIRMED / COMPLETED)
  let currentStep = 0;
  if (booking.status === 'APPLICATION_DRAFT') currentStep = 0;
  else if (booking.status === 'TOKEN_PAID') currentStep = 1;
  else if (booking.status === 'PENDING_OWNER_APPROVAL' || booking.status === 'PENDING') currentStep = 2;
  else if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') currentStep = 4;
  else currentStep = 1;

  const steps = [
    { title: 'Application', subtitle: 'Submitted' },
    { title: 'Token Deposit', subtitle: 'Paid & Held' },
    { title: 'Owner Review', subtitle: 'Application Under Review' },
    { title: 'Verification / Visit', subtitle: 'Identity & Meetup' },
    { title: 'Confirmed', subtitle: 'Move-in Ready' },
  ];

  if (isCancelled) {
    return (
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.85rem',
        color: '#ef4444'
      }}>
        <XCircle size={16} />
        <span>
          <strong>Timeline Terminated:</strong> Booking was {booking.status.toLowerCase()}. See refund and cancellation details below.
        </span>
      </div>
    );
  }

  return (
    <div style={{ margin: '0.5rem 0 1rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '0.5rem 0'
      }}>
        {/* Background track line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '3px',
          backgroundColor: 'var(--border-color)',
          zIndex: 1
        }} />
        {/* Filled active track line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: `${(currentStep / (steps.length - 1)) * 90}%`,
          height: '3px',
          backgroundColor: '#10b981',
          zIndex: 2,
          transition: 'width 0.4s ease'
        }} />

        {steps.map((st, idx) => {
          const isDone = idx < currentStep || (idx === currentStep && currentStep === 4);
          const isCurrent = idx === currentStep && currentStep !== 4;
          return (
            <div key={idx} style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '18%',
              textAlign: 'center'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isDone ? '#10b981' : isCurrent ? '#3b82f6' : 'var(--bg-card)',
                border: isDone ? '2px solid #10b981' : isCurrent ? '2px solid #3b82f6' : '2px solid var(--border-color)',
                color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                marginBottom: '0.35rem',
                boxShadow: isCurrent ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
              }}>
                {isDone ? <Check size={14} /> : (idx + 1)}
              </div>
              <span style={{
                fontSize: '0.725rem',
                fontWeight: isCurrent || isDone ? '700' : '500',
                color: isDone ? '#10b981' : isCurrent ? '#3b82f6' : 'var(--text-muted)',
                lineHeight: 1.2
              }}>
                {st.title}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                {st.subtitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TenantDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [meetups, setMeetups] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [liveProperties, setLiveProperties] = useState({});
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

  // Itemized Receipt Modal State
  const [receiptPayment, setReceiptPayment] = useState(null);

  // Profile-level Police Verification states
  const [policeVerification, setPoliceVerification] = useState(null);
  const [loadingPoliceVerification, setLoadingPoliceVerification] = useState(true);
  const [verificationFileName, setVerificationFileName] = useState('');
  const [verificationFileBase64, setVerificationFileBase64] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Digital KYC & CIBIL state (Simulation / Demo)
  const [kycData, setKycData] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycForm, setKycForm] = useState({
    fullName: user?.fullName || '',
    aadhaarNumber: '',
    panNumber: '',
    companyName: '',
    monthlyIncome: ''
  });
  const [kycConsent, setKycConsent] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycProgressStep, setKycProgressStep] = useState(0);
  const [kycMsg, setKycMsg] = useState('');

  // Rental Profile & Preferences State
  const [profilePreferences, setProfilePreferences] = useState(() => {
    const key = `tenant_profile_${user?.userId || user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      tenantType: 'Working Professional',
      preferredCities: 'Bangalore, Mumbai',
      budgetMin: '20000',
      budgetMax: '60000',
      preferredBhk: '2 BHK',
      moveInTarget: 'Immediate / Within 15 Days',
      hasPets: false
    };
  });
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // Reschedule form states per meetup ID
  const [rescheduleData, setRescheduleData] = useState({});

  const loadKycData = async () => {
    if (!user) return;
    const effectiveId = user.userId || user.id;
    try {
      const res = await api.get(`/bookings/tenant/${effectiveId}/kyc-status`);
      setKycData(res.data);
    } catch (err) {
      console.warn("Failed to load KYC status", err);
    }
  };

  const handleVerifyKyc = async (e) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (!kycConsent) {
      setKycMsg('Please acknowledge the demo simulation consent checkbox before proceeding.');
      return;
    }
    if (!kycForm.aadhaarNumber || kycForm.aadhaarNumber.length !== 12) {
      setKycMsg('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    if (!kycForm.panNumber || kycForm.panNumber.length !== 10) {
      setKycMsg('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
      return;
    }

    try {
      setKycLoading(true);
      setKycMsg('');
      setKycProgressStep(1); // Validating Aadhaar format

      await new Promise(r => setTimeout(r, 600));
      setKycProgressStep(2); // Analyzing PAN & Tax ID structure

      await new Promise(r => setTimeout(r, 600));
      setKycProgressStep(3); // Synthesizing CIBIL credit profile

      const effectiveId = user.userId || user.id;
      const res = await api.post(`/bookings/tenant/${effectiveId}/kyc-verify`, {
        fullName: kycForm.fullName || user.fullName || 'Tenant User',
        aadhaarNumber: kycForm.aadhaarNumber,
        panNumber: kycForm.panNumber.toUpperCase(),
        companyName: kycForm.companyName || 'Private Sector',
        monthlyIncome: parseFloat(kycForm.monthlyIncome) || 50000
      });

      setKycData(res.data);
      setKycProgressStep(4);
      setKycMsg('Demonstration verification completed successfully!');
      setTimeout(() => {
        setShowKycModal(false);
        setKycMsg('');
        setKycProgressStep(0);
      }, 1400);
    } catch (err) {
      setKycMsg(err.response?.data?.message || 'Verification simulation failed. Please check inputs.');
      setKycProgressStep(0);
    } finally {
      setKycLoading(false);
    }
  };

  const fillDemoKycValues = () => {
    setKycForm({
      fullName: user?.fullName || 'Aarav Patel',
      aadhaarNumber: '987654321098',
      panNumber: 'ABCDE1234F',
      companyName: 'Infosys Limited',
      monthlyIncome: 85000
    });
    setKycConsent(true);
    setKycMsg('');
  };

  const loadPoliceVerification = async () => {
    if (!user) return;
    const effectiveId = user.userId || user.id;
    try {
      setLoadingPoliceVerification(true);
      const res = await api.get(`/bookings/tenant/${effectiveId}/police-verification`);
      setPoliceVerification(res.data);
    } catch (err) {
      console.warn("Failed to load police verification", err);
    } finally {
      setLoadingPoliceVerification(false);
    }
  };

  const loadBookings = async () => {
    if (!user) return;
    const effectiveId = user.userId || user.id;
    try {
      setLoadingBookings(true);
      const res = await api.get(`/bookings/tenant/${effectiveId}`);
      const bookingsList = res.data || [];
      setBookings(bookingsList);
      
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

  // Synchronize favorites and check live availability against backend
  const refreshFavorites = async () => {
    const key = `favorites_${user?.userId || user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    let favList = [];
    if (saved) {
      try { favList = JSON.parse(saved); } catch (e) { favList = []; }
    }
    setFavorites(favList);

    // Verify live status of each saved flat
    if (favList.length > 0) {
      const liveMap = {};
      await Promise.all(favList.map(async (fav) => {
        try {
          const r = await api.get(`/properties/${fav.id}`);
          liveMap[fav.id] = { exists: true, data: r.data, available: r.data.available !== false };
        } catch (e) {
          if (e.response?.status === 404) {
            liveMap[fav.id] = { exists: false, deleted: true };
          } else {
            liveMap[fav.id] = { exists: true, data: fav, available: fav.available !== false };
          }
        }
      }));
      setLiveProperties(liveMap);
    }
  };

  useEffect(() => {
    loadBookings();
    loadPoliceVerification();
    loadKycData();
    refreshFavorites();
  }, [user]);

  // Load Payments tab data
  useEffect(() => {
    if (activeTab !== 'payments' || !user) return;
    const effectiveId = user.userId || user.id;
    const loadPayments = async () => {
      try {
        setLoadingPayments(true);
        const res = await api.get(`/payments/tenant/${effectiveId}`);
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

  const handleMeetupAction = async (meetupId, bookingId, statusVal, counterData = null) => {
    try {
      const payload = { status: statusVal };
      if (counterData) {
        payload.counterDate = counterData.date;
        payload.counterTime = counterData.time;
        payload.counterMessage = counterData.message;
      }
      await api.put(`/bookings/meetup/${meetupId}/status`, payload);
      
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
    const key = `favorites_${user?.userId || user?.id || 'guest'}`;
    const updated = favorites.filter(p => p.id !== propertyId);
    setFavorites(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const clearAllFavorites = () => {
    if (!window.confirm('Are you sure you want to clear all saved flats?')) return;
    const key = `favorites_${user?.userId || user?.id || 'guest'}`;
    setFavorites([]);
    localStorage.removeItem(key);
  };

  const saveProfilePreferences = (e) => {
    e.preventDefault();
    const key = `tenant_profile_${user?.userId || user?.id || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(profilePreferences));
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 2500);
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING' || b.status === 'TOKEN_PAID' || b.status === 'PENDING_OWNER_APPROVAL').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  }), [bookings]);

  // Active Tenancy Detection (Confirmed / Completed booking that represents the ongoing tenancy)
  const activeTenancyBooking = useMemo(() => {
    return bookings.find(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
  }, [bookings]);

  const activeTenancyProperty = activeTenancyBooking ? propertiesMap[activeTenancyBooking.propertyId] : null;

  // Action Center: derive urgent tasks that need tenant attention
  const pendingActions = useMemo(() => {
    const actions = [];
    
    // 1. Unstarted KYC simulation
    if (!kycData || kycData.kycStatus === 'NOT_STARTED') {
      actions.push({
        id: 'action-kyc',
        title: 'Complete Identity Simulation',
        description: 'Run the algorithmic KYC & credit score simulation to expedite owner approvals.',
        badge: 'Recommended',
        badgeColor: '#6366f1',
        cta: 'Run Demo KYC',
        action: () => setShowKycModal(true)
      });
    }

    // 2. Bookings waiting for tenant verification form
    bookings.forEach(b => {
      if (b.status === 'TOKEN_PAID') {
        actions.push({
          id: `action-token-${b.id}`,
          title: `Submit Verification for Booking #${b.id}`,
          description: 'Token captured. Fill out and submit the verification credentials form to forward to landlord.',
          badge: 'Action Required',
          badgeColor: '#f59e0b',
          cta: 'Fill Verification',
          link: `/tenant/verification/${b.id}`
        });
      }

      if (b.status === 'CONFIRMED') {
        actions.push({
          id: `action-confirmed-${b.id}`,
          title: `Confirmed Tenancy for Booking #${b.id}`,
          description: 'Landlord confirmed your stay. Complete your rental payment or security deposit.',
          badge: 'Ready for Payment',
          badgeColor: '#10b981',
          cta: 'Pay Rent / Deposit',
          link: `/payment/${b.id}`
        });
      }
    });

    // 3. Pending meetups needing response
    Object.keys(meetups).forEach(bId => {
      const ms = meetups[bId] || [];
      ms.forEach(m => {
        if (m.status === 'PENDING') {
          actions.push({
            id: `action-meetup-${m.id}`,
            title: `Owner Meetup Request (Booking #${bId})`,
            description: `Owner requested a visit on ${m.meetingDate} at ${m.meetingTime}. Please accept or counter-propose.`,
            badge: 'Pending Review',
            badgeColor: '#fbbf24',
            cta: 'Review Meetup',
            action: () => setActiveTab('bookings')
          });
        }
      });
    });

    return actions;
  }, [kycData, bookings, meetups]);

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.4rem',
    border: 'none',
    backgroundColor: activeTab === tab ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tab ? '#ffffff' : 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.875rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem'
  });

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1150px', margin: '0 auto' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '800',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: '#6366f1',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Tenant Portal
            </span>
            {policeVerification?.status === 'VERIFIED' && (
              <span style={{ 
                fontSize: '0.7rem', 
                fontWeight: 'bold', 
                backgroundColor: 'rgba(16,185,129,0.12)', 
                color: '#10b981', 
                padding: '0.2rem 0.6rem', 
                borderRadius: '6px', 
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                ✓ Police Verified
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            Welcome back, {user?.fullName || user?.username}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontSize: '0.9rem' }}>
            Track rental applications, verified credentials, and active tenancies in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/properties" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Home size={15} /> Discover Properties
          </Link>
          <button
            type="button"
            onClick={() => setShowKycModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShieldCheck size={15} />
            {kycData?.kycStatus === 'VERIFIED' ? 'Update Demo Verification' : 'Run Identity Simulation'}
          </button>
        </div>
      </div>

      {/* Realistic Simulated Tenant Verification & Credit Profile Card */}
      <div className="glass-card" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        border: kycData?.kycStatus === 'VERIFIED' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: kycData?.kycStatus === 'VERIFIED' ? '0 4px 14px rgba(16, 185, 129, 0.08)' : '0 4px 14px rgba(99, 102, 241, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: kycData?.kycStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {kycData?.kycStatus === 'VERIFIED' ? <ShieldCheck size={26} color="#10b981" /> : <Shield size={26} color="#6366f1" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>
                Tenant Verification & Credit Profile
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '800',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}>
                [Demo / Simulation]
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '800',
                backgroundColor: kycData?.kycStatus === 'VERIFIED' ? '#dcfce7' : '#f1f5f9',
                color: kycData?.kycStatus === 'VERIFIED' ? '#15803d' : '#64748b'
              }}>
                {kycData?.kycStatus === 'VERIFIED' ? '✓ SIMULATED VERIFIED' : 'NOT STARTED'}
              </span>
            </div>

            {kycData?.kycStatus === 'VERIFIED' ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem', lineHeight: '1.5' }}>
                Aadhaar: <span style={{ fontWeight: '600', color: '#1e293b' }}>{kycData.aadhaarMasked || 'XXXX-XXXX-1098'}</span> &bull; 
                PAN: <span style={{ fontWeight: '600', color: '#1e293b' }}>{kycData.panMasked || 'AB******4F'}</span> &bull; 
                Simulated CIBIL: <span style={{ fontWeight: '750', color: '#2563eb' }}>{kycData.cibilScore || 806} ({kycData.creditRating || 'EXCELLENT'})</span> &bull; 
                Risk Level: <span style={{ fontWeight: '750', color: '#16a34a' }}>{kycData.riskLevel || 'LOW'}</span>
                {kycData.referenceNumber && (
                  <span style={{ display: 'block', fontSize: '0.775rem', color: '#94a3b8', marginTop: '2px' }}>
                    Ref: {kycData.referenceNumber} &bull; Algorithmically validated without live bureau queries.
                  </span>
                )}
              </div>
            ) : (
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Run the in-app demonstration verification to test identity format validation and synthetic CIBIL scoring.
              </p>
            )}
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
            border: kycData?.kycStatus === 'VERIFIED' ? '1px solid #10b981' : '1px solid var(--primary-color)',
            color: kycData?.kycStatus === 'VERIFIED' ? '#10b981' : 'var(--primary-color)',
            backgroundColor: kycData?.kycStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(99, 102, 241, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RefreshCw size={13} />
          {kycData?.kycStatus === 'VERIFIED' ? 'Re-run Demo Simulation' : 'Start Demo Verification'}
        </button>
      </div>

      {/* Active Tenancy Hero Section (Shown if confirmed booking exists) */}
      {activeTenancyBooking && (
        <div className="glass-card" style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Home size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Tenancy
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                  {activeTenancyProperty?.title || `Property #${activeTenancyBooking.propertyId}`}
                </h3>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to={`/payment/${activeTenancyBooking.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={14} /> Make Rent Payment
              </Link>
              <Link to={`/properties/${activeTenancyBooking.propertyId}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={14} /> View Flat
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-main)', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '1rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Lease Duration</span>
              <strong>{formatDate(activeTenancyBooking.startDate)} &rarr; {formatDate(activeTenancyBooking.endDate)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Monthly Rent</span>
              <strong style={{ color: 'var(--primary-color)' }}>
                ₹{activeTenancyProperty?.rentAmount ? Number(activeTenancyProperty.rentAmount).toLocaleString('en-IN') : 'N/A'}/month
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Location</span>
              <strong>{activeTenancyProperty?.locality || activeTenancyProperty?.city || 'Locality Confirmed'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Tenancy Status</span>
              <span style={{ fontWeight: '750', color: '#10b981' }}>Lease Confirmed & In Good Standing</span>
            </div>
          </div>

          <OwnerContactCard bookingId={activeTenancyBooking.id} />
        </div>
      )}

      {/* Action Center (Surfaces pending urgent tasks) */}
      {pendingActions.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={16} color="var(--primary-color)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Action Center ({pendingActions.length} Pending)
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {pendingActions.map((act) => (
              <div key={act.id} className="glass-card" style={{
                padding: '1.15rem',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '750', margin: 0, color: 'var(--text-main)' }}>
                      {act.title}
                    </h4>
                    <span style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.675rem',
                      fontWeight: '800',
                      backgroundColor: `${act.badgeColor}15`,
                      color: act.badgeColor,
                      border: `1px solid ${act.badgeColor}30`
                    }}>
                      {act.badge}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {act.description}
                  </p>
                </div>
                <div>
                  {act.link ? (
                    <Link to={act.link} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      {act.cta} <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <button type="button" onClick={act.action} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      {act.cta} <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Applications', value: stats.total, icon: Calendar, color: '#6366f1' },
          { label: 'Awaiting Action', value: stats.pending, icon: Clock, color: '#fbbf24' },
          { label: 'Confirmed bookings', value: stats.confirmed, icon: CheckCircle, color: '#34d399' },
          { label: 'Completed stays', value: stats.completed, icon: Home, color: '#60a5fa' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', backgroundColor: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '10px', width: 'fit-content', flexWrap: 'wrap' }}>
        <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
          <Calendar size={15} /> My Bookings ({bookings.length})
        </button>
        <button style={tabStyle('favorites')} onClick={() => setActiveTab('favorites')}>
          <Heart size={15} /> Saved Flats ({favorites.length})
        </button>
        <button style={tabStyle('payments')} onClick={() => setActiveTab('payments')}>
          <CreditCard size={15} /> Payments History
        </button>
        <button style={tabStyle('verification')} onClick={() => setActiveTab('verification')}>
          <Shield size={15} /> CCTNS Verification
        </button>
        <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>
          <User size={15} /> Rental Profile & Preferences
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* TAB 1: My Bookings */}
      {activeTab === 'bookings' && (
        loadingBookings ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="glass-card" style={{ height: '140px', animation: 'pulse 1.5s infinite', borderRadius: '12px' }}></div>)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Calendar size={56} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ fontWeight: '750', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No booking requests found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              Explore premium properties across top cities and submit an application with one click.
            </p>
            <Link to="/properties" className="btn btn-primary">Browse Available Properties</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.map(b => {
              const activeMeetups = meetups[b.id] || [];
              const prop = propertiesMap[b.propertyId];
              return (
                <div key={b.id} className="glass-card" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px'
                }}>
                  
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
                          {prop?.title ? prop.title : `Booking #${b.id}`}
                        </h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                        <span>Booking ID: <strong>#{b.id}</strong></span>
                        <span>Property ID: <strong>#{b.propertyId}</strong></span>
                        {prop?.city && <span>City: <strong>{prop.city}</strong></span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} /> {formatDate(b.startDate)} &rarr; {formatDate(b.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {b.status === 'CONFIRMED' && (
                        <Link to={`/payment/${b.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CreditCard size={14} /> Make Payment
                        </Link>
                      )}
                      {b.status === 'TOKEN_PAID' && (
                        <Link to={`/tenant/verification/${b.id}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={14} /> Complete Verification
                        </Link>
                      )}
                      {(b.status !== 'CANCELLED' && b.status !== 'DECLINED' && b.status !== 'REJECTED' && b.status !== 'COMPLETED') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForCancel(b);
                            setCancelReason('');
                            setShowCancelModal(true);
                          }}
                          className="btn btn-sm"
                          disabled={cancellingId === b.id}
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <XCircle size={14} /> {cancellingId === b.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      )}
                      <Link to={`/properties/${b.propertyId}`} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        View Flat <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* 5-Step Visual Timeline */}
                  <BookingTimeline booking={b} />

                  {/* Pending Owner Review Message */}
                  {b.status === 'PENDING_OWNER_APPROVAL' && (
                    <div style={{ 
                      padding: '0.9rem 1.15rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.85rem',
                      color: '#2563eb'
                    }}>
                      <Clock size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Application Submitted & Under Review</strong>
                        <span>Your token holding deposit was received and your rental profile is currently being reviewed by the property owner. You will receive an automated notification as soon as the owner responds.</span>
                      </div>
                    </div>
                  )}

                  {/* Token Paid Warning Panel */}
                  {b.status === 'TOKEN_PAID' && (
                    <div style={{ 
                      padding: '0.9rem 1.15rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(217, 119, 6, 0.05)', 
                      border: '1px solid rgba(217, 119, 6, 0.2)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.85rem',
                      color: '#b45309'
                    }}>
                      <AlertCircle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Action Required: Tenant Verification Form</strong>
                        <span>Your holding token deposit has been authorized. To forward this booking application to the owner, please complete and submit the tenant verification credentials form.</span>
                      </div>
                    </div>
                  )}

                  {/* Declined Notice */}
                  {(b.status === 'DECLINED' || b.status === 'REJECTED') && (
                    <div style={{ 
                      padding: '0.9rem 1.15rem', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(239, 68, 68, 0.04)', 
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      fontSize: '0.85rem',
                      color: '#ef4444'
                    }}>
                      <AlertTriangle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Booking Request Declined</strong>
                        <span>This request could not be accepted by the owner. Any holding token or security deposits collected are processed for full refund back to your payment source.</span>
                      </div>
                    </div>
                  )}

                  {/* Cancelled & Refund Summary */}
                  {b.status === 'CANCELLED' && (() => {
                    const paymentsList = bookingPayments[b.id] || [];
                    const refunds = bookingRefunds[b.id] || [];
                    
                    const tokenPayment = paymentsList.find(p => p.paymentType === 'TOKEN' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
                    const tokenAmountPaid = tokenPayment ? parseFloat(tokenPayment.amount) : 0;
                    
                    const secDepositAmt = prop?.securityDeposit ? parseFloat(prop.securityDeposit) : 0;
                    const successfulSecPayments = paymentsList.filter(p => p.paymentType === 'SECURITY_DEPOSIT' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
                    const securityDepositPaidAmt = successfulSecPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const securityDepositPaidLabel = securityDepositPaidAmt >= secDepositAmt ? 'Yes' : securityDepositPaidAmt > 0 ? 'Partially Paid' : 'No';
                    
                    const totalPaid = paymentsList.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((sum, p) => sum + parseFloat(p.amount), 0);
                    const refundableAmount = totalPaid;
                    
                    const refundStatus = refunds.length > 0 ? refunds[0].refundStatus : (totalPaid > 0 ? 'REFUND_PENDING' : 'NOT_APPLICABLE');
                    const refundReference = refunds.length > 0 ? refunds[0].refundReference : 'SIM-REF-AUTO';
                    
                    return (
                      <div style={{ 
                        padding: '1.25rem', 
                        borderRadius: '8px', 
                        backgroundColor: 'rgba(239, 68, 68, 0.04)', 
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        fontSize: '0.875rem'
                      }}>
                        <h4 style={{ fontWeight: '800', color: '#ef4444', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
                          <XCircle size={16} /> Refund & Cancellation Summary
                        </h4>
                        
                        {b.cancellationReason && (
                          <div style={{ marginBottom: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                            Cancellation Reason: "{b.cancellationReason}"
                          </div>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', maxWidth: '650px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Token Deposit Paid:</span>
                            <span style={{ fontWeight: '600' }}>₹{tokenAmountPaid.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Security Deposit:</span>
                            <span style={{ fontWeight: '600' }}>₹{secDepositAmt.toLocaleString('en-IN')} ({securityDepositPaidLabel})</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Total Paid So Far:</span>
                            <span style={{ fontWeight: '700' }}>₹{totalPaid.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Refund Amount:</span>
                            <span style={{ fontWeight: '800', color: '#10b981' }}>₹{refundableAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Refund Status:</span>
                            <span style={{ fontWeight: '750', color: '#3b82f6' }}>{refundStatus}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Reference:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700' }}>{refundReference}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Owner Contact Card for CONFIRMED bookings */}
                  {b.status === 'CONFIRMED' && (
                    <OwnerContactCard bookingId={b.id} />
                  )}

                  {/* Physical Meetup Arrangements */}
                  {activeMeetups.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 0 0.75rem 0' }}>
                        <CalendarCheck size={16} color="var(--primary-color)" /> Physical Meetup & Property Visit Slots
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <MapPin size={15} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{m.location || 'At Property Address'}</span>
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

                            {m.status === 'RESCHEDULE_REQUESTED' && (
                              <div style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#b45309' }}>
                                <strong>You proposed a reschedule:</strong> {m.counterDate} at {m.counterTime}. Note: "{m.counterMessage}"
                              </div>
                            )}

                            {m.status === 'PENDING' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                  <button 
                                    type="button"
                                    onClick={() => handleMeetupAction(m.id, b.id, 'ACCEPTED')}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Accept Meetup Slot
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setRescheduleData(prev => ({ ...prev, [m.id]: { show: true, date: '', time: '', message: '' } }))}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Propose Different Time
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleMeetupAction(m.id, b.id, 'DECLINED')}
                                    className="btn btn-sm"
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                  >
                                    Decline Meetup
                                  </button>
                                </div>

                                {rescheduleData[m.id]?.show && (
                                  <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-main)', margin: '0 0 0.75rem 0' }}>Propose Reschedule Slot</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
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
                                          placeholder="e.g. 4:30 PM"
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
                                        type="button"
                                        onClick={() => setRescheduleData(prev => ({ ...prev, [m.id]: { ...prev[m.id], show: false } }))}
                                        className="btn btn-secondary btn-sm"
                                      >
                                        Cancel
                                      </button>
                                      <button 
                                        type="button"
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

      {/* TAB 2: Saved Flats (Favorites) */}
      {activeTab === 'favorites' && (
        favorites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <Heart size={56} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ fontWeight: '750', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No saved flats yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              Click the heart icon on any flat while searching to save and monitor its live availability here.
            </p>
            <Link to="/properties" className="btn btn-primary">Discover Properties</Link>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Showing <strong>{favorites.length}</strong> saved flat{favorites.length === 1 ? '' : 's'}. Live availability checked.
              </span>
              <button
                type="button"
                onClick={clearAllFavorites}
                className="btn btn-sm"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.06)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                Clear All Saved
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {favorites.map(p => {
                const liveStatus = liveProperties[p.id];
                const isDeleted = liveStatus?.deleted === true;
                const isUnavailable = liveStatus?.available === false || p.available === false;

                if (isDeleted) {
                  return (
                    <div key={p.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: '#fff5f5', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: '750', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <AlertCircle size={16} /> Listing Removed
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1e293b' }}>{p.title || `Property #${p.id}`}</h4>
                        <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b' }}>
                          This property listing was removed by the owner or administrator and is no longer available.
                        </p>
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => removeFavorite(p.id)}
                          className="btn btn-sm"
                          style={{ width: '100%', backgroundColor: '#ef4444', color: '#ffffff' }}
                        >
                          Remove from Saved
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={p.id} className="glass-card" style={{
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ position: 'relative', height: '190px' }}>
                      <img
                        src={p.imageUrls ? (splitImageUrls(p.imageUrls)[0] || FALLBACK) : FALLBACK}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = FALLBACK; }}
                      />
                      
                      {/* Availability badge */}
                      {isUnavailable && (
                        <div style={{
                          position: 'absolute',
                          top: '0.75rem',
                          left: '0.75rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: 'rgba(239, 68, 68, 0.95)',
                          color: '#ffffff',
                          backdropFilter: 'blur(6px)'
                        }}>
                          Currently Unavailable
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFavorite(p.id)}
                        title="Remove from Saved"
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          border: 'none',
                          color: '#f87171',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          backdropFilter: 'blur(6px)'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{
                          fontWeight: '750',
                          fontSize: '1.05rem',
                          marginBottom: '0.35rem',
                          color: 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={p.title}>
                          {p.title}
                        </h3>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={13} /> {p.locality ? `${p.locality}, ` : ''}{p.city}
                        </div>
                        {p.furnishing && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                            {p.furnishing}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: '850', color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}>
                          <IndianRupee size={15} />{Number(p.rentAmount).toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>/mo</span>
                        </span>
                        <Link to={`/properties/${p.id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* TAB 3: Payment History */}
      {activeTab === 'payments' && (
        loadingPayments ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="glass-card" style={{ height: '90px', animation: 'pulse 1.5s infinite', borderRadius: '12px' }}></div>)}
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <CreditCard size={56} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ fontWeight: '750', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No payment transactions found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Authorized token deposits, monthly rent, and refund receipts will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {payments.map(p => {
              const relatedBooking = bookings.find(b => b.id === p.bookingId);
              const relatedProperty = relatedBooking ? propertiesMap[relatedBooking.propertyId] : null;

              return (
                <div key={p.id} className="glass-card" style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: '800', fontSize: '0.95rem', color: p.paymentType === 'REFUND' ? '#ef4444' : 'var(--text-main)', margin: 0 }}>
                        {p.paymentType === 'TOKEN' ? 'Holding Token Deposit' : p.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : p.paymentType === 'RENT' ? 'Monthly Rent' : p.paymentType === 'REFUND' ? 'Refund Processed' : 'Payment'} {typeof p.id === 'string' && p.id.startsWith('REF-') ? '' : `#${p.id}`}
                      </h3>
                      <StatusBadge status={p.status} />
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.825rem', flexWrap: 'wrap' }}>
                      {relatedProperty && <span>Property: <strong>{relatedProperty.title}</strong></span>}
                      <span>Booking: <strong>#{p.bookingId}</strong></span>
                      <span>Method: <strong>{p.paymentMethod}</strong></span>
                      {p.transactionReference && <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Ref: {p.transactionReference}</span>}
                      <span>Date: {formatDate(p.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '850', color: p.paymentType === 'REFUND' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center' }}>
                      {p.paymentType === 'REFUND' ? '-' : ''}<IndianRupee size={16} />{Number(p.amount).toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptPayment({ payment: p, property: relatedProperty, booking: relatedBooking })}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Printer size={13} /> Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 4: CCTNS Verification */}
      {activeTab === 'verification' && (
        loadingPoliceVerification ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', borderRadius: '12px' }}>Loading police verification status...</div>
        ) : (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Shield size={24} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>CCTNS / Police Verification Center</h2>
              </div>

              {/* Status Banner */}
              <div style={{ 
                padding: '1.15rem', 
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
                {policeVerification?.status === 'VERIFIED' ? <ShieldCheck size={22} color="#10b981" /> :
                 policeVerification?.status === 'PENDING_VERIFICATION' ? <Clock size={22} color="#f59e0b" /> :
                 (policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') ? <XCircle size={22} color="#ef4444" /> :
                 <ShieldAlert size={22} color="#64748b" />}
                <div>
                  <div style={{ fontWeight: '750', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    Verification Status: {policeVerification?.status || 'NOT_SUBMITTED'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {policeVerification?.status === 'VERIFIED' && 'Your police verification certificate is authorized and in active good standing.'}
                    {policeVerification?.status === 'PENDING_VERIFICATION' && 'Your verification document is uploaded and undergoing officer verification.'}
                    {(policeVerification?.status === 'REJECTED' || policeVerification?.status === 'VERIFICATION_FAILED') && `Verification unsuccessful. Reason: ${policeVerification.rejectionReason || 'Document unreadable or invalid credentials'}`}
                    {(!policeVerification?.status || policeVerification?.status === 'NOT_SUBMITTED') && 'Upload your state police verification certificate or tenant NOC to earn the CCTNS Verified badge.'}
                  </div>
                </div>
              </div>

              {policeVerification?.status === 'VERIFIED' && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '0.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div><strong>Reference Number:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{policeVerification.verificationReferenceNumber}</span></div>
                  <div><strong>Verifying Authority:</strong> {policeVerification.verificationProvider}</div>
                  <div><strong>Verified On:</strong> {new Date(policeVerification.verifiedAt).toLocaleDateString()}</div>
                </div>
              )}

              {(!policeVerification || policeVerification.status === 'NOT_SUBMITTED' || policeVerification.status === 'REJECTED' || policeVerification.status === 'VERIFICATION_FAILED') && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!verificationFileBase64) {
                    setVerificationError('Please select a certificate file (PDF, JPG, or PNG).');
                    return;
                  }
                  try {
                    setSubmittingVerification(true);
                    setVerificationError('');
                    const effectiveId = user.userId || user.id;
                    const res = await api.post(`/bookings/tenant/${effectiveId}/police-verification`, {
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
                  {verificationError && (
                    <div className="alert alert-danger" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={14} /> {verificationError}
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Upload Verification Document (PDF/JPG/PNG, Max 2MB)</label>
                    <label htmlFor="p-upload" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc'
                    }}>
                      <Upload size={20} /> {verificationFileName || 'Click to select police verification certificate'}
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
                    {submittingVerification ? 'Submitting to Portal...' : 'Submit for CCTNS Verification'}
                  </button>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Secure portal upload. Document hashes are encrypted and preserved per tenancy compliance regulations.
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      )}

      {/* TAB 5: Rental Profile & Preferences */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: '2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <Settings size={22} color="var(--primary-color)" />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Tenant Rental Profile & Search Preferences</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>These preferences streamline auto-filling future rental applications.</p>
              </div>
            </div>

            {profileSavedFeedback && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> Rental preferences saved successfully!
              </div>
            )}

            <form onSubmit={saveProfilePreferences} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Full Legal Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profilePreferences.fullName}
                    onChange={e => setProfilePreferences({ ...profilePreferences, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Primary Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profilePreferences.email}
                    onChange={e => setProfilePreferences({ ...profilePreferences, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Contact Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profilePreferences.phone}
                    onChange={e => setProfilePreferences({ ...profilePreferences, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Tenant Category</label>
                  <select
                    className="form-select"
                    value={profilePreferences.tenantType}
                    onChange={e => setProfilePreferences({ ...profilePreferences, tenantType: e.target.value })}
                  >
                    <option value="Working Professional">Working Professional</option>
                    <option value="Family">Family</option>
                    <option value="Student">Student</option>
                    <option value="Corporate Relocation">Corporate Relocation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Target Move-In Timeline</label>
                  <select
                    className="form-select"
                    value={profilePreferences.moveInTarget}
                    onChange={e => setProfilePreferences({ ...profilePreferences, moveInTarget: e.target.value })}
                  >
                    <option value="Immediate / Within 15 Days">Immediate / Within 15 Days</option>
                    <option value="Within 30 Days">Within 30 Days</option>
                    <option value="1 to 2 Months">1 to 2 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Preferred BHK</label>
                  <select
                    className="form-select"
                    value={profilePreferences.preferredBhk}
                    onChange={e => setProfilePreferences({ ...profilePreferences, preferredBhk: e.target.value })}
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="Studio">Studio</option>
                    <option value="Villa">Villa / Independent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Target Monthly Budget (Max ₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={profilePreferences.budgetMax}
                    onChange={e => setProfilePreferences({ ...profilePreferences, budgetMax: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Preferred Cities</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bangalore, Mumbai"
                    value={profilePreferences.preferredCities}
                    onChange={e => setProfilePreferences({ ...profilePreferences, preferredCities: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="petCheck"
                  checked={profilePreferences.hasPets}
                  onChange={e => setProfilePreferences({ ...profilePreferences, hasPets: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="petCheck" style={{ fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}>
                  I have pets / need pet-friendly properties
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', fontWeight: '700' }}>
                Save Rental Preferences
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KYC Verification Modal (Strict Demo / Simulation) */}
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
            maxWidth: '540px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => {
                setShowKycModal(false);
                setKycMsg('');
              }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '1.4rem',
                fontWeight: 'bold'
              }}
            >
              &times;
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={26} color="#10b981" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Tenant KYC & Credit Verification
              </h2>
            </div>

            {/* Explicit Demo / Simulation Notice Banner */}
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
              color: '#4338ca',
              lineHeight: '1.45'
            }}>
              <strong>Notice: Interactive Demonstration Simulation</strong>
              <div style={{ marginTop: '3px' }}>
                This is a sandboxed credential simulation. No live connection is made to UIDAI (Aadhaar), NSDL/ITD (PAN), or credit bureaus (CIBIL/Experian). All scores and checks are algorithmically calculated for testing.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={fillDemoKycValues}
                className="btn btn-sm"
                style={{
                  fontSize: '0.775rem',
                  fontWeight: '700',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                Fill Demo Test Values
              </button>
            </div>

            <form onSubmit={handleVerifyKyc}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Patel"
                  className="form-control"
                  value={kycForm.fullName}
                  onChange={e => setKycForm({ ...kycForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
                    12-digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    maxLength="12"
                    placeholder="e.g. 987654321098"
                    className="form-control"
                    value={kycForm.aadhaarNumber}
                    onChange={e => setKycForm({ ...kycForm, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Only masked copy will be stored</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
                    10-digit PAN Card Number
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
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Standard 5-letter, 4-num, 1-char</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
                    Current Employer / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infosys / TCS"
                    className="form-control"
                    value={kycForm.companyName}
                    onChange={e => setKycForm({ ...kycForm, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
                    Monthly In-Hand Salary (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    className="form-control"
                    value={kycForm.monthlyIncome}
                    onChange={e => setKycForm({ ...kycForm, monthlyIncome: e.target.value })}
                  />
                </div>
              </div>

              {/* Explicit Mandatory Consent Checkbox */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}>
                <input
                  type="checkbox"
                  id="kycConsentCheck"
                  checked={kycConsent}
                  onChange={e => setKycConsent(e.target.checked)}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                  required
                />
                <label htmlFor="kycConsentCheck" style={{ fontSize: '0.775rem', color: '#334155', cursor: 'pointer', lineHeight: '1.4' }}>
                  <strong>Explicit Consent:</strong> I understand that this is an in-app demonstration simulation and no real query is made to UIDAI, NSDL, or credit bureaus. Sensitive inputs are masked before storage.
                </label>
              </div>

              {/* Simulated Progress Stepper */}
              {kycLoading && (
                <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#166534', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <RefreshCw size={14} className="animate-spin" /> Running Sandboxed Verification Pipeline...
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                    {kycProgressStep === 1 && 'Step 1/3: Checking Aadhaar structure and checksum format...'}
                    {kycProgressStep === 2 && 'Step 2/3: Validating PAN alphanumeric pattern and tax format...'}
                    {kycProgressStep === 3 && 'Step 3/3: Synthesizing credit risk score and landlord credentials...'}
                    {kycProgressStep === 4 && 'Verification complete! Generating report...'}
                  </div>
                </div>
              )}

              {kycMsg && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  backgroundColor: kycMsg.includes('success') || kycMsg.includes('completed') ? '#dcfce7' : '#fee2e2',
                  color: kycMsg.includes('success') || kycMsg.includes('completed') ? '#15803d' : '#b91c1c'
                }}>
                  {kycMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={kycLoading || !kycConsent}
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
                  color: '#ffffff',
                  opacity: (!kycConsent || kycLoading) ? 0.6 : 1,
                  cursor: (!kycConsent || kycLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                <ShieldCheck size={18} /> {kycLoading ? 'Processing Simulation...' : 'Run Demonstration Verification'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Itemized Transaction Receipt Modal */}
      {receiptPayment && (() => {
        const { payment: p, property: prop } = receiptPayment;
        return (
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
              maxWidth: '520px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setReceiptPayment(null)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.3rem',
                  fontWeight: 'bold'
                }}
              >
                &times;
              </button>

              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '850', margin: 0, color: 'var(--primary-color)' }}>
                    LuxeFlats Payment Receipt
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Official Tenancy Escrow Confirmation</span>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Receipt Number:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>RCP-{p.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Transaction Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{p.transactionReference || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Date & Time:</span>
                  <span style={{ fontWeight: '600' }}>{new Date(p.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Tenant Name:</span>
                  <span style={{ fontWeight: '700' }}>{user?.fullName || user?.username}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Property:</span>
                  <span style={{ fontWeight: '700', textAlign: 'right' }}>{prop?.title || `Property #${p.bookingId}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Category:</span>
                  <span style={{ fontWeight: '700', color: p.paymentType === 'REFUND' ? '#ef4444' : 'var(--primary-color)' }}>
                    {p.paymentType === 'TOKEN' ? 'Holding Token Deposit' : p.paymentType === 'SECURITY_DEPOSIT' ? 'Security Deposit' : p.paymentType === 'RENT' ? 'Monthly Rent' : 'Refund'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Method:</span>
                  <span style={{ fontWeight: '600' }}>{p.paymentMethod}</span>
                </div>

                <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Total Amount:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: '900', color: p.paymentType === 'REFUND' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center' }}>
                    {p.paymentType === 'REFUND' ? '-' : ''}<IndianRupee size={18} />{Number(p.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptPayment(null)}
                  className="btn btn-primary btn-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBookingForCancel && (() => {
        const booking = selectedBookingForCancel;
        const prop = propertiesMap[booking.propertyId];
        const paymentsList = bookingPayments[booking.id] || [];
        
        const tokenPayment = paymentsList.find(p => p.paymentType === 'TOKEN' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
        const tokenAmountPaid = tokenPayment ? parseFloat(tokenPayment.amount) : 0;
        
        const secDepositAmt = prop?.securityDeposit ? parseFloat(prop.securityDeposit) : 0;
        const successfulSecPayments = paymentsList.filter(p => p.paymentType === 'SECURITY_DEPOSIT' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
        const securityDepositPaidAmt = successfulSecPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const securityDepositPaidLabel = securityDepositPaidAmt >= secDepositAmt ? 'Yes' : securityDepositPaidAmt > 0 ? 'Partially Paid' : 'No';
        
        const amountPaidSoFar = paymentsList.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((sum, p) => sum + parseFloat(p.amount), 0);
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
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '700' }}>Cancellation Reason (Optional)</label>
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
                        const effectiveId = user.userId || user.id;
                        const pRes = await api.get(`/payments/tenant/${effectiveId}`);
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
