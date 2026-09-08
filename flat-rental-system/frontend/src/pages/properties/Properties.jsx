import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { Search, MapPin, Bed, Bath, IndianRupee, Home, X, Building2, SlidersHorizontal } from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(window.innerWidth > 900);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    furnishing: searchParams.get('furnishing') || '',
    bedrooms: '',
    sort: 'newest'
  });

  const [locationStatus, setLocationStatus] = useState('');
  const autocompleteInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const detectLocation = async (isManualClick = false) => {
    // If user has already entered something and it is not a manual click, do not overwrite!
    if (filters.city && !isManualClick) return;

    if (!navigator.geolocation) {
      if (isManualClick) {
        setLocationStatus('notsupported');
        setTimeout(() => setLocationStatus(''), 5000);
      }
      return;
    }

    try {
      setLocationStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Helper for Nominatim fallback
          const runNominatimFallback = async () => {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const data = await response.json();
              if (data && data.address) {
                const resolvedCity = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county;
                if (resolvedCity) {
                  setFilters(prev => ({ ...prev, city: resolvedCity }));
                  setLocationStatus('success');
                  setTimeout(() => setLocationStatus(''), 3000);
                  return true;
                }
              }
            } catch (err) {
              console.error("Nominatim reverse geocoding failed: ", err);
            }
            return false;
          };

          try {
            const google = await loadGoogleMapsScript();
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat: latitude, lng: longitude } }, async (results, status) => {
              if (status === 'OK' && results[0]) {
                let city = '';
                let locality = '';
                const addressComponents = results[0].address_components;

                for (const component of addressComponents) {
                  const types = component.types;
                  if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('sublocality') || types.includes('neighborhood')) {
                    locality = component.long_name;
                  } else if (types.includes('administrative_area_level_2') && !city) {
                    city = component.long_name;
                  }
                }

                const resolvedCity = city || locality;
                if (resolvedCity) {
                  setFilters(prev => ({ ...prev, city: resolvedCity }));
                  setLocationStatus('success');
                  setTimeout(() => setLocationStatus(''), 3000);
                } else {
                  const success = await runNominatimFallback();
                  if (!success) {
                    setLocationStatus('geocoding_failed');
                    setTimeout(() => setLocationStatus(''), 5000);
                  }
                }
              } else {
                console.warn("Google Geocoder failed or no results. Falling back to Nominatim.");
                const success = await runNominatimFallback();
                if (!success) {
                  setLocationStatus('geocoding_failed');
                  setTimeout(() => setLocationStatus(''), 5000);
                }
              }
            });
          } catch (e) {
            console.warn("Google Maps load failed. Falling back to Nominatim.");
            const success = await runNominatimFallback();
            if (!success) {
              setLocationStatus('geocoding_failed');
              setTimeout(() => setLocationStatus(''), 5000);
            }
          }
        },
        (error) => {
          console.warn("Geolocation permission error: ", error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationStatus('denied');
          } else {
            setLocationStatus('failed');
          }
          setTimeout(() => setLocationStatus(''), 6000);
        },
        { timeout: 8000 }
      );
    } catch (err) {
      setLocationStatus('failed');
      setTimeout(() => setLocationStatus(''), 5000);
    }
  };

  // Run on mount
  useEffect(() => {
    detectLocation(false);
  }, []);

  // Initialize Places Autocomplete
  useEffect(() => {
    let active = true;
    loadGoogleMapsScript()
      .then((google) => {
        if (!active || !autocompleteInputRef.current) return;
        const options = {
          types: ['(cities)'],
          componentRestrictions: { country: 'in' }
        };
        const autocomplete = new google.maps.Autocomplete(autocompleteInputRef.current, options);
        autocompleteRef.current = autocomplete;
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.address_components) {
            let city = '';
            for (const component of place.address_components) {
              if (component.types.includes('locality')) {
                city = component.long_name;
                break;
              } else if (component.types.includes('administrative_area_level_2')) {
                city = component.long_name;
              }
            }
            const selectedCity = city || place.name || '';
            setFilters(prev => ({ ...prev, city: selectedCity }));
          }
        });
      })
      .catch((err) => {
        console.log("Places Autocomplete not initialized: Maps API key missing or invalid.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await api.get('/properties');
        setProperties(res.data);
      } catch (err) {
        setError('Failed to load properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    let result = properties.filter(p => p.available !== false);

    if (filters.city) {
      const q = filters.city.toLowerCase();
      result = result.filter(p =>
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.locality && p.locality.toLowerCase().includes(q))
      );
    }
    if (filters.type) {
      result = result.filter(p => p.propertyType === filters.type);
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.rentAmount && parseFloat(p.rentAmount) <= parseFloat(filters.maxPrice));
    }
    if (filters.furnishing) {
      result = result.filter(p => p.furnishing === filters.furnishing);
    }
    if (filters.bedrooms) {
      const bedCount = parseInt(filters.bedrooms);
      if (bedCount === 4) {
        result = result.filter(p => p.bedrooms >= 4);
      } else {
        result = result.filter(p => p.bedrooms === bedCount);
      }
    }

    if (filters.sort === 'price-asc') result.sort((a, b) => a.rentAmount - b.rentAmount);
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.rentAmount - a.rentAmount);
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFiltered(result);
  }, [properties, filters]);

  const clearFilters = () => setFilters({ city: '', type: '', maxPrice: '', furnishing: '', bedrooms: '', sort: 'newest' });
  const hasFilters = filters.city || filters.type || filters.maxPrice || filters.furnishing || filters.bedrooms;

  const getFirstImage = (p) => {
    if (!p.imageUrls) return FALLBACK_IMG;
    const images = splitImageUrls(p.imageUrls);
    return images.length > 0 ? images[0] : FALLBACK_IMG;
  };

  const parseAmenities = (p) => {
    if (!p.amenities) return [];
    return p.amenities.split(',').map(a => a.trim()).filter(Boolean);
  };

  const sidebarStyle = {
    width: '280px',
    flexShrink: 0,
    position: 'sticky',
    top: '90px',
    alignSelf: 'flex-start'
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>Browse Properties</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card" style={{ height: '380px', animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Browse Properties</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'none' }} id="mobile-filter-btn">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select className="form-select" value={filters.sort}
            onChange={e => setFilters({...filters, sort: e.target.value})}
            style={{ width: 'auto', minWidth: '160px' }}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div className="properties-container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <div className="glass-card filters-sidebar" style={{ ...sidebarStyle, padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                Clear All
              </button>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label className="form-label" style={{ margin: 0 }}>City / Locality</label>
              <button 
                type="button" 
                onClick={() => detectLocation(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  cursor: 'pointer', 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <MapPin size={12} /> Use current location
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                ref={autocompleteInputRef}
                type="text" 
                className="form-control" 
                placeholder="e.g. Mumbai"
                style={{ paddingLeft: '2.25rem', paddingRight: '2rem' }}
                value={filters.city} 
                onChange={e => setFilters({...filters, city: e.target.value})} 
              />
              {filters.city && (
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, city: '' }))}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* Geolocation Status Indicator */}
            {locationStatus === 'detecting' && (
              <small style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Detecting location...
              </small>
            )}
            {locationStatus === 'success' && (
              <small style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Location resolved successfully!
              </small>
            )}
            {locationStatus === 'denied' && (
              <small style={{ color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Location permission denied. Please allow location access or search manually.
              </small>
            )}
            {locationStatus === 'failed' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Unable to detect your current location. Please allow location access or search manually.
              </small>
            )}
            {locationStatus === 'geocoding_failed' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Unable to determine city from your current location. Please search manually.
              </small>
            )}
            {locationStatus === 'notsupported' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Geolocation not supported by browser.
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select className="form-select" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
              <option value="">All Types</option>
              <option value="STUDIO">Studio</option>
              <option value="ONE_BHK">1 BHK</option>
              <option value="TWO_BHK">2 BHK</option>
              <option value="THREE_BHK">3 BHK</option>
              <option value="VILLA">Villa</option>
              <option value="PG">PG</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Max Rent (₹/month)</label>
            <input type="number" className="form-control" placeholder="e.g. 25000"
              value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
          </div>

          <div className="form-group">
            <label className="form-label">Furnishing</label>
            <select className="form-select" value={filters.furnishing} onChange={e => setFilters({...filters, furnishing: e.target.value})}>
              <option value="">Any</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <select className="form-select" value={filters.bedrooms} onChange={e => setFilters({...filters, bedrooms: e.target.value})}>
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>

        {/* Property Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {filtered.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Home size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>No properties found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try adjusting your filters to see more results.</p>
              {hasFilters && <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(property => {
                const amenities = parseAmenities(property);
                return (
                  <Link to={`/properties/${property.id}`} key={property.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-card property-card" style={{ overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                      {/* Image */}
                      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                        <img src={getFirstImage(property)} alt={property.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = FALLBACK_IMG; }} />
                        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700',
                            backgroundColor: 'rgba(99, 102, 241, 0.9)', color: 'white', backdropFilter: 'blur(4px)',
                            textTransform: 'uppercase', letterSpacing: '0.03em'
                          }}>
                            {(property.propertyType || '').replace('_', ' ')}
                          </span>
                        </div>
                        {property.furnishing && (
                          <span style={{
                            position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                            padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600',
                            backgroundColor: 'rgba(0,0,0,0.65)', color: '#e2e8f0', backdropFilter: 'blur(4px)'
                          }}>
                            {property.furnishing}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {property.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          <MapPin size={13} />
                          {property.locality ? `${property.locality}, ` : ''}{property.city}
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            <Bed size={15} /> {property.bedrooms} Bed
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            <Bath size={15} /> {property.bathrooms} Bath
                          </span>
                          {property.area && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                              {property.area} sqft
                            </span>
                          )}
                        </div>

                        {amenities.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {amenities.slice(0, 3).map((a, i) => (
                              <span key={i} style={{
                                padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: '500'
                              }}>{a}</span>
                            ))}
                            {amenities.length > 3 && (
                              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                                backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-muted)', fontWeight: '500'
                              }}>+{amenities.length - 3} more</span>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                            <IndianRupee size={16} />{Number(property.rentAmount).toLocaleString('en-IN')}
                            <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/mo</span>
                          </span>
                          <span className="btn btn-primary btn-sm">View</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .properties-container { flex-direction: column !important; }
          .filters-sidebar { 
            width: 100% !important; 
            position: static !important; 
            display: ${showFilters ? 'block' : 'none'} !important; 
          }
          #mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Properties;
