import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User, Briefcase, MapPin, Calendar, FileText, Upload, CheckCircle,
  ShieldAlert, ShieldCheck, Heart, AlertCircle, Sparkles, HelpCircle,
  ArrowLeft, IndianRupee, Info
} from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

export default function TenantApplicationForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Passed from BookProperty page
  const property = location.state?.property || null;
  const startDate = location.state?.startDate || null;
  const endDate = location.state?.endDate || null;
  const totalAmount = location.state?.totalAmount || 0;

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // Employment
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Rental details
  const [expectedMoveInDate, setExpectedMoveInDate] = useState(startDate || '');
  const [expectedDuration, setExpectedDuration] = useState('');
  const [reasonForRenting, setReasonForRenting] = useState('');
  const [occupantsCount, setOccupantsCount] = useState(1);
  const [relationship, setRelationship] = useState('');

  // Pets & Smoking
  const [pets, setPets] = useState(false);
  const [petType, setPetType] = useState('');
  const [numberOfPets, setNumberOfPets] = useState(0);
  const [smokingPreference, setSmokingPreference] = useState('Non-Smoker');

  // Documents (Base64 representation)
  const [documentType, setDocumentType] = useState('Aadhaar Card');
  const [docBase64, setDocBase64] = useState('');
  const [docName, setDocName] = useState('');

  // Police verification status
  const [policeStatus, setPoliceStatus] = useState('Not Available');
  const [policeBase64, setPoliceBase64] = useState('');
  const [policeName, setPoliceName] = useState('');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Consent
  const [consent, setConsent] = useState(false);

  // Flow states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [policeVerification, setPoliceVerification] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(true);

  React.useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/bookings/tenant/${user.userId}/police-verification`);
        setPoliceVerification(res.data);
        if (res.data?.status === 'VERIFIED') {
          setPoliceStatus('Verified');
        }
      } catch (err) {
        console.error("Failed to check CCTNS status", err);
      } finally {
        setLoadingVerification(false);
      }
    };
    checkVerification();
  }, [user]);

  if (!property || !startDate || !endDate) {
    return (
      <div style={{ padding: '3rem 1.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.75rem' }}>Invalid Session</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            No property or booking dates found. Please start your booking from a property listing.
          </p>
          <Link to="/properties" className="btn btn-primary">Browse Properties</Link>
        </div>
      </div>
    );
  }

  // File to Base64 converter
  const handleFileChange = (e, setBase64, setName) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB.');
      return;
    }
    setName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => { setBase64(reader.result); setError(''); };
    reader.onerror = () => { setError('Failed to load file.'); };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setError('You must consent to background checks to proceed.');
      return;
    }
    if (!docBase64) {
      setError('Please upload your Government Identity Document.');
      return;
    }

    const parsedIncome = parseFloat(monthlyIncome);
    if (!monthlyIncome || monthlyIncome.trim() === '') {
      setError('Monthly income (salary) is required.');
      return;
    }
    if (isNaN(parsedIncome) || parsedIncome <= 0) {
      setError('Monthly income (salary) must be a valid positive number greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create the booking as APPLICATION_DRAFT (no tokenPaymentReference yet)
      const bookingPayload = {
        propertyId: property.id,
        startDate,
        endDate
      };
      const bookingRes = await api.post('/bookings', bookingPayload);
      const draftBooking = bookingRes.data;

      // Step 2: Submit tenant verification for this draft booking
      const verificationPayload = {
        bookingId: draftBooking.id,
        fullName,
        dateOfBirth,
        currentCity,
        currentAddress,
        occupation,
        companyName,
        monthlyIncome,
        expectedMoveInDate,
        expectedDuration,
        reasonForRenting,
        occupantsCount: parseInt(occupantsCount),
        relationship,
        pets,
        petType,
        numberOfPets: parseInt(numberOfPets),
        smokingPreference,
        documentType,
        documentData: docBase64,
        documentFileName: docName,
        policeVerificationStatus: policeStatus,
        policeVerificationCertificate: policeBase64 || null,
        policeCertificateFileName: policeName || null,
        emergencyContactName: emergencyName,
        emergencyContactRelationship: emergencyRelation,
        emergencyContactNumber: emergencyPhone,
        consent
      };
      await api.post(`/bookings/${draftBooking.id}/verification`, verificationPayload);

      // Step 3: Navigate to Payment with draft booking info
      navigate('/payment', {
        state: {
          property,
          startDate,
          endDate,
          totalAmount,
          draftBookingId: draftBooking.id
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
    border: '1px solid var(--border-color)', fontSize: '0.95rem',
    backgroundColor: '#ffffff', color: 'var(--text-main)', outline: 'none',
    boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-main)' };
  const fieldStyle = { marginBottom: '1.1rem' };
  const sectionStyle = { padding: '1.5rem', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
  const sectionTitleStyle = { fontWeight: '800', fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' };

  const tokenAmount = property.securityDeposit ? Math.round(parseFloat(property.securityDeposit) * 0.10) : 5000;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Tenant Application Form
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Step 2 of 3 — Complete your application before paying the token amount
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem' }}>
        {['Select Dates', 'Application Form', 'Pay Token & Submit'].map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: i === 1 ? 1 : 0.5 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700',
                backgroundColor: i < 1 ? 'var(--primary)' : i === 1 ? 'var(--primary)' : 'var(--border-color)',
                color: i <= 1 ? '#fff' : 'var(--text-muted)'
              }}>
                {i < 1 ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: i === 1 ? '700' : '500', color: i === 1 ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: '2px', backgroundColor: i < 1 ? 'var(--primary)' : 'var(--border-color)', margin: '0 0.75rem' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Property Summary Banner */}
      <div style={{
        padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)',
        backgroundColor: 'rgba(99,102,241,0.06)', marginBottom: '1.75rem',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{property.title}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{property.city} · {startDate} to {endDate}</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Rent</div>
            <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center' }}><IndianRupee size={13} />{Number(property.rentAmount).toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token Amount</div>
            <div style={{ fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}><IndianRupee size={13} />{tokenAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Payment Notice */}
      <div style={{
        padding: '0.85rem 1.1rem', borderRadius: '8px',
        backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217,119,6,0.25)',
        display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1.75rem'
      }}>
        <Info size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
        <p style={{ fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5', margin: 0 }}>
          <strong>Important:</strong> Your application will be saved as a <strong>Draft</strong>. 
          Your booking request will only be submitted to the owner after the mandatory Token Payment is completed on the next step.
          The token amount of <strong>₹{tokenAmount.toLocaleString('en-IN')}</strong> is refundable if the owner declines.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <User size={18} color="var(--primary)" /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="As on government ID" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Date of Birth *</label>
              <input style={inputStyle} type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Current City *</label>
              <input style={inputStyle} value={currentCity} onChange={e => setCurrentCity(e.target.value)} required placeholder="City you currently live in" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Number of Occupants *</label>
              <input style={inputStyle} type="number" min="1" max="15" value={occupantsCount} onChange={e => setOccupantsCount(e.target.value)} required />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Current Address *</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} value={currentAddress} onChange={e => setCurrentAddress(e.target.value)} required placeholder="Full current residential address" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Relationship of occupants (if applicable)</label>
            <input style={inputStyle} value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. Family, Friends, Self" />
          </div>
        </div>

        {/* Employment */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <Briefcase size={18} color="var(--primary)" /> Employment & Income
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Occupation *</label>
              <input style={inputStyle} value={occupation} onChange={e => setOccupation(e.target.value)} required placeholder="e.g. Software Engineer, Student" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Company / Institute Name</label>
              <input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Employer or university name" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Monthly Income (₹)</label>
              <input style={inputStyle} type="number" min="0" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="e.g. 50000" />
            </div>
          </div>
        </div>

        {/* Rental Preferences */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <MapPin size={18} color="var(--primary)" /> Rental Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Expected Move-in Date</label>
              <input style={inputStyle} type="date" value={expectedMoveInDate} onChange={e => setExpectedMoveInDate(e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Expected Duration</label>
              <input style={inputStyle} value={expectedDuration} onChange={e => setExpectedDuration(e.target.value)} placeholder="e.g. 6 months, 1 year" />
            </div>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Reason for Renting</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} value={reasonForRenting} onChange={e => setReasonForRenting(e.target.value)} placeholder="Brief description of why you're looking for this property" />
          </div>
        </div>

        {/* Lifestyle */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <Heart size={18} color="var(--primary)" /> Lifestyle Preferences
          </h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" id="has-pets" checked={pets} onChange={e => setPets(e.target.checked)} />
              <label htmlFor="has-pets" style={{ fontWeight: '600', fontSize: '0.9rem' }}>I have pets</label>
            </div>
            {pets && (
              <>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Pet Type</label>
                  <input style={{ ...inputStyle, width: '140px' }} value={petType} onChange={e => setPetType(e.target.value)} placeholder="e.g. Dog, Cat" />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Number of Pets</label>
                  <input style={{ ...inputStyle, width: '80px' }} type="number" min="0" value={numberOfPets} onChange={e => setNumberOfPets(e.target.value)} />
                </div>
              </>
            )}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Smoking Preference</label>
            <select style={inputStyle} value={smokingPreference} onChange={e => setSmokingPreference(e.target.value)}>
              {['Non-Smoker', 'Occasional Smoker', 'Smoker'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Identity Documents */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <FileText size={18} color="var(--primary)" /> Identity Documents
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Document Type *</label>
              <select style={inputStyle} value={documentType} onChange={e => setDocumentType(e.target.value)}>
                {['Aadhaar Card', 'PAN Card', 'Passport', "Driver's License", 'Voter ID'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Upload Document * (max 2MB)</label>
              <label htmlFor="doc-upload" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1rem', border: '1px dashed var(--border-color)',
                borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)'
              }}>
                <Upload size={15} /> {docName || 'Choose file…'}
              </label>
              <input id="doc-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                onChange={e => handleFileChange(e, setDocBase64, setDocName)} />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            {policeVerification?.status === 'VERIFIED' ? (
              <div className="glass-card" style={{ padding: '1rem', border: '1px solid #10b981', backgroundColor: 'rgba(16,185,129,0.04)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} /> CCTNS Verified
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Your profile has a verified CCTNS / Police Verification.
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No additional upload required. Reference ID: <strong>{policeVerification.verificationReferenceNumber}</strong>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid #f59e0b', backgroundColor: 'rgba(245,158,11,0.04)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <ShieldAlert size={18} /> CCTNS Verification Required
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Your profile does not have a verified police verification. For a faster approval, please complete your verification from your dashboard profile.
                </div>
                <Link to="/tenant/dashboard" className="btn btn-secondary btn-sm" style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                  Verify Now
                </Link>
                
                {/* Fallback direct booking-specific file upload if they choose to do it manually here */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Or upload direct verification report for this application:
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {['Not Available', 'Pending', 'Verified'].map(s => (
                      <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="radio" name="policeStatus" value={s} checked={policeStatus === s} onChange={() => setPoliceStatus(s)} />
                        {s === 'Verified' ? <ShieldCheck size={14} color="#10b981" /> : <ShieldAlert size={14} color="#f59e0b" />}
                        {s}
                      </label>
                    ))}
                  </div>
                  {policeStatus === 'Verified' && (
                    <div>
                      <label style={labelStyle}>Upload Police Verification Certificate (max 2MB)</label>
                      <label htmlFor="police-upload" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', border: '1px dashed var(--border-color)',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)'
                      }}>
                        <Upload size={15} /> {policeName || 'Choose certificate…'}
                      </label>
                      <input id="police-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
                        onChange={e => handleFileChange(e, setPoliceBase64, setPoliceName)} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <HelpCircle size={18} color="var(--primary)" /> Emergency Contact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Name</label>
              <input style={inputStyle} value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Full name" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Relationship</label>
              <input style={inputStyle} value={emergencyRelation} onChange={e => setEmergencyRelation(e.target.value)} placeholder="e.g. Parent, Sibling" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Phone Number</label>
              <input style={inputStyle} type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </div>

        {/* Consent */}
        <div style={{ ...sectionStyle, backgroundColor: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '0.2rem', width: '18px', height: '18px', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              I confirm that all the information provided above is accurate and truthful. I consent to background verification checks by the property owner. I understand that the Token Amount paid on the next step will be held securely until the owner approves or declines my application.
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Saving Application…' : 'Save Application & Proceed to Payment →'}
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Your application will be saved as a draft. Your booking will only be submitted to the owner after you pay the token amount.
        </p>
      </form>
    </div>
  );
}
