import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, MapPin, Calendar, FileText, Upload, CheckCircle, 
  ShieldAlert, ShieldCheck, Heart, AlertCircle, Sparkles, HelpCircle 
} from 'lucide-react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

export default function TenantVerificationForm() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const [expectedMoveInDate, setExpectedMoveInDate] = useState('');
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
  const [docFile, setDocFile] = useState(null);
  const [docBase64, setDocBase64] = useState('');
  const [docName, setDocName] = useState('');

  // Police verification status
  const [policeStatus, setPoliceStatus] = useState('Not Available');
  const [policeFile, setPoliceFile] = useState(null);
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
  const [submitted, setSubmitted] = useState(false);

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
    reader.onload = () => {
      setBase64(reader.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to load file.');
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setError('You must consent to background checks to submit verification.');
      return;
    }
    if (!docBase64) {
      setError('Please upload your Government Identity Document.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      bookingId: parseInt(bookingId),
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

    try {
      await api.post(`/bookings/${bookingId}/verification`, payload);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Verification submission failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '3rem 1.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '3.5rem 2rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto'
          }}>
            <Sparkles size={40} color="#10b981" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Booking Request Submitted!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Your verification details and rental application have been submitted successfully. The property owner can now review your request.
          </p>

          <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.825rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2.5rem', letterSpacing: '0.04em' }}>
            Status: Pending Owner Approval
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/tenant/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Go to Tenant Dashboard
            </Link>
            <Link to="/properties" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Browse Flats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '850px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)' }}>
        
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            Tenant Verification & Rental Application
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <strong>Token payment successful.</strong> Please complete your tenant verification details to submit your booking request to the property owner. These details will be held securely.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: Personal Details */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <User size={18} color="var(--primary-color)" /> Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Date of Birth *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Current City *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Bangalore"
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Current Address *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Street details, locality..."
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Professional Information */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Briefcase size={18} color="var(--primary-color)" /> Employment details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Occupation *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Software Engineer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Company Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Google India"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Monthly Take-home Income *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Rs. 85,000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Booking Preferences & Occupancy */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <MapPin size={18} color="var(--primary-color)" /> Occupancy & Stay Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Expected Move-in Date *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={expectedMoveInDate}
                  onChange={(e) => setExpectedMoveInDate(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Expected Duration of Stay *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 11 Months"
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">Total Occupants *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1"
                  value={occupantsCount}
                  onChange={(e) => setOccupantsCount(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Relationship with other occupants</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Family / Friends / Self"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Reason for renting *</label>
              <textarea 
                className="form-control" 
                rows="2"
                placeholder="e.g. Relocating close to new office..."
                value={reasonForRenting}
                onChange={(e) => setReasonForRenting(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                  <input 
                    type="checkbox" 
                    id="petsCheck" 
                    checked={pets} 
                    onChange={(e) => setPets(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="petsCheck" style={{ fontWeight: '600', cursor: 'pointer', margin: 0 }}>I have pets</label>
                </div>
                {pets && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Golden Retriever" 
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Qty" 
                      min="1"
                      value={numberOfPets}
                      onChange={(e) => setNumberOfPets(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Smoking Preference</label>
                <select 
                  className="form-select"
                  value={smokingPreference}
                  onChange={(e) => setSmokingPreference(e.target.value)}
                >
                  <option value="Non-Smoker">Non-Smoker (Highly Preferred)</option>
                  <option value="Smoker (Outside only)">Smoker (Outside only)</option>
                  <option value="Smoker">Smoker</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Document Verification (Base64 secure upload) */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <FileText size={18} color="var(--primary-color)" /> Verification & ID Documents
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              
              {/* ID Proof Box */}
              <div style={{ padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fafafa' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Government Identity Proof *</label>
                <select 
                  className="form-select" 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                >
                  <option value="Aadhaar Card">Aadhaar Card (India)</option>
                  <option value="Passport">Passport</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Driver License">Driver License</option>
                </select>

                <div style={{ position: 'relative', textAlign: 'center', padding: '1.5rem 1rem', border: '1px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                  <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>Upload copy (PDF, JPG, PNG up to 2MB)</p>
                  <input 
                    type="file" 
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange(e, setDocBase64, setDocName)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  {docName && (
                    <div style={{ fontSize: '0.825rem', color: '#10b981', fontWeight: '600', marginTop: '0.5rem' }}>
                      Selected: {docName}
                    </div>
                  )}
                </div>
              </div>

              {/* Police Verification Box */}
              <div style={{ padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: '#fafafa' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Police Verification Status</label>
                <select 
                  className="form-select" 
                  value={policeStatus}
                  onChange={(e) => setPoliceStatus(e.target.value)}
                  style={{ marginBottom: '1rem' }}
                >
                  <option value="Not Available">Not Available / Pending</option>
                  <option value="Verified">Verified (I have Certificate)</option>
                  <option value="Not Applicable">Not Applicable</option>
                </select>

                <div style={{ position: 'relative', textAlign: 'center', padding: '1.5rem 1rem', border: '1px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', opacity: policeStatus === 'Verified' ? 1 : 0.6 }}>
                  <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>Upload police certificate (Optional)</p>
                  <input 
                    type="file" 
                    accept=".pdf,image/*"
                    disabled={policeStatus !== 'Verified'}
                    onChange={(e) => handleFileChange(e, setPoliceBase64, setPoliceName)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: policeStatus === 'Verified' ? 'pointer' : 'default' }}
                  />
                  {policeName && (
                    <div style={{ fontSize: '0.825rem', color: '#10b981', fontWeight: '600', marginTop: '0.5rem' }}>
                      Selected: {policeName}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '6px' }}>
              <ShieldCheck size={20} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ color: '#1e3a8a', fontSize: '0.825rem', margin: 0, lineHeight: '1.5' }}>
                <strong>Secure Document Vault:</strong> Documents are stored in an encrypted database sandbox and only visible to you, the property owner, and verification moderators.
              </p>
            </div>
          </div>

          {/* SECTION 5: Emergency Contacts */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Heart size={18} color="var(--primary-color)" /> Emergency Contact
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Contact Person Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Rajesh Kumar"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Relationship *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Father / Cousin"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="form-label">Mobile Number *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. +91 98765 43210"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  required 
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input 
                type="checkbox" 
                id="consentCheck" 
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '3px', cursor: 'pointer' }}
                required
              />
              <label htmlFor="consentCheck" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', cursor: 'pointer' }}>
                * I hereby authorize LuxeFlats and the property owner to process my personal details, verification certificates, and contact info for the purposes of evaluating my rental application check. I confirm that all information provided is accurate and true.
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
            <Link to="/tenant/dashboard" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Complete Later
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ padding: '0.75rem 2.5rem' }}
            >
              {loading ? 'Submitting Application...' : 'Submit Verification & Send Request'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
