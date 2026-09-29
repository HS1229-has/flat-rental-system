import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, MapPin, IndianRupee, Bed, Bath, Ruler, ArrowLeft,
  CheckCircle, AlertCircle, Image as ImageIcon, Trash2, Star, UploadCloud, RefreshCw
} from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

const propertyTypes = [
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ONE_BHK', label: '1 BHK' },
  { value: 'TWO_BHK', label: '2 BHK' },
  { value: 'THREE_BHK', label: '3 BHK' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PG', label: 'PG / Co-living' },
];

const furnishingOptions = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const amenityOptions = [
  'WiFi', 'AC', 'Parking', 'Gym', 'Security',
  'Power Backup', 'Water Supply', 'Lift', 'Swimming Pool', 'Garden'
];

const locationData = {
  "Delhi": {
    state: "Delhi",
    localities: ["Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Hauz Khas", "Vasant Kunj", "Rajouri Garden"]
  },
  "Greater Noida": {
    state: "Uttar Pradesh",
    localities: ["Knowledge Park", "Pari Chowk", "Sector Pi", "Sector Alpha", "Sector Beta", "Omega 1", "Chi 5"]
  },
  "Noida": {
    state: "Uttar Pradesh",
    localities: ["Sector 15", "Sector 62", "Sector 18", "Sector 50", "Sector 137", "Sector 76"]
  },
  "Mumbai": {
    state: "Maharashtra",
    localities: ["Andheri West", "Bandra West", "Juhu", "Colaba", "Worli", "Powai", "Goregaon East", "Thane"]
  },
  "Bangalore": {
    state: "Karnataka",
    localities: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar", "Electronic City", "Marathahalli"]
  },
  "Pune": {
    state: "Maharashtra",
    localities: ["Koregaon Park", "Kothrud", "Wakad", "Baner", "Hinjawadi", "Viman Nagar", "Kalyani Nagar"]
  }
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const addressInputRef = useRef(null);
  const [customCityMode, setCustomCityMode] = useState(false);
  const [customLocalityMode, setCustomLocalityMode] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    locality: '',
    state: '',
    latitude: '',
    longitude: '',
    rentAmount: '',
    securityDeposit: '',
    propertyType: 'TWO_BHK',
    bedrooms: '2',
    bathrooms: '1',
    area: '',
    furnishing: 'Semi-Furnished',
    imageUrls: '',
    amenities: [],
    available: true
  });

  const [touched, setTouched] = useState({});
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const processFiles = (files) => {
    setError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const currentCount = uploadedImages.length;

    if (currentCount >= MAX_IMAGES) {
      setError(`Maximum limit reached: You cannot upload more than ${MAX_IMAGES} photos.`);
      return;
    }

    const availableSlots = MAX_IMAGES - currentCount;
    const filesToProcess = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(`Only ${availableSlots} more photo(s) could be added to stay within the ${MAX_IMAGES}-photo limit.`);
    }

    for (let file of filesToProcess) {
      if (!validTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Please upload JPG, PNG, or WebP images.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }
    }

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setUploadedImages(prev => {
          if (prev.includes(result)) return prev;
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const setAsCover = (index) => {
    setUploadedImages(prev => {
      const newImgs = [...prev];
      const item = newImgs.splice(index, 1)[0];
      newImgs.unshift(item);
      return newImgs;
    });
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${id}`);
        const p = res.data;
        
        // Safety check: ensure current user owns this property
        if (p.ownerId !== user.userId) {
          setError('You do not have permission to edit this property.');
          return;
        }

        const cityVal = p.city || '';
        if (cityVal) {
          const isKnown = cityVal in locationData;
          setCustomCityMode(!isKnown);
          if (isKnown) {
            const isKnownLoc = locationData[cityVal].localities.includes(p.locality);
            setCustomLocalityMode(!isKnownLoc && !!p.locality);
          } else {
            setCustomLocalityMode(true);
          }
        }

        setForm({
          title: p.title || '',
          description: p.description || '',
          address: p.address || '',
          city: p.city || '',
          locality: p.locality || '',
          state: p.state || '',
          latitude: p.latitude || '',
          longitude: p.longitude || '',
          rentAmount: p.rentAmount || '',
          securityDeposit: p.securityDeposit || '',
          propertyType: p.propertyType || 'TWO_BHK',
          bedrooms: String(p.bedrooms || 2),
          bathrooms: String(p.bathrooms || 1),
          area: p.area || '',
          furnishing: p.furnishing || 'Semi-Furnished',
          imageUrls: p.imageUrls || '',
          amenities: p.amenities ? p.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
          available: p.available !== false
        });

        const imgs = p.imageUrls ? splitImageUrls(p.imageUrls) : [];
        setUploadedImages(imgs);
        setInitialDataLoaded(true);
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user]);

  // Unsaved changes alert
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (initialDataLoaded && !submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [initialDataLoaded, submitting]);

  // Initialize Address Places Autocomplete
  useEffect(() => {
    let active = true;
    loadGoogleMapsScript()
      .then((google) => {
        if (!active || !addressInputRef.current) return;
        const options = {
          types: ['address'],
          componentRestrictions: { country: 'in' }
        };
        const autocomplete = new google.maps.Autocomplete(addressInputRef.current, options);
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.address_components) return;

          let streetNumber = '';
          let route = '';
          let locality = '';
          let city = '';
          let state = '';
          const addressComponents = place.address_components;

          for (const component of addressComponents) {
            const types = component.types;
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            } else if (types.includes('route')) {
              route = component.long_name;
            } else if (types.includes('sublocality') || types.includes('neighborhood')) {
              locality = component.long_name;
            } else if (types.includes('locality')) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_2') && !city) {
              city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
          }

          const streetAddr = [streetNumber, route].filter(Boolean).join(' ');
          const formattedAddress = place.formatted_address || '';
          
          if (city) {
            const isKnown = city in locationData;
            setCustomCityMode(!isKnown);
          }
          
          setForm(prev => ({
            ...prev,
            address: formattedAddress || streetAddr,
            city: city || prev.city,
            locality: locality || prev.locality,
            state: state || prev.state,
            latitude: place.geometry?.location ? place.geometry.location.lat() : '',
            longitude: place.geometry?.location ? place.geometry.location.lng() : ''
          }));
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [loading]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setForm(prev => {
      const updated = { ...prev, [name]: finalVal };

      // Synchronization between propertyType & bedrooms
      if (name === 'propertyType') {
        if (value === 'STUDIO') {
          updated.bedrooms = '1';
          updated.bathrooms = '1';
        } else if (value === 'ONE_BHK') {
          updated.bedrooms = '1';
        } else if (value === 'TWO_BHK') {
          updated.bedrooms = '2';
        } else if (value === 'THREE_BHK') {
          updated.bedrooms = '3';
        }
      } else if (name === 'bedrooms') {
        const bedNum = parseInt(value);
        if (prev.propertyType === 'ONE_BHK' || prev.propertyType === 'TWO_BHK' || prev.propertyType === 'THREE_BHK') {
          if (bedNum === 1) updated.propertyType = 'ONE_BHK';
          else if (bedNum === 2) updated.propertyType = 'TWO_BHK';
          else if (bedNum === 3) updated.propertyType = 'THREE_BHK';
        }
      }

      return updated;
    });
  };

  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Validation
  const errors = {};
  if (!form.title.trim()) {
    errors.title = 'Property title is required.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  } else if (form.title.length > 150) {
    errors.title = 'Title cannot exceed 150 characters.';
  }

  if (form.description && form.description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters.';
  }

  if (!form.address.trim()) {
    errors.address = 'Property street address is required.';
  } else if (form.address.trim().length < 3) {
    errors.address = 'Address must be at least 3 characters.';
  } else if (form.address.length > 255) {
    errors.address = 'Address cannot exceed 255 characters.';
  }

  if (!form.city.trim()) {
    errors.city = 'City is required.';
  } else if (form.city.trim().length < 2) {
    errors.city = 'City name must be at least 2 characters.';
  }

  const rentVal = parseFloat(form.rentAmount);
  if (!form.rentAmount || form.rentAmount === '') {
    errors.rentAmount = 'Monthly rent amount is required.';
  } else if (isNaN(rentVal) || rentVal <= 0) {
    errors.rentAmount = 'Monthly rent must be greater than ₹0.';
  } else if (rentVal > 10000000) {
    errors.rentAmount = 'Monthly rent cannot exceed ₹1,00,00,000.';
  }

  if (form.securityDeposit !== '' && form.securityDeposit !== null && form.securityDeposit !== undefined) {
    const depVal = parseFloat(form.securityDeposit);
    if (isNaN(depVal) || depVal < 0) {
      errors.securityDeposit = 'Security deposit cannot be negative.';
    } else if (depVal > 50000000) {
      errors.securityDeposit = 'Security deposit cannot exceed ₹5,00,00,000.';
    }
  }

  if (form.area !== '' && form.area !== null && form.area !== undefined) {
    const areaVal = parseInt(form.area);
    if (isNaN(areaVal) || areaVal < 10) {
      errors.area = 'Built-up area must be at least 10 sqft.';
    } else if (areaVal > 100000) {
      errors.area = 'Built-up area cannot exceed 1,00,000 sqft.';
    }
  }

  const isFormValid = Object.keys(errors).length === 0;

  const focusFirstInvalidField = (validationErrors) => {
    const fieldOrder = ['title', 'address', 'city', 'rentAmount', 'securityDeposit', 'area'];
    for (const field of fieldOrder) {
      if (validationErrors[field]) {
        const el = document.querySelector(`[name="${field}"]`);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');

    setTouched({
      title: true,
      description: true,
      address: true,
      city: true,
      rentAmount: true,
      securityDeposit: true,
      area: true
    });

    if (!isFormValid) {
      setError('Please resolve all highlighted fields before saving.');
      focusFirstInvalidField(errors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        description: form.description ? form.description.trim() : null,
        address: form.address.trim(),
        city: form.city.trim(),
        locality: form.locality ? form.locality.trim() : null,
        state: form.state ? form.state.trim() : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        rentAmount: parseFloat(form.rentAmount),
        securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : null,
        propertyType: form.propertyType,
        bedrooms: parseInt(form.bedrooms) || 1,
        bathrooms: parseInt(form.bathrooms) || 1,
        area: form.area ? parseInt(form.area) : null,
        furnishing: form.furnishing,
        imageUrls: uploadedImages.length > 0 ? uploadedImages.join('|') : '',
        amenities: form.amenities.join(','),
        available: form.available,
        ownerId: user.userId
      };

      await api.put(`/properties/${id}`, payload);

      setSuccess('Property details updated successfully! Redirecting...');
      setTimeout(() => navigate('/owner/dashboard'), 1400);
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update property.';
      setError(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading property information...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '850px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={() => navigate('/owner/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Edit Property Listing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Modify pricing, availability status, unit specifications, or photos.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6ee7b7',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Property Overview */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Building2 size={20} color="var(--primary)" /> 1. Property Overview
          </h3>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: '600' }}>Property Title *</label>
              <span style={{ fontSize: '0.75rem', color: form.title.length > 150 ? '#f87171' : 'var(--text-muted)' }}>
                {form.title.length} / 150
              </span>
            </div>
            <input
              type="text"
              name="title"
              maxLength={150}
              className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`}
              value={form.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              required
            />
            {touched.title && errors.title && (
              <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                {errors.title}
              </small>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: '600' }}>Description</label>
              <span style={{ fontSize: '0.75rem', color: form.description.length > 2000 ? '#f87171' : 'var(--text-muted)' }}>
                {form.description.length} / 2000
              </span>
            </div>
            <textarea
              name="description"
              maxLength={2000}
              className="form-control"
              rows="4"
              value={form.description}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Property Type</label>
              <select name="propertyType" className="form-select" value={form.propertyType} onChange={handleChange}>
                {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Furnishing Status</label>
              <select name="furnishing" className="form-select" value={form.furnishing} onChange={handleChange}>
                {furnishingOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <MapPin size={20} color="var(--primary)" /> 2. Location
          </h3>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: '600' }}>Street Address *</label>
            <input 
              ref={addressInputRef}
              type="text" 
              name="address" 
              maxLength={255}
              className={`form-control ${touched.address && errors.address ? 'is-invalid' : ''}`}
              value={form.address} 
              onChange={handleChange} 
              onBlur={() => handleBlur('address')}
              required 
            />
            {touched.address && errors.address && (
              <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                {errors.address}
              </small>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>City *</label>
              <select 
                className="form-select" 
                value={customCityMode ? 'Other' : (form.city && form.city in locationData ? form.city : '')} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setCustomCityMode(true);
                    setCustomLocalityMode(true);
                    setForm(prev => ({ ...prev, city: '', state: '', locality: '' }));
                  } else {
                    setCustomCityMode(false);
                    setCustomLocalityMode(false);
                    if (val) {
                      setForm(prev => ({ 
                        ...prev, 
                        city: val, 
                        state: locationData[val]?.state || '', 
                        locality: ''
                      }));
                    } else {
                      setForm(prev => ({ ...prev, city: '', state: '', locality: '' }));
                    }
                  }
                }}
                onBlur={() => handleBlur('city')}
                required
              >
                <option value="">Select City</option>
                {Object.keys(locationData).map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Other">Other (Type manually)</option>
              </select>

              {customCityMode && (
                <input 
                  type="text" 
                  name="city" 
                  className="form-control" 
                  placeholder="Enter custom city" 
                  value={form.city} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('city')}
                  style={{ marginTop: '0.5rem' }}
                  required 
                />
              )}
              {touched.city && errors.city && (
                <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                  {errors.city}
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Locality / Area</label>
              {!customCityMode && form.city && locationData[form.city] && !customLocalityMode ? (
                <select 
                  className="form-select" 
                  value={form.locality} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'Other') {
                      setCustomLocalityMode(true);
                      setForm(prev => ({ ...prev, locality: '' }));
                    } else {
                      setForm(prev => ({ ...prev, locality: val }));
                    }
                  }}
                >
                  <option value="">Select Locality</option>
                  {locationData[form.city].localities.map(l => <option key={l} value={l}>{l}</option>)}
                  <option value="Other">Other (Type manually)</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  name="locality" 
                  className="form-control" 
                  value={form.locality} 
                  onChange={handleChange} 
                />
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>State</label>
              <input 
                type="text" 
                name="state" 
                className="form-control" 
                value={form.state} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Unit */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <IndianRupee size={20} color="var(--primary)" /> 3. Rental & Unit Specifications
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: '600' }}>Monthly Rent (₹) *</label>
                {rentVal > 0 && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
                    ₹{Number(rentVal).toLocaleString('en-IN')} / mo
                  </span>
                )}
              </div>
              <input
                type="number"
                name="rentAmount"
                min="1"
                max="10000000"
                step="1"
                className={`form-control ${touched.rentAmount && errors.rentAmount ? 'is-invalid' : ''}`}
                value={form.rentAmount}
                onChange={handleChange}
                onBlur={() => handleBlur('rentAmount')}
                required
              />
              {touched.rentAmount && errors.rentAmount && (
                <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                  {errors.rentAmount}
                </small>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: '600' }}>Security Deposit (₹)</label>
                {form.securityDeposit && parseFloat(form.securityDeposit) > 0 && (
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>
                    ₹{Number(parseFloat(form.securityDeposit)).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <input
                type="number"
                name="securityDeposit"
                min="0"
                max="50000000"
                step="1"
                className={`form-control ${touched.securityDeposit && errors.securityDeposit ? 'is-invalid' : ''}`}
                value={form.securityDeposit}
                onChange={handleChange}
                onBlur={() => handleBlur('securityDeposit')}
              />
              {touched.securityDeposit && errors.securityDeposit && (
                <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                  {errors.securityDeposit}
                </small>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Bedrooms</label>
              <select name="bedrooms" className="form-select" value={form.bedrooms} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Bedroom' : 'Bedrooms'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Bathrooms</label>
              <select name="bathrooms" className="form-select" value={form.bathrooms} onChange={handleChange}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Bathroom' : 'Bathrooms'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Super Built-up Area (Sq. Ft.)</label>
              <input
                type="number"
                name="area"
                min="10"
                max="100000"
                className={`form-control ${touched.area && errors.area ? 'is-invalid' : ''}`}
                value={form.area}
                onChange={handleChange}
                onBlur={() => handleBlur('area')}
              />
              {touched.area && errors.area && (
                <small style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                  {errors.area}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Property Photos */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', margin: 0 }}>
              <ImageIcon size={20} color="var(--primary)" /> 4. Property Photos
            </h3>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: uploadedImages.length >= MAX_IMAGES ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: uploadedImages.length >= MAX_IMAGES ? '#f87171' : 'var(--primary)'
            }}>
              {uploadedImages.length} of {MAX_IMAGES} photos
            </span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '1.75rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              cursor: uploadedImages.length >= MAX_IMAGES ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}>
            <UploadCloud size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {uploadedImages.length >= MAX_IMAGES ? 'Maximum photo limit reached' : 'Select or drop more photos'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              JPG, PNG, WebP (Max 5MB each)
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileUpload}
              disabled={uploadedImages.length >= MAX_IMAGES}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                opacity: 0,
                cursor: uploadedImages.length >= MAX_IMAGES ? 'not-allowed' : 'pointer'
              }}
            />
          </div>

          {/* Photo Gallery Grid */}
          {uploadedImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
              {uploadedImages.map((img, index) => (
                <div key={index} style={{
                  position: 'relative',
                  height: '105px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: index === 0 ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: '#0f172a'
                }}>
                  <img
                    src={img}
                    alt={`Photo ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = FALLBACK; }}
                  />

                  {index === 0 && (
                    <span style={{
                      position: 'absolute', top: '4px', left: '4px',
                      backgroundColor: 'var(--primary)', color: 'white',
                      padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800'
                    }}>
                      Cover
                    </span>
                  )}

                  <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '3px' }}>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsCover(index)}
                        title="Set as cover photo"
                        style={{
                          background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fbbf24',
                          borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex'
                        }}>
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      title="Remove image"
                      style={{
                        background: 'rgba(239,68,68,0.85)', border: 'none', color: 'white',
                        borderRadius: '4px', padding: '3px', cursor: 'pointer', display: 'flex'
                      }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Included Amenities */}
        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderRadius: '14px' }}>
          <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            5. Included Amenities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {amenityOptions.map(amenity => {
              const isSelected = form.amenities.includes(amenity);
              return (
                <div
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  {amenity}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 6: Availability Toggle */}
        <div className="glass-card" style={{ padding: '1.5rem 1.75rem', marginBottom: '2rem', borderRadius: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Mark as Available for Booking
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                When unchecked, the property is marked as occupied/paused and will be hidden from tenant discovery searches.
              </div>
            </div>
          </label>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/owner/dashboard')}
            className="btn btn-secondary"
            disabled={submitting}
            style={{ fontWeight: '600' }}>
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{
              padding: '0.75rem 2rem',
              fontWeight: '800',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
            {submitting ? (
              <>
                <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                Saving Changes...
              </>
            ) : (
              'Save Property Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;
