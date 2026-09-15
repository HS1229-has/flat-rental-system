import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { Building2, MapPin, IndianRupee, Bed, Bath, Ruler, ArrowLeft, CheckCircle, AlertCircle, Image, Trash2 } from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

const propertyTypes = [
  { value: 'STUDIO', label: 'Studio' },
  { value: 'ONE_BHK', label: '1 BHK' },
  { value: 'TWO_BHK', label: '2 BHK' },
  { value: 'THREE_BHK', label: '3 BHK' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PG', label: 'PG' },
];

const furnishingOptions = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const amenityOptions = ['WiFi', 'AC', 'Parking', 'Gym', 'Security', 'Power Backup', 'Water Supply', 'Lift', 'Swimming Pool', 'Garden'];

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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
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

  const handleFileUpload = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid JPG, JPEG, PNG or WebP image.');
        return;
      }
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB.');
        return;
      }
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
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
      } catch (err) {
        setError('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user]);

  // Initialize Address Places Autocomplete
  useEffect(() => {
    let active = true;
    loadGoogleMapsScript()
      .then((google) => {
        if (!active || !addressInputRef.current) return;
        const options = {
          types: ['address'],
          componentRestrictions: { country: 'in' } // Bias/restrict to India
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
      .catch((err) => {
        console.log("Places Autocomplete not loaded: Maps API key missing or invalid.");
      });

    return () => {
      active = false;
    };
  }, [loading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.address || !form.city || !form.rentAmount) {
      setError('Please fill all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        locality: form.locality,
        state: form.state,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        rentAmount: parseFloat(form.rentAmount),
        securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : null,
        propertyType: form.propertyType,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        area: form.area ? parseInt(form.area) : null,
        furnishing: form.furnishing,
        imageUrls: uploadedImages.length > 0 ? uploadedImages.join('|') : (form.imageUrls || ''),
        amenities: form.amenities.join(','),
        available: form.available,
        ownerId: user.userId
      };

      await api.put(`/properties/${id}`, payload);

      setSuccess('Property updated successfully! Redirecting...');
      setTimeout(() => navigate('/owner/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update property.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card" style={{ height: '400px', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Edit Property</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Update details for your listing on LuxeFlats</p>

      {error && !form.title ? (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={20} color="var(--primary)" /> Basic Information
            </h3>

            <div className="form-group">
              <label className="form-label">Property Title *</label>
              <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="4" value={form.description} onChange={handleChange} style={{ resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Property Type</label>
                <select name="propertyType" className="form-select" value={form.propertyType} onChange={handleChange}>
                  {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Furnishing</label>
                <select name="furnishing" className="form-select" value={form.furnishing} onChange={handleChange}>
                  {furnishingOptions.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <input type="checkbox" name="available" id="available" checked={form.available} onChange={handleChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              <label htmlFor="available" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>Mark as Available for Booking</label>
            </div>
          </div>

          {/* Location */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--primary)" /> Location
            </h3>

            <div className="form-group">
              <label className="form-label">Address (Search & select location) *</label>
              <input 
                ref={addressInputRef}
                type="text" 
                name="address" 
                className="form-control" 
                value={form.address} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'start' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
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
                          locality: '' // Clean empty, user selects locality
                        }));
                      } else {
                        setForm(prev => ({ ...prev, city: '', state: '', locality: '' }));
                      }
                    }
                  }}
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
                    style={{ marginTop: '0.5rem' }}
                    required 
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Locality</label>
                {form.city && locationData[form.city] && !customLocalityMode ? (
                  <select 
                    name="locality" 
                    className="form-select" 
                    value={form.locality} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__OTHER__') {
                        setCustomLocalityMode(true);
                        setForm(prev => ({ ...prev, locality: '' }));
                      } else {
                        setForm(prev => ({ ...prev, locality: val }));
                      }
                    }}
                  >
                    <option value="">Select Locality</option>
                    {locationData[form.city].localities.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                    <option value="__OTHER__">+ Other (Type manually)</option>
                  </select>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      name="locality" 
                      className="form-control" 
                      placeholder="e.g. Andheri West" 
                      value={form.locality} 
                      onChange={handleChange} 
                    />
                    {form.city && locationData[form.city] && (
                      <button 
                        type="button" 
                        onClick={() => { setCustomLocalityMode(false); setForm(prev => ({ ...prev, locality: '' })); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', padding: '3px 0', marginTop: '2px' }}
                      >
                        ← Back to locality dropdown
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  name="state" 
                  className="form-control" 
                  placeholder="e.g. Maharashtra" 
                  value={form.state} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            {form.latitude && form.longitude && (
              <small style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                ✓ Location coordinates pinned: {parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}
              </small>
            )}
          </div>

          {/* Pricing & Specs */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IndianRupee size={20} color="var(--primary)" /> Pricing & Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Monthly Rent (₹) *</label>
                <input type="number" name="rentAmount" className="form-control" value={form.rentAmount} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input type="number" name="securityDeposit" className="form-control" value={form.securityDeposit} onChange={handleChange} min="0" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select name="bedrooms" className="form-select" value={form.bedrooms} onChange={handleChange}>
                  {[0,1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select name="bathrooms" className="form-select" value={form.bathrooms} onChange={handleChange}>
                  {[1,2,3,4].map(n => <option key={n} value={String(n)}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Area (sqft)</label>
                <input type="number" name="area" className="form-control" value={form.area} onChange={handleChange} min="0" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image size={20} color="var(--primary)" /> Images
            </h3>
            <div className="form-group">
              <label className="form-label">Upload Photos from Device</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                id="file-upload-input" 
              />
              <label 
                htmlFor="file-upload-input" 
                className="btn btn-secondary" 
                style={{ display: 'inline-flex', alignSelf: 'flex-start', cursor: 'pointer', gap: '0.5rem' }}
              >
                Select Images
              </label>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Select one or more photos of your property from your computer
              </small>
            </div>

            {/* Thumbnails of uploaded images with primary/cover options */}
            {uploadedImages.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Property Photos ({uploadedImages.length})</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ★ First image is the Main Cover Photo shown in search
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
                  {uploadedImages.map((base64, index) => {
                    const isCover = index === 0;
                    return (
                      <div key={index} className="glass-card" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        border: isCover ? '2.5px solid #6366f1' : '1px solid var(--border-color)',
                        boxShadow: isCover ? '0 0 15px rgba(99, 102, 241, 0.35)' : 'none',
                        backgroundColor: 'var(--card-bg, #1e293b)',
                        transition: 'all 0.25s ease'
                      }}>
                        <div style={{ position: 'relative', height: '120px' }}>
                          <img src={base64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {isCover && (
                            <span style={{ 
                              position: 'absolute', 
                              top: '6px', 
                              left: '6px', 
                              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                              color: 'white', 
                              fontSize: '0.7rem', 
                              fontWeight: '800', 
                              padding: '3px 8px', 
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                              ★ COVER PHOTO
                            </span>
                          )}
                          <button 
                            type="button" 
                            onClick={() => {
                              if (window.confirm("Delete this property image?")) {
                                removeUploadedImage(index);
                              }
                            }}
                            style={{ 
                              position: 'absolute', 
                              top: '6px', 
                              right: '6px', 
                              backgroundColor: 'rgba(0,0,0,0.7)', 
                              border: 'none', 
                              color: '#ff4d4f', 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                            title="Delete image"
                          >
                            ✕
                          </button>
                        </div>
                        <div style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center' }}>
                          {isCover ? (
                            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '700', padding: '0.2rem' }}>
                              ✓ Active Cover Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAsCover(index)}
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', fontSize: '0.78rem', padding: '0.3rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              ★ Set as Cover
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {amenityOptions.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: form.amenities.includes(a) ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: form.amenities.includes(a) ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: form.amenities.includes(a) ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: form.amenities.includes(a) ? '700' : '500',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                  {form.amenities.includes(a) && <CheckCircle size={14} />}
                  {a}
                </button>
              ))}
            </div>
          </div>

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

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting} style={{ marginBottom: '2rem' }}>
            {submitting ? 'Updating Property...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProperty;
