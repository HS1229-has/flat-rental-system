import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  Search, MapPin, Bed, Bath, IndianRupee, Home, X, Building2, SlidersHorizontal,
  Sparkles, Map as MapIcon, Grid, Compass, CheckCircle, AlertCircle, Camera,
  RotateCcw, Shield, Check, Heart
} from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';
import { loadLeafletScript, CITY_COORDINATES } from '../../utils/leafletMap';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const PROPERTY_TYPE_LABELS = {
  STUDIO: 'Studio',
  ONE_BHK: '1 BHK',
  TWO_BHK: '2 BHK',
  THREE_BHK: '3 BHK',
  VILLA: 'Villa',
  PG: 'PG'
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(window.innerWidth > 900);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState(() => ({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    furnishing: searchParams.get('furnishing') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    availableOnly: searchParams.get('available') !== 'all',
    sort: searchParams.get('sort') || 'newest'
  }));

  const [locationStatus, setLocationStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [showEstimator, setShowEstimator] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimatorForm, setEstimatorForm] = useState({
    city: 'Bangalore',
    locality: 'Indiranagar',
    bedrooms: 2,
    bathrooms: 2,
    area: 950,
    furnishing: 'Furnished',
    hasParking: true,
    hasGym: true,
    hasPowerBackup: true,
    hasSecurity: true
  });
  const [estimatorResult, setEstimatorResult] = useState(null);
  const [estimatorError, setEstimatorError] = useState(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const autocompleteInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const key = `favorites_${user?.userId || user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  const toggleFavorite = (e, prop) => {
    e.preventDefault();
    e.stopPropagation();
    const key = `favorites_${user?.userId || user?.id || 'guest'}`;
    let updated;
    const exists = favorites.some(f => f.id === prop.id);
    if (exists) {
      updated = favorites.filter(f => f.id !== prop.id);
    } else {
      updated = [...favorites, prop];
    }
    setFavorites(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // Synchronize state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (filters.type) params.set('type', filters.type);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.furnishing) params.set('furnishing', filters.furnishing);
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (!filters.availableOnly) params.set('available', 'all');
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const calculateLocalRentEstimate = (form) => {
    const city = (form.city || '').trim().toLowerCase();
    let baseRate = 18.0;
    if (city.includes('mumbai')) baseRate = 45.0;
    else if (city.includes('bangalore') || city.includes('bengaluru')) baseRate = 32.0;
    else if (city.includes('delhi') || city.includes('gurgaon') || city.includes('noida')) baseRate = 30.0;
    else if (city.includes('pune')) baseRate = 25.0;
    else if (city.includes('hyderabad')) baseRate = 24.0;
    else if (city.includes('chennai')) baseRate = 22.0;

    const area = Number(form.area) || 600;
    let calculatedBaseRent = area * baseRate;

    const bedrooms = Number(form.bedrooms) || 1;
    if (bedrooms >= 3) calculatedBaseRent *= 1.15;
    else if (bedrooms === 2) calculatedBaseRent *= 1.05;

    let furnishingPremium = 0.0;
    const furnishing = (form.furnishing || '').toLowerCase();
    if (furnishing.includes('fully') || furnishing === 'furnished') {
      furnishingPremium = calculatedBaseRent * 0.22;
    } else if (furnishing.includes('semi')) {
      furnishingPremium = calculatedBaseRent * 0.10;
    }

    let amenityBonus = 0.0;
    if (form.hasParking) amenityBonus += 2000.0;
    if (form.hasGym) amenityBonus += 1500.0;
    if (form.hasPowerBackup) amenityBonus += 1200.0;
    if (form.hasSecurity) amenityBonus += 800.0;

    const totalRent = calculatedBaseRent + furnishingPremium + amenityBonus;
    const roundedRent = Math.round(totalRent / 500.0) * 500;
    const minRent = Math.round((roundedRent * 0.92) / 500.0) * 500;
    const maxRent = Math.round((roundedRent * 1.08) / 500.0) * 500;

    let confidence = (city.includes('bangalore') || city.includes('mumbai') || city.includes('delhi')) ? 94 : 88;
    if (form.locality && form.locality.trim()) {
      confidence = Math.min(98, confidence + 3);
    }

    const demand = roundedRent > 35000 ? "High Demand (Executive Category)" : "High Demand (Quick Turnover)";
    const summary = `AI Estimated Rent for ${form.furnishing || 'Standard'} (${area} sqft, ${bedrooms} BHK) in ${form.city}. Market range ₹${minRent.toLocaleString('en-IN')} - ₹${maxRent.toLocaleString('en-IN')}.`;

    return {
      estimatedRent: roundedRent,
      minRent: minRent,
      maxRent: maxRent,
      confidenceScore: confidence,
      marketDemand: demand,
      baseRent: Math.round(calculatedBaseRent),
      furnishingPremium: Math.round(furnishingPremium),
      amenityBonus: Math.round(amenityBonus),
      ratePerSqFt: baseRate,
      summary: summary
    };
  };

  const handleEstimateRent = async (e) => {
    if (e) e.preventDefault();
    setEstimatorError(null);

    const areaNum = Number(estimatorForm.area);
    if (!estimatorForm.city || !estimatorForm.city.trim()) {
      setEstimatorError("Please select or enter a valid city.");
      return;
    }
    if (!areaNum || areaNum < 50) {
      setEstimatorError("Please enter a valid area (minimum 50 sq. ft.).");
      return;
    }
    if (!estimatorForm.bedrooms || Number(estimatorForm.bedrooms) < 1) {
      setEstimatorError("Number of bedrooms must be at least 1.");
      return;
    }

    const payload = {
      ...estimatorForm,
      area: areaNum,
      bedrooms: Number(estimatorForm.bedrooms),
      bathrooms: Number(estimatorForm.bathrooms) || 1,
      propertyType: Number(estimatorForm.bedrooms) === 1 ? 'ONE_BHK' : Number(estimatorForm.bedrooms) === 2 ? 'TWO_BHK' : Number(estimatorForm.bedrooms) === 3 ? 'THREE_BHK' : 'VILLA'
    };

    try {
      setEstimating(true);
      const res = await api.post('/properties/estimate-rent', payload);
      if (res && res.data && res.data.estimatedRent) {
        setEstimatorResult(res.data);
      } else {
        setEstimatorResult(calculateLocalRentEstimate(payload));
      }
    } catch (err) {
      console.warn("Backend rent estimation call fell back to AI heuristic engine:", err);
      const fallback = calculateLocalRentEstimate(payload);
      setEstimatorResult(fallback);
    } finally {
      setEstimating(false);
    }
  };

  const detectLocation = async (isManualClick = false) => {
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
                const success = await runNominatimFallback();
                if (!success) {
                  setLocationStatus('geocoding_failed');
                  setTimeout(() => setLocationStatus(''), 5000);
                }
              }
            });
          } catch (e) {
            const success = await runNominatimFallback();
            if (!success) {
              setLocationStatus('geocoding_failed');
              setTimeout(() => setLocationStatus(''), 5000);
            }
          }
        },
        (error) => {
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
      .catch(() => {
        // Silently handled: user can type manually
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/properties');
      setProperties(res.data || []);
    } catch (err) {
      console.error("Fetch properties error:", err);
      setError('Cannot connect to Backend API (http://localhost:8080/api/properties). Please make sure API Gateway and Property Service are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter and sort properties with universal search matching
  const filtered = useMemo(() => {
    let result = [...properties];

    // Availability filter
    if (filters.availableOnly) {
      result = result.filter(p => p.available !== false);
    }

    // Universal search: City, Locality, Address, Title, State
    if (filters.city && filters.city.trim()) {
      const q = filters.city.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);

      result = result.filter(p => {
        const title = (p.title || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        const locality = (p.locality || '').toLowerCase();
        const address = (p.address || '').toLowerCase();
        const state = (p.state || '').toLowerCase();
        const full = `${title} ${city} ${locality} ${address} ${state}`;

        // Either substring matches or all separate tokens match
        return full.includes(q) || tokens.every(tok => full.includes(tok));
      });
    }

    if (filters.type) {
      result = result.filter(p => p.propertyType === filters.type);
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max) && max > 0) {
        result = result.filter(p => p.rentAmount && parseFloat(p.rentAmount) <= max);
      }
    }

    if (filters.furnishing) {
      result = result.filter(p => p.furnishing === filters.furnishing);
    }

    if (filters.bedrooms) {
      const bedCount = parseInt(filters.bedrooms);
      if (bedCount === 4) {
        result = result.filter(p => (p.bedrooms || 0) >= 4);
      } else {
        result = result.filter(p => (p.bedrooms || 0) === bedCount);
      }
    }

    // Sorting
    if (filters.sort === 'price-asc') {
      result.sort((a, b) => (Number(a.rentAmount) || 0) - (Number(b.rentAmount) || 0));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => (Number(b.rentAmount) || 0) - (Number(a.rentAmount) || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [properties, filters]);

  // Leaflet Interactive Map Lifecycle
  useEffect(() => {
    if (viewMode !== 'map') return;

    let isMounted = true;
    loadLeafletScript().then(L => {
      if (!isMounted) return;

      const container = document.getElementById('leaflet-map-container');
      if (!container) return;

      let center = CITY_COORDINATES.bangalore;
      if (filters.city) {
        const cityKey = filters.city.trim().toLowerCase();
        if (CITY_COORDINATES[cityKey]) {
          center = CITY_COORDINATES[cityKey];
        }
      } else if (filtered.length > 0 && filtered[0].latitude && filtered[0].longitude) {
        center = [filtered[0].latitude, filtered[0].longitude];
      }

      if (!mapInstanceRef.current) {
        const map = L.map('leaflet-map-container', {
          center: center,
          zoom: 12,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView(center, 12);
        mapInstanceRef.current.invalidateSize();
      }

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      filtered.forEach((p, idx) => {
        let lat = p.latitude;
        let lng = p.longitude;
        if (!lat || !lng) {
          const cityKey = (p.city || 'bangalore').toLowerCase();
          const baseCoords = CITY_COORDINATES[cityKey] || CITY_COORDINATES.bangalore;
          const angle = (idx * 0.9) % (2 * Math.PI);
          const radius = 0.015 + ((idx % 5) * 0.006);
          lat = baseCoords[0] + radius * Math.cos(angle);
          lng = baseCoords[1] + radius * Math.sin(angle);
        }

        const priceText = '₹' + Number(p.rentAmount || 0).toLocaleString('en-IN');
        const customIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `<div style="
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid #ffffff;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">${priceText}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 30]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);

        const popupContent = `
          <div style="font-family: inherit; width: 220px; color: #0f172a; padding: 4px;">
            <img src="${getFirstImage(p)}" style="width:100%; height:110px; object-fit:cover; border-radius:6px; margin-bottom:6px;" />
            <div style="font-weight:700; font-size:13px; margin-bottom:2px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${p.title}</div>
            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">📍 ${p.locality ? p.locality + ', ' : ''}${p.city} &bull; ${p.bedrooms || 1} BHK</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:800; color:#4f46e5; font-size:13px;">${priceText}<span style="font-size:9px; font-weight:400; color:#64748b;">/mo</span></span>
              <a href="/properties/${p.id}" style="background:#4f46e5; color:#ffffff; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:700; text-decoration:none;">View Details</a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });
    }).catch(err => {
      console.warn("Leaflet map load warning:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [viewMode, filtered, filters.city]);

  const clearFilters = () => setFilters({
    city: '',
    type: '',
    maxPrice: '',
    furnishing: '',
    bedrooms: '',
    availableOnly: true,
    sort: 'newest'
  });

  const removeFilter = (key, fallbackVal = '') => {
    setFilters(prev => ({ ...prev, [key]: fallbackVal }));
  };

  const hasActiveFilters = Boolean(
    filters.city ||
    filters.type ||
    filters.maxPrice ||
    filters.furnishing ||
    filters.bedrooms ||
    !filters.availableOnly
  );

  const getFirstImage = (p) => {
    if (!p.imageUrls) return FALLBACK_IMG;
    const images = splitImageUrls(p.imageUrls);
    return images.length > 0 ? images[0] : FALLBACK_IMG;
  };

  const getImageCount = (p) => {
    if (!p.imageUrls) return 1;
    const images = splitImageUrls(p.imageUrls);
    return Math.max(1, images.length);
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
      <div style={{ padding: '2rem 1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ height: '32px', width: '240px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', animation: 'pulse 1.5s infinite', marginBottom: '0.5rem' }}></div>
            <div style={{ height: '18px', width: '140px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ width: '280px', height: '450px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card" style={{ height: '360px', animation: 'pulse 1.5s infinite', borderRadius: '12px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>Discover Properties</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Showing <strong>{filtered.length}</strong> of {properties.length} available listing{properties.length === 1 ? '' : 's'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* AI Rent Estimator Trigger */}
          <button 
            type="button"
            className="btn btn-sm"
            onClick={() => { setEstimatorError(null); setShowEstimator(true); }}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              cursor: 'pointer'
            }}>
            <Sparkles size={15} /> AI Rent Estimator
          </button>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}>
              <Grid size={14} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              style={{
                background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}>
              <MapIcon size={14} /> Map View
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}
            style={{ display: 'none' }} id="mobile-filter-btn">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <select className="form-select" value={filters.sort}
            onChange={e => setFilters({...filters, sort: e.target.value})}
            style={{ width: 'auto', minWidth: '150px' }}>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <SlidersHorizontal size={13} /> Active Filters:
          </span>

          {filters.city && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: '600'
            }}>
              Search: "{filters.city}"
              <button
                type="button"
                onClick={() => removeFilter('city')}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          {filters.type && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: '600'
            }}>
              Type: {PROPERTY_TYPE_LABELS[filters.type] || filters.type}
              <button
                type="button"
                onClick={() => removeFilter('type')}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          {filters.maxPrice && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: '600'
            }}>
              Max: ₹{Number(filters.maxPrice).toLocaleString('en-IN')}/mo
              <button
                type="button"
                onClick={() => removeFilter('maxPrice')}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          {filters.furnishing && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: '600'
            }}>
              Furnishing: {filters.furnishing}
              <button
                type="button"
                onClick={() => removeFilter('furnishing')}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          {filters.bedrooms && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#a5b4fc',
              fontWeight: '600'
            }}>
              Bedrooms: {filters.bedrooms === '4' ? '4+ BHK' : `${filters.bedrooms} BHK`}
              <button
                type="button"
                onClick={() => removeFilter('bedrooms')}
                style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          {!filters.availableOnly && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: '#fca5a5',
              fontWeight: '600'
            }}>
              Showing All (Inc. Occupied)
              <button
                type="button"
                onClick={() => removeFilter('availableOnly', true)}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '700',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
            <RotateCcw size={12} /> Clear All
          </button>
        </div>
      )}

      <div className="properties-container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Sidebar Filters */}
        <div className="glass-card filters-sidebar" style={{ ...sidebarStyle, padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SlidersHorizontal size={17} color="var(--primary)" /> Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                Reset
              </button>
            )}
          </div>

          {/* Universal Search Input */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>Search Location / Title</label>
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
                <MapPin size={12} /> Detect
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                ref={autocompleteInputRef}
                type="text" 
                className="form-control" 
                placeholder="City, locality, title, address..."
                style={{ paddingLeft: '2.25rem', paddingRight: '2rem', fontSize: '0.85rem' }}
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
                Location access denied. Please search manually.
              </small>
            )}
            {locationStatus === 'failed' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Unable to detect location. Please enter city manually.
              </small>
            )}
            {locationStatus === 'geocoding_failed' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                City could not be resolved from coordinates.
              </small>
            )}
            {locationStatus === 'notsupported' && (
              <small style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Geolocation not supported by browser.
              </small>
            )}
          </div>

          {/* Property Type */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Property Type</label>
            <select className="form-select" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} style={{ fontSize: '0.85rem' }}>
              <option value="">All Types</option>
              <option value="STUDIO">Studio</option>
              <option value="ONE_BHK">1 BHK</option>
              <option value="TWO_BHK">2 BHK</option>
              <option value="THREE_BHK">3 BHK</option>
              <option value="VILLA">Villa</option>
              <option value="PG">PG</option>
            </select>
          </div>

          {/* Max Rent */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Max Rent (₹/month)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 35000"
              min="0"
              style={{ fontSize: '0.85rem' }}
              value={filters.maxPrice}
              onChange={e => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>

          {/* Furnishing */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Furnishing Status</label>
            <select className="form-select" value={filters.furnishing} onChange={e => setFilters({...filters, furnishing: e.target.value})} style={{ fontSize: '0.85rem' }}>
              <option value="">Any</option>
              <option value="Furnished">Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>

          {/* Bedrooms */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Bedrooms</label>
            <select className="form-select" value={filters.bedrooms} onChange={e => setFilters({...filters, bedrooms: e.target.value})} style={{ fontSize: '0.85rem' }}>
              <option value="">Any</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="form-group" style={{ marginBottom: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={e => setFilters(prev => ({ ...prev, availableOnly: e.target.checked }))}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              Available for Booking Only
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem', marginLeft: '1.6rem' }}>
              Hide occupied/unavailable flats
            </span>
          </div>
        </div>

        {/* Property Grid or Map View */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: '10px', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchProperties}
                className="btn btn-sm btn-primary"
                style={{ whiteSpace: 'nowrap', fontWeight: '700', padding: '0.4rem 0.9rem' }}>
                Retry Connection
              </button>
            </div>
          )}

          {viewMode === 'map' ? (
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  <Compass size={18} color="var(--primary)" /> Interactive Map Explorer ({filtered.length} plotted)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Click price tags to preview property photos & specs
                </div>
              </div>
              <div id="leaflet-map-container" style={{ height: '580px', width: '100%', borderRadius: '10px', zIndex: 1 }}></div>
            </div>
          ) : filtered.length === 0 && !loading ? (
            /* Intelligent Empty / Contradictory State */
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '16px' }}>
              <Home size={60} color="var(--text-muted)" style={{ marginBottom: '1.25rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Matching Properties Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.75rem auto', lineHeight: '1.5', fontSize: '0.9rem' }}>
                {filters.city && filters.maxPrice ? (
                  <>We couldn't find listings in <strong>"{filters.city}"</strong> with monthly rent under <strong>₹{Number(filters.maxPrice).toLocaleString('en-IN')}</strong>.</>
                ) : filters.city ? (
                  <>No listings matched <strong>"{filters.city}"</strong>. Try checking the spelling, or search across broader localities.</>
                ) : (
                  <>Your current filter criteria didn't match any available listings. Try expanding your search options.</>
                )}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {filters.maxPrice && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeFilter('maxPrice')}>
                    Remove Price Filter
                  </button>
                )}
                {filters.city && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeFilter('city')}>
                    Search All Cities
                  </button>
                )}
                {!filters.availableOnly && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => removeFilter('availableOnly', true)}>
                    Filter Available Only
                  </button>
                )}
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={clearFilters}>
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(property => {
                const amenities = parseAmenities(property);
                const imageCount = getImageCount(property);
                const isAvailable = property.available !== false;

                return (
                  <Link to={`/properties/${property.id}`} key={property.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="glass-card property-card" style={{ overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease', cursor: 'pointer', borderRadius: '14px', height: '100%', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                      
                      {/* Image & Badges */}
                      <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
                        <img src={getFirstImage(property)} alt={property.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = FALLBACK_IMG; }} />

                        {/* Top Left: Property Type */}
                        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700',
                            backgroundColor: 'rgba(99, 102, 241, 0.9)', color: 'white', backdropFilter: 'blur(6px)',
                            textTransform: 'uppercase', letterSpacing: '0.03em'
                          }}>
                            {PROPERTY_TYPE_LABELS[property.propertyType] || (property.propertyType || '').replace('_', ' ')}
                          </span>

                          {!isAvailable && (
                            <span style={{
                              padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700',
                              backgroundColor: 'rgba(239, 68, 68, 0.95)', color: 'white', backdropFilter: 'blur(6px)'
                            }}>
                              Unavailable
                            </span>
                          )}
                        </div>

                        {/* Top Right: Photo Count Badge & Heart Button */}
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', zIndex: 3 }}>
                          {imageCount > 1 && (
                            <div style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              backgroundColor: 'rgba(15, 23, 42, 0.75)',
                              color: '#ffffff',
                              backdropFilter: 'blur(6px)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}>
                              <Camera size={13} /> {imageCount} photos
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => toggleFavorite(e, property)}
                            title={favorites.some(f => f.id === property.id) ? "Remove from Saved" : "Save Flat"}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(15, 23, 42, 0.75)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: favorites.some(f => f.id === property.id) ? '#ef4444' : '#ffffff',
                              transition: 'transform 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                          >
                            <Heart size={15} fill={favorites.some(f => f.id === property.id) ? '#ef4444' : 'none'} />
                          </button>
                        </div>

                        {/* Bottom Right: Furnishing Status */}
                        {property.furnishing && (
                          <span style={{
                            position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                            padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '600',
                            backgroundColor: 'rgba(0,0,0,0.7)', color: '#e2e8f0', backdropFilter: 'blur(6px)'
                          }}>
                            {property.furnishing}
                          </span>
                        )}
                      </div>

                      {/* Info Body */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={property.title}>
                          {property.title}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          <MapPin size={14} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {property.locality ? `${property.locality}, ` : ''}{property.city || 'Location N/A'}
                          </span>
                        </div>

                        {/* Specs */}
                        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            <Bed size={15} /> {property.bedrooms || 1} Bed
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            <Bath size={15} /> {property.bathrooms || 1} Bath
                          </span>
                          {property.area && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                              {property.area} sqft
                            </span>
                          )}
                        </div>

                        {/* Amenities Chips */}
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

                        {/* Footer: Price + Deposit + Action */}
                        <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                              <IndianRupee size={16} />{Number(property.rentAmount || 0).toLocaleString('en-IN')}
                              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>/mo</span>
                            </span>
                            {property.securityDeposit && Number(property.securityDeposit) > 0 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.1rem' }}>
                                Deposit: ₹{Number(property.securityDeposit).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          
                          <span className={`btn btn-sm ${isAvailable ? 'btn-primary' : 'btn-secondary'}`} style={{ fontWeight: '600' }}>
                            View Details
                          </span>
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

      {/* AI Rent Estimator Modal */}
      {showEstimator && (
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
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowEstimator(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>AI Rent Estimator</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Instant valuation algorithm based on city price index, square-footage, furnishing tier, and premium society amenities.
            </p>

            <form onSubmit={handleEstimateRent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>City</label>
                  <select
                    className="form-select"
                    value={estimatorForm.city}
                    onChange={e => setEstimatorForm({ ...estimatorForm, city: e.target.value })}>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Noida">Noida</option>
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Locality / Area Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Indiranagar, Whitefield"
                    value={estimatorForm.locality}
                    onChange={e => setEstimatorForm({ ...estimatorForm, locality: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Bedrooms</label>
                  <select
                    className="form-select"
                    value={estimatorForm.bedrooms}
                    onChange={e => setEstimatorForm({ ...estimatorForm, bedrooms: parseInt(e.target.value) })}>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="100"
                    max="10000"
                    value={estimatorForm.area}
                    onChange={e => setEstimatorForm({ ...estimatorForm, area: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Furnishing</label>
                  <select
                    className="form-select"
                    value={estimatorForm.furnishing}
                    onChange={e => setEstimatorForm({ ...estimatorForm, furnishing: e.target.value })}>
                    <option value="Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Society Amenities
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.825rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={estimatorForm.hasParking}
                      onChange={e => setEstimatorForm({ ...estimatorForm, hasParking: e.target.checked })}
                    />
                    Reserved Car Parking
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={estimatorForm.hasGym}
                      onChange={e => setEstimatorForm({ ...estimatorForm, hasGym: e.target.checked })}
                    />
                    Clubhouse / Gym
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={estimatorForm.hasPowerBackup}
                      onChange={e => setEstimatorForm({ ...estimatorForm, hasPowerBackup: e.target.checked })}
                    />
                    100% Power Backup
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={estimatorForm.hasSecurity}
                      onChange={e => setEstimatorForm({ ...estimatorForm, hasSecurity: e.target.checked })}
                    />
                    24/7 Gated Security
                  </label>
                </div>
              </div>

              {estimatorError && (
                <div style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                  <span>{estimatorError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={estimating}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                <Sparkles size={18} /> {estimating ? 'Computing Fair Market Rent...' : 'Calculate Fair Rent with AI'}
              </button>
            </form>

            {/* Estimator Result Box */}
            {estimatorResult && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#10b981', fontWeight: '700' }}>
                      Recommended Fair Rent
                    </span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34d399', display: 'flex', alignItems: 'center' }}>
                      <IndianRupee size={22} />
                      {Number(estimatorResult.estimatedRent).toLocaleString('en-IN')}
                      <span style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '4px' }}>/month</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#60a5fa'
                    }}>
                      {estimatorResult.confidenceScore}% Confidence
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600', marginTop: '4px' }}>
                      {estimatorResult.marketDemand}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {estimatorResult.summary}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Base Area Rent</div>
                    <div style={{ fontWeight: '700' }}>₹{Number(estimatorResult.baseRent).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Furnishing Extra</div>
                    <div style={{ fontWeight: '700', color: '#38bdf8' }}>+₹{Number(estimatorResult.furnishingPremium).toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Amenities Bonus</div>
                    <div style={{ fontWeight: '700', color: '#a78bfa' }}>+₹{Number(estimatorResult.amenityBonus).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ flex: 1, fontSize: '0.8rem' }}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        city: estimatorForm.city,
                        maxPrice: estimatorResult.maxRent ? estimatorResult.maxRent.toString() : ''
                      }));
                      setShowEstimator(false);
                    }}>
                    Apply to Search Filters
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => setShowEstimator(false)}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
