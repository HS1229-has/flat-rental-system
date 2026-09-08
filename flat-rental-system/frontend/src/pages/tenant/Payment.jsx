import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, Smartphone, Building, CheckCircle, AlertCircle, 
  IndianRupee, ArrowLeft, Shield, Lock, ShieldAlert
} from 'lucide-react';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // For new token payment flow: draftBookingId passed from TenantApplicationForm
  const draftBookingId = location.state?.draftBookingId || null;

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [property, setProperty] = useState(location.state?.property || null);
  const [totalAmount, setTotalAmount] = useState(location.state?.totalAmount || 0);

  // Dates passed from TenantApplicationForm via navigation state
  const stateStartDate = location.state?.startDate || null;
  const stateEndDate   = location.state?.endDate   || null;

  // isTokenFlow: true when coming from TenantApplicationForm with a draftBookingId
  const isTokenFlow = !!draftBookingId && !bookingId;
  const [loading, setLoading] = useState(bookingId ? !booking : false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('CARD');
  const [paymentsList, setPaymentsList] = useState([]);

  // Always TOKEN_MONEY for the new flow; FIRST_MONTH for legacy bookingId flow
  const [paymentOption, setPaymentOption] = useState(bookingId ? 'FIRST_MONTH' : 'TOKEN_MONEY');

  const loadPaymentsList = async (bid) => {
    try {
      const res = await api.get(`/payments/booking/${bid}`);
      setPaymentsList(res.data || []);
    } catch (e) {
      console.warn("Failed to load payments list", e);
    }
  };

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    // Show error only if there is truly no context at all
    if (!bookingId && !draftBookingId && !property) {
      setError('Invalid checkout session. Please start your booking from a property listing.');
    }
  }, [bookingId, draftBookingId, property]);

  useEffect(() => {
    if (bookingId && !booking) {
      const loadBooking = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/bookings/${bookingId}`);
          setBooking(res.data);
          loadPaymentsList(bookingId);
          
          if (res.data.propertyId) {
            try {
              const propRes = await api.get(`/properties/${res.data.propertyId}`);
              setProperty(propRes.data);
              
              const s = new Date(res.data.startDate);
              const e = new Date(res.data.endDate);
              const diffDays = (e - s) / (1000 * 60 * 60 * 24);
              const months = Math.max(1, Math.round(diffDays / 30.437)) || 1;
              setTotalAmount(months * parseFloat(propRes.data.rentAmount));
            } catch {}
          }
        } catch (err) {
          setError('Failed to load booking details.');
        } finally {
          setLoading(false);
        }
      };
      loadBooking();
    }
  }, [bookingId, booking]);

  const getPayableAmount = () => {
    if (!property) return totalAmount;
    if (paymentOption === 'TOKEN_MONEY') {
      return property.securityDeposit ? Math.round(parseFloat(property.securityDeposit) * 0.10) : 5000;
    }
    if (paymentOption === 'FIRST_MONTH') {
      return parseFloat(property.rentAmount);
    }
    return totalAmount;
  };

  const payableAmount = getPayableAmount();

  const handlePayment = async (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validations
    if (selectedMethod === 'CARD') {
      if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardForm.name) {
        setError('Please enter the name on card.');
        return;
      }
      if (!cardForm.expiry || !cardForm.expiry.match(/^\d{2}\/\d{2}$/)) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (!cardForm.cvv || cardForm.cvv.length < 3) {
        setError('Please enter a valid CVV.');
        return;
      }
    } else if (selectedMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@upi).');
        return;
      }
    }

    try {
      setSubmitting(true);
      const mockTxnRef = 'MOCK-TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      if (isTokenFlow) {
        // ── TOKEN FLOW ──────────────────────────────────────────────────────────
        // Draft booking already created by TenantApplicationForm (APPLICATION_DRAFT).
        // 1. Record the payment
        const payRes = await api.post('/payments', {
          bookingId: parseInt(draftBookingId),
          tenantId:  user.userId,
          amount:    parseFloat(payableAmount),
          paymentMethod: selectedMethod,
          paymentType: 'TOKEN'
        });
        const paymentRecord = payRes.data;

        // 2. Mark payment COMPLETED
        const completePayRes = await api.patch(
          `/payments/${paymentRecord.id}/status?status=COMPLETED`
        );

        // 3. Promote booking APPLICATION_DRAFT → PENDING_OWNER_APPROVAL
        await api.patch(
          `/bookings/${draftBookingId}/status?status=PENDING_OWNER_APPROVAL&tokenPaymentReference=${encodeURIComponent(mockTxnRef)}`
        );

        await loadPaymentsList(draftBookingId);
        setPaymentSuccess({
          ...completePayRes.data,
          transactionReference: mockTxnRef,
          bookingId: draftBookingId,
          isNewRequest: true
        });

      } else if (!bookingId) {
        // ── LEGACY FLOW (no prior draft) ─────────────────────────────────────
        if (!property?.id || !stateStartDate || !stateEndDate) {
          setError('Missing booking details. Please start from a property listing.');
          setSubmitting(false);
          return;
        }
        const bookingPayload = {
          propertyId: property.id,
          startDate:  stateStartDate,
          endDate:    stateEndDate,
          tokenPaymentReference: mockTxnRef
        };
        const resBooking    = await api.post('/bookings', bookingPayload);
        const createdBooking = resBooking.data;

        const payRes        = await api.post('/payments', {
          bookingId:     createdBooking.id,
          tenantId:      user.userId,
          amount:        parseFloat(payableAmount),
          paymentMethod: selectedMethod,
          paymentType: 'TOKEN'
        });
        const paymentRecord   = payRes.data;
        const completePayRes  = await api.patch(
          `/payments/${paymentRecord.id}/status?status=COMPLETED`
        );

        await api.patch(
          `/bookings/${createdBooking.id}/status?status=PENDING_OWNER_APPROVAL&tokenPaymentReference=${encodeURIComponent(mockTxnRef)}`
        );

        await loadPaymentsList(createdBooking.id);
        setPaymentSuccess({
          ...completePayRes.data,
          transactionReference: mockTxnRef,
          isNewRequest: true,
          booking: createdBooking,
          bookingId: createdBooking.id
        });

      } else {
        // ── EXISTING BOOKING PAYMENT (after owner approval) ──────────────────
        const pType = paymentOption === 'SECURITY_DEPOSIT' ? 'SECURITY_DEPOSIT' : 'RENT';
        const payRes = await api.post('/payments', {
          bookingId:     parseInt(bookingId),
          tenantId:      user.userId,
          amount:        parseFloat(payableAmount),
          paymentMethod: selectedMethod,
          paymentType: pType
        });
        const paymentRecord  = payRes.data;
        const completePayRes = await api.patch(
          `/payments/${paymentRecord.id}/status?status=COMPLETED`
        );

        if (paymentOption === 'FULL_RENT' || paymentOption === 'FIRST_MONTH') {
          await api.patch(`/bookings/${bookingId}/status?status=COMPLETED`);
        }

        await loadPaymentsList(bookingId);
        setPaymentSuccess({
          ...completePayRes.data,
          transactionReference: mockTxnRef,
          bookingId: parseInt(bookingId),
          isNewRequest: false
        });
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        (typeof err.response?.data === 'string' ? err.response.data : null);
      setError(serverMsg || 'Payment failed. Please check the services are running and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    return cleaned;
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
        <div className="glass-card" style={{ height: '500px', animation: 'pulse 1.5s infinite' }}></div>
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

  // Payment Success Screen
  if (paymentSuccess) {
    const isNew = paymentSuccess.isNewRequest;
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto'
          }}>
            <CheckCircle size={40} color="#10b981" />
          </div>

          {isNew ? (
            <>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: '#10b981' }}>
                Booking Request Submitted!
              </h2>
              <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.75rem' }}>
                Your token payment was successful and your booking request has been sent to the owner.
              </p>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
                Status: Pending Owner Approval
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                The property owner will review your application and contact you. You can track the status in your dashboard.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: '#10b981' }}>
                Payment Successful!
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Your payment was recorded successfully.
              </p>
            </>
          )}

          <div style={{ 
            padding: '1.5rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Transaction & Booking Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Transaction ID</span>
                <span style={{ fontWeight: '600', fontSize: '0.875rem', fontFamily: 'monospace' }}>{paymentSuccess.transactionReference}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Booking ID</span>
                <span style={{ fontWeight: '600' }}>#{paymentSuccess.bookingId}</span>
              </div>
              {(() => {
                const secDepositAmt = property?.securityDeposit ? parseFloat(property.securityDeposit) : 0;
                const successfulSecPayments = paymentsList.filter(p => p.paymentType === 'SECURITY_DEPOSIT' && (p.status === 'COMPLETED' || p.status === 'SUCCESS'));
                const securityDepositPaidAmt = successfulSecPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                
                let securityDepositPaidLabel = 'No';
                let paymentStatusLabel = 'REMAINING';
                let paymentStatusClass = 'badge-failed';
                
                if (secDepositAmt > 0) {
                  if (securityDepositPaidAmt >= secDepositAmt) {
                    securityDepositPaidLabel = 'Yes';
                    paymentStatusLabel = 'COMPLETED';
                    paymentStatusClass = 'badge-success';
                  } else if (securityDepositPaidAmt > 0) {
                    securityDepositPaidLabel = 'Partially Paid';
                    paymentStatusLabel = 'PARTIALLY PAID';
                    paymentStatusClass = 'badge-pending';
                  }
                } else {
                  securityDepositPaidLabel = 'N/A';
                  paymentStatusLabel = 'NOT_APPLICABLE';
                  paymentStatusClass = 'badge-secondary';
                }

                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Payment Type</span>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {paymentSuccess.paymentType === 'TOKEN' || !bookingId ? 'TOKEN PAYMENT' : (paymentSuccess.paymentType === 'SECURITY_DEPOSIT' ? 'SECURITY DEPOSIT' : 'RENT PAYMENT')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Amount Paid</span>
                      <span style={{ fontWeight: '850', color: '#10b981', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
                        <IndianRupee size={15} />{Number(paymentSuccess.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Security Deposit</span>
                      <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                        <IndianRupee size={14} />{property?.securityDeposit ? Number(property.securityDeposit).toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Security Deposit Paid</span>
                      <span style={{ fontWeight: '700', color: securityDepositPaidLabel === 'Yes' ? '#10b981' : securityDepositPaidLabel === 'Partially Paid' ? '#fbbf24' : '#ef4444' }}>
                        {securityDepositPaidLabel}
                      </span>
                    </div>
                    {securityDepositPaidLabel === 'Partially Paid' && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Paid</span>
                          <span style={{ fontWeight: '600', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={14} />{Number(securityDepositPaidAmt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Remaining</span>
                          <span style={{ fontWeight: '600', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={14} />{Number(secDepositAmt - securityDepositPaidAmt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Payment Status</span>
                      <span className={`badge ${paymentStatusClass}`}>{paymentStatusLabel}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Booking Status</span>
                      <span style={{ fontWeight: '700', color: '#3b82f6' }}>
                        {booking ? booking.status : (isNew ? 'PENDING OWNER APPROVAL' : 'CONFIRMED')}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {isNew ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
                <Link to="/tenant/dashboard" className="btn btn-primary btn-lg" style={{ minWidth: '260px', textAlign: 'center' }}>
                  View My Booking Status
                </Link>
                <Link to="/properties" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Browse more properties
                </Link>
              </div>
            ) : (
              <>
                <Link to="/tenant/dashboard" className="btn btn-primary">
                  Go to My Bookings
                </Link>
                <Link to="/properties" className="btn btn-secondary">
                  Browse More
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const methods = [
    { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'NET_BANKING', label: 'Net Banking', icon: Building }
  ];

  const getButtonText = () => {
    if (submitting) return 'Processing...';
    if (!bookingId) return 'Pay Token & Submit Request';
    if (paymentOption === 'FIRST_MONTH') {
      return `Pay First Month Rent ₹${Number(payableAmount).toLocaleString('en-IN')}`;
    }
    if (paymentOption === 'FULL_RENT') {
      return `Pay Full Stay Rent ₹${Number(payableAmount).toLocaleString('en-IN')}`;
    }
    return `Pay ₹${Number(payableAmount).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/tenant/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
        {isTokenFlow ? 'Pay Token & Submit Request' : 'Complete Payment'}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        {isTokenFlow
          ? 'Step 3 of 3 — Pay the mandatory token amount to submit your booking request to the owner. This is a mock payment transaction.'
          : 'This is a mock payment transaction. No real money will be charged.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr min(380px, 100%)', gap: '2rem', alignItems: 'start' }}>
        {/* Payment Form */}
        <div>
          {/* Payment Method Selector */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {methods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedMethod(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: selectedMethod === id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectedMethod === id ? 'rgba(37, 99, 235, 0.05)' : '#ffffff',
                    color: selectedMethod === id ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: selectedMethod === id ? '700' : '500',
                    fontSize: '0.875rem',
                    transition: 'var(--transition)'
                  }}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Option Selector */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>Choose Payment Option</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Option 1: Token Money */}
              <label style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.5rem', 
                cursor: bookingId ? 'not-allowed' : 'pointer', 
                padding: '1rem', 
                border: paymentOption === 'TOKEN_MONEY' ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: paymentOption === 'TOKEN_MONEY' ? 'rgba(37, 99, 235, 0.03)' : '#ffffff', 
                transition: 'all 0.2s',
                opacity: bookingId ? 0.5 : 1
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="radio" 
                    name="paymentOption" 
                    value="TOKEN_MONEY" 
                    disabled={!!bookingId}
                    checked={paymentOption === 'TOKEN_MONEY'} 
                    onChange={() => setPaymentOption('TOKEN_MONEY')} 
                    style={{ width: '16px', height: '16px', cursor: bookingId ? 'not-allowed' : 'pointer' }} 
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: paymentOption === 'TOKEN_MONEY' ? 'var(--primary)' : 'var(--text-main)' }}>
                      Step 1 – Required: Token Money / Holding Deposit
                    </div>
                     <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      Pay ₹{property?.securityDeposit ? Number(Math.round(parseFloat(property.securityDeposit) * 0.10)).toLocaleString('en-IN') : '5,000'} to submit your booking request to the owner
                    </div>
                  </div>
                </div>

                {/* Refundable Information message */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  marginTop: '0.25rem', 
                  padding: '0.35rem 0.65rem', 
                  borderRadius: '4px', 
                  backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                  color: '#0d9488',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  width: 'fit-content'
                }}>
                  <span>✓ Refundable</span>
                  <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>— Your token amount will be refunded within 3–7 business days if the booking request is declined by the owner.</span>
                </div>
              </label>

              {/* Option 2: First Month's Rent */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                cursor: !bookingId ? 'not-allowed' : 'pointer', 
                padding: '1rem', 
                border: paymentOption === 'FIRST_MONTH' ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: paymentOption === 'FIRST_MONTH' ? 'rgba(37, 99, 235, 0.03)' : '#ffffff', 
                transition: 'all 0.2s',
                opacity: !bookingId ? 0.6 : 1
              }}>
                <input 
                  type="radio" 
                  name="paymentOption" 
                  value="FIRST_MONTH" 
                  disabled={!bookingId}
                  checked={paymentOption === 'FIRST_MONTH'} 
                  onChange={() => setPaymentOption('FIRST_MONTH')} 
                  style={{ width: '16px', height: '16px', cursor: !bookingId ? 'not-allowed' : 'pointer' }} 
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: paymentOption === 'FIRST_MONTH' ? 'var(--primary)' : 'var(--text-main)' }}>
                    Step 2 – After Owner Approval: First Month's Rent Only
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Pay ₹{property ? Number(property.rentAmount).toLocaleString('en-IN') : '0'} to clear first month dues. {!bookingId && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>(Locked until owner approval)</span>}
                  </div>
                </div>
              </label>

              {/* Option 3: Full Stay Rent */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                cursor: !bookingId ? 'not-allowed' : 'pointer', 
                padding: '1rem', 
                border: paymentOption === 'FULL_RENT' ? '2px solid var(--primary)' : '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: paymentOption === 'FULL_RENT' ? 'rgba(37, 99, 235, 0.03)' : '#ffffff', 
                transition: 'all 0.2s',
                opacity: !bookingId ? 0.6 : 1
              }}>
                <input 
                  type="radio" 
                  name="paymentOption" 
                  value="FULL_RENT" 
                  disabled={!bookingId}
                  checked={paymentOption === 'FULL_RENT'} 
                  onChange={() => setPaymentOption('FULL_RENT')} 
                  style={{ width: '16px', height: '16px', cursor: !bookingId ? 'not-allowed' : 'pointer' }} 
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: paymentOption === 'FULL_RENT' ? 'var(--primary)' : 'var(--text-main)' }}>
                    Step 2 – After Owner Approval: Full Stay Rent (Pre-pay)
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Pay total rent amount of ₹{Number(totalAmount).toLocaleString('en-IN')} for the entire booking period. {!bookingId && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>(Locked until owner approval)</span>}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Card Form */}
          {selectedMethod === 'CARD' && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Card Details</h3>
              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="John Doe"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="•••"
                      maxLength="4"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Lock size={18} /> {getButtonText()}
                </button>
              </form>
            </div>
          )}

          {/* UPI Form */}
          {selectedMethod === 'UPI' && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>UPI Details</h3>
              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="yourname@paytm or yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
                  {getButtonText()}
                </button>
              </form>
            </div>
          )}

          {/* Net Banking */}
          {selectedMethod === 'NET_BANKING' && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Net Banking</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'BOB'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ border: '1px solid var(--border-color)' }}
                  >
                    {bank}
                  </button>
                ))}
              </div>

              {error && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                type="button"
                onClick={handlePayment}
                className="btn btn-primary btn-full btn-lg"
                disabled={submitting}
              >
                {getButtonText()}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Order Summary</h3>

          {property && (
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={property.imageUrls ? (splitImageUrls(property.imageUrls)[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80') : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'}
                alt={property.title}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80'; }}
              />
              <div style={{ fontWeight: '700', marginBottom: '0.25rem', color: 'var(--secondary)' }}>{property.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{property.city}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Booking Status</span>
              <span style={{ fontWeight: '700', color: bookingId ? 'var(--text-main)' : '#d97706', fontSize: '0.875rem' }}>
                {bookingId ? 'EXISTS' : 'PRE-REQUEST (TOKEN REQUIRED)'}
              </span>
            </div>
            {stateStartDate && stateEndDate && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Check-in</span>
                  <span style={{ fontWeight: '600' }}>{stateStartDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Check-out</span>
                  <span style={{ fontWeight: '600' }}>{stateEndDate}</span>
                </div>
              </>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '1rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700' }}>Payable Amount</span>
              <span style={{ fontSize: '1.35rem', fontWeight: '850', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={18} />{Number(payableAmount).toLocaleString('en-IN')}
              </span>
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'right', display: 'block', marginTop: '0.25rem' }}>
              {!bookingId ? 'Token amount required to submit booking request' : 'Later stage booking payment'}
            </small>
          </div>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            marginTop: '1.25rem', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }}>
            <Shield size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>Mock payment. No real money charged.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
