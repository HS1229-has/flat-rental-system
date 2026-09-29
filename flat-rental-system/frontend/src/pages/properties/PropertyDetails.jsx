import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin, Bed, Bath, Ruler, IndianRupee, Wifi, Car, Dumbbell, Shield, Zap, Wind,
  Building2, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Calendar, Trash2, Edit,
  Heart, Share2, Maximize2, X, Compass, AlertCircle, Copy, Check
} from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';
import { loadLeafletScript, CITY_COORDINATES } from '../../utils/leafletMap';

const FALLBACK = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const amenityIcons = {
  'wifi': Wifi, 'wi-fi': Wifi, 'internet': Wifi,
  'ac': Wind, 'air conditioning': Wind,
  'parking': Car, 'car parking': Car,
  'gym': Dumbbell, 'gymnasium': Dumbbell,
  'security': Shield, 'cctv': Shield, 'guard': Shield,
  'power backup': Zap, 'power': Zap, 'generator': Zap,
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImg, setCurrentImg] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  // Favorite toggle
  useEffect(() => {
    if (property && user) {
      const saved = localStorage.getItem(`favorites_${user.userId}`);
      if (saved) {
        try {
          const list = JSON.parse(saved);
          setIsFavorite(list.some(p => p.id === property.id));
        } catch (e) {}
      }
    }
  }, [property, user]);

  const toggleFavorite = () => {
    if (!user) {
      alert('Please log in to save favorites!');
      return;
    }
    const saved = localStorage.getItem(`favorites_${user.userId}`);
    let list = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {}
    }

    if (isFavorite) {
      list = list.filter(p => p.id !== property.id);
      setIsFavorite(false);
    } else {
      list.push(property);
      setIsFavorite(true);
    }
    localStorage.setItem(`favorites_${user.userId}`, JSON.stringify(list));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
        return;
      } catch (err) {}
    }
    // Fallback prompt
    window.prompt('Copy this listing URL:', url);
  };

  // Fetch property
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        setError('Property not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const getPropertyImages = () => {
    return property?.imageUrls
      ? splitImageUrls(property.imageUrls)
      : [FALLBACK];
  };

  const images = getPropertyImages();

  // Keyboard navigation for image gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (images.length <= 1 && !showLightbox) return;
      if (e.key === 'ArrowLeft') {
        setCurrentImg(prev => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentImg(prev => (prev + 1) % images.length);
      } else if (e.key === 'Escape' && showLightbox) {
        setShowLightbox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, showLightbox]);

  // Robust Map Renderer: Tries Google Maps, falls back cleanly to Leaflet
  useEffect(() => {
    if (!property || !mapContainerRef.current) return;
    let active = true;

    const lat = property.latitude ? parseFloat(property.latitude) : null;
    const lng = property.longitude ? parseFloat(property.longitude) : null;

    // Determine coordinate center
    let center = [12.9716, 77.5946]; // Bangalore fallback
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      center = [lat, lng];
    } else if (property.city) {
      const cityKey = property.city.trim().toLowerCase();
      if (CITY_COORDINATES[cityKey]) {
        center = CITY_COORDINATES[cityKey];
      }
    }

    // Attempt Google Maps first
    loadGoogleMapsScript()
      .then((google) => {
        if (!active || !mapContainerRef.current) return;
        const gLatLng = { lat: center[0], lng: center[1] };
        const map = new google.maps.Map(mapContainerRef.current, {
          center: gLatLng,
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
        });
        new google.maps.Marker({
          position: gLatLng,
          map: map,
          title: property.title || 'Property Location',
        });
      })
      .catch(() => {
        // Fallback to Leaflet OpenStreetMap
        if (!active || !mapContainerRef.current) return;
        loadLeafletScript()
          .then(L => {
            if (!active || !mapContainerRef.current) return;
            if (leafletMapRef.current) {
              leafletMapRef.current.remove();
            }

            const map = L.map(mapContainerRef.current, {
              center: center,
              zoom: 14,
              scrollWheelZoom: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);

            const priceText = '₹' + Number(property.rentAmount || 0).toLocaleString('en-IN');
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
                transform: translate(-50%, -100%);
              ">${priceText}</div>`,
              iconSize: [60, 30],
              iconAnchor: [30, 30]
            });

            L.marker(center, { icon: customIcon }).addTo(map)
              .bindPopup(`<strong>${property.title}</strong><br/>${property.address || ''}`)
              .openPopup();

            leafletMapRef.current = map;
          })
          .catch(err => {
            console.warn("Leaflet map load warning:", err);
          });
      });

    return () => {
      active = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [property]);

  const amenities = property?.amenities
    ? property.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const getAmenityIcon = (name) => {
    const key = name.toLowerCase();
    for (const [k, Icon] of Object.entries(amenityIcons)) {
      if (key.includes(k)) return Icon;
    }
    return CheckCircle;
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      await api.delete(`/properties/${id}`);
      navigate('/owner/dashboard');
    } catch (err) {
      alert('Failed to delete property: ' + (err.response?.data?.message || 'Unknown error'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ height: '450px', borderRadius: '16px', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)', marginBottom: '2rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div style={{ height: '300px', borderRadius: '16px', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)' }}></div>
          <div style={{ height: '220px', borderRadius: '16px', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Building2 size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4 }} />
        <h2 style={{ marginBottom: '0.5rem', fontWeight: '800' }}>Property Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/properties" className="btn btn-primary">Back to Discovery</Link>
      </div>
    );
  }

  const isOwner = user && user.role === 'OWNER' && user.userId === property?.ownerId;
  const isAvailable = property?.available !== false;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Bar: Back & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }}>
          <ArrowLeft size={16} /> Back to Browse
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-sm btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}
            title="Share listing link">
            {shareToast ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
            {shareToast ? 'Copied Link!' : 'Share'}
          </button>

          {/* Favorite Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.45rem 0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: isFavorite ? '#ef4444' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'var(--transition)'
            }}
            title={isFavorite ? "Remove from Saved" : "Save Flat"}
          >
            <Heart size={16} fill={isFavorite ? '#ef4444' : 'none'} />
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem', height: '460px', backgroundColor: '#0f172a' }}>
        <img
          src={images[currentImg] || FALLBACK}
          alt={property?.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s ease' }}
          onError={e => { e.target.src = FALLBACK; }}
        />

        {/* Gallery Overlay Badges */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
            backgroundColor: 'rgba(99, 102, 241, 0.9)', color: 'white', backdropFilter: 'blur(6px)',
            textTransform: 'uppercase'
          }}>
            {(property?.propertyType || '').replace('_', ' ')}
          </span>
          <span style={{
            padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
            backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
            color: 'white', backdropFilter: 'blur(6px)'
          }}>
            {isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
          </span>
        </div>

        {/* Top Right: Expand / Zoom button */}
        <button
          type="button"
          onClick={() => setShowLightbox(true)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.45rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            backdropFilter: 'blur(6px)'
          }}
          title="Open high-resolution fullscreen photo">
          <Maximize2 size={14} /> Fullscreen
        </button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
              style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentImg(i => (i + 1) % images.length)}
              style={{
                position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Photo Counter Pill */}
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: '700',
          backdropFilter: 'blur(6px)'
        }}>
          {currentImg + 1} of {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              onClick={() => setCurrentImg(i)}
              style={{
                width: '90px',
                height: '65px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                border: i === currentImg ? '2px solid var(--primary)' : '2px solid transparent',
                opacity: i === currentImg ? 1 : 0.6,
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onError={e => { e.target.src = FALLBACK; }}
            />
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Details & Specs */}
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            {property?.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            <MapPin size={16} style={{ flexShrink: 0 }} />
            <span>
              {property?.address}{property?.locality ? `, ${property.locality}` : ''}, {property?.city}{property?.state ? `, ${property.state}` : ''}
            </span>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: Bed, label: 'Bedrooms', value: property?.bedrooms ? `${property.bedrooms} BHK` : 'N/A' },
              { icon: Bath, label: 'Bathrooms', value: property?.bathrooms ? `${property.bathrooms} Bath` : 'N/A' },
              { icon: Ruler, label: 'Super Built-up', value: property?.area ? `${property.area} sqft` : 'N/A' },
              { icon: Building2, label: 'Furnishing', value: property?.furnishing || 'N/A' }
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="glass-card" style={{ padding: '1rem', textAlign: 'center', borderRadius: '12px' }}>
                <Icon size={22} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Description Section */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
              About this Property
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-line', margin: 0, fontSize: '0.95rem' }}>
              {property?.description || 'No detailed description provided by the owner.'}
            </p>
          </div>

          {/* Amenities Section */}
          {amenities.length > 0 && (
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
              <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
                Features & Amenities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem' }}>
                {amenities.map((a, i) => {
                  const Icon = getAmenityIcon(a);
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.15)'
                    }}>
                      <Icon size={17} color="var(--primary)" />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location & Interactive Map Section */}
          <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderRadius: '14px' }}>
            <h3 style={{ fontWeight: '800', fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={20} color="var(--primary)" /> Neighborhood & Location
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {property?.address}{property?.locality ? `, ${property.locality}` : ''}{property?.city ? `, ${property.city}` : ''}
            </p>
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '340px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0f172a'
              }}
            />
          </div>
        </div>

        {/* Right Column: Sticky Booking & Pricing Panel */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '90px', borderRadius: '16px' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Rental
            </span>
            <div style={{ fontSize: '2.1rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={24} />
              {Number(property?.rentAmount || 0).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>/month</span>
            </div>
          </div>

          {property?.securityDeposit && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Security Deposit</span>
              <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={14} />{Number(property.securityDeposit).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Listed On</span>
            <span style={{ fontWeight: '600' }}>
              {property?.createdAt ? new Date(property.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'}
            </span>
          </div>

          {/* Action CTAs based on Role & Availability */}
          {!user && (
            <div>
              <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginBottom: '0.75rem', fontWeight: '700' }}>
                Login to Book Flat
              </Link>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Sign in to schedule visits and submit rental applications.
              </p>
            </div>
          )}

          {user && user.role === 'TENANT' && isAvailable && (
            <div>
              <Link to={`/tenant/book/${property.id}`} className="btn btn-primary btn-full btn-lg" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <Calendar size={18} /> Request Booking
              </Link>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Free cancellation before owner review approval.
              </p>
            </div>
          )}

          {user && user.role === 'TENANT' && !isAvailable && (
            <div>
              <button className="btn btn-secondary btn-full btn-lg" disabled style={{ marginBottom: '0.75rem', opacity: 0.7 }}>
                Currently Unavailable
              </button>
              <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'center', marginBottom: '1rem', lineHeight: '1.4' }}>
                This flat is currently leased or temporarily off-market.
              </p>
              <Link to={`/properties?city=${encodeURIComponent(property.city || '')}`} className="btn btn-sm btn-secondary btn-full" style={{ textAlign: 'center' }}>
                Explore Similar Flats in {property.city}
              </Link>
            </div>
          )}

          {isOwner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '8px', fontSize: '0.8rem', color: '#a5b4fc', textAlign: 'center' }}>
                You are the verified owner of this listing
              </div>
              <Link to={`/owner/property/edit/${property.id}`} className="btn btn-primary btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '700' }}>
                <Edit size={16} /> Edit Listing Details
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-full"
                disabled={deleting}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.75rem',
                  fontWeight: '600'
                }}>
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          )}

          {user && user.role === 'OWNER' && !isOwner && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Viewing as Owner
              </span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Only tenants can submit rental applications.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', padding: '0.85rem', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#93c5fd', lineHeight: '1.4' }}>
              LuxeFlats Buyer Protection: Direct lease agreements & verified owners.
            </span>
          </div>
        </div>
      </div>

      {/* High-Resolution Photo Lightbox Modal */}
      {showLightbox && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 10, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '1.5rem'
        }}>
          {/* Top Bar inside modal */}
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '700' }}>
              Photo {currentImg + 1} of {images.length} &bull; {property.title}
            </span>
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}
              title="Close modal (Esc)">
              <X size={26} />
            </button>
          </div>

          {/* Large Image */}
          <div style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={images[currentImg] || FALLBACK}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}
              onError={e => { e.target.src = FALLBACK; }}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
                  style={{
                    position: 'absolute', left: '-3rem', top: '50%', transform: 'translateY(-50%)',
                    width: '46px', height: '46px', borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImg(i => (i + 1) % images.length)}
                  style={{
                    position: 'absolute', right: '-3rem', top: '50%', transform: 'translateY(-50%)',
                    width: '46px', height: '46px', borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', overflowX: 'auto', maxWidth: '80vw', paddingBottom: '0.5rem' }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setCurrentImg(i)}
                  style={{
                    width: '60px',
                    height: '45px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    border: i === currentImg ? '2px solid var(--primary)' : '2px solid transparent',
                    opacity: i === currentImg ? 1 : 0.5
                  }}
                  onError={e => { e.target.src = FALLBACK; }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;
