import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { splitImageUrls } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin, Bed, Bath, Ruler, IndianRupee, Wifi, Car, Dumbbell, Shield, Zap, Wind,
  Building2, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Calendar, Trash2, Edit, Heart
} from 'lucide-react';
import { loadGoogleMapsScript } from '../../utils/googleMaps';

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

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (property && property.latitude && property.longitude && mapContainerRef.current) {
      loadGoogleMapsScript()
        .then((google) => {
          if (!active) return;
          const lat = parseFloat(property.latitude);
          const lng = parseFloat(property.longitude);
          const mapOptions = {
            center: { lat, lng },
            zoom: 15,
            disableDefaultUI: false,
            zoomControl: true,
          };
          const map = new google.maps.Map(mapContainerRef.current, mapOptions);
          mapRef.current = map;

          new google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: property.title || 'Property Location',
            animation: google.maps.Animation.DROP
          });
        })
        .catch((err) => {
          console.error("Failed to load map: ", err);
        });
    }
    return () => {
      active = false;
    };
  }, [property]);

  const getPropertyImages = () => {
    return property?.imageUrls
      ? splitImageUrls(property.imageUrls)
      : [FALLBACK];
  };

  const images = getPropertyImages();

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
        <div style={{ height: '450px', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)', marginBottom: '2rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div style={{ height: '300px', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)' }}></div>
          <div style={{ height: '200px', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite', backgroundColor: 'var(--bg-card)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Building2 size={64} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.4 }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Property Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/properties" className="btn btn-primary">Back to Properties</Link>
      </div>
    );
  }

  const isOwner = user && user.role === 'OWNER' && user.userId === property?.ownerId;

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Back */}
      <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Properties
      </Link>

      {/* Image Gallery */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '2rem', height: '450px', backgroundColor: '#0f172a' }}>
        <img
          src={images[currentImg] || FALLBACK}
          alt={property?.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
          onError={e => { e.target.src = FALLBACK; }}
        />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrentImg(i => (i - 1 + images.length) % images.length)}
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => setCurrentImg(i => (i + 1) % images.length)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={22} />
            </button>
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentImg(i)}
                  style={{ width: i === currentImg ? '24px' : '8px', height: '8px', borderRadius: '4px', border: 'none', backgroundColor: i === currentImg ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </>
        )}
        {/* Badges on image */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: 'rgba(99,102,241,0.9)', color: 'white' }}>
            {(property?.propertyType || '').replace('_', ' ')}
          </span>
          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: property?.available ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white' }}>
            {property?.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          {images.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setCurrentImg(i)}
              style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: i === currentImg ? '2px solid var(--primary)' : '2px solid transparent', opacity: i === currentImg ? 1 : 0.6, transition: 'all 0.2s' }}
              onError={e => { e.target.src = FALLBACK; }} />
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left - Details */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{property?.title}</h1>
            <button 
              onClick={toggleFavorite} 
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '50%',
                width: '46px',
                height: '46px',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: isFavorite ? '#ef4444' : 'var(--text-muted)', 
                transition: 'var(--transition)' 
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
              title={isFavorite ? "Remove from Saved" : "Save Flat"}
            >
              <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            <MapPin size={16} />
            {property?.address}{property?.locality ? `, ${property.locality}` : ''}, {property?.city}{property?.state ? `, ${property.state}` : ''}
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: Bed, label: 'Bedrooms', value: property?.bedrooms },
              { icon: Bath, label: 'Bathrooms', value: property?.bathrooms },
              { icon: Ruler, label: 'Area', value: property?.area ? `${property.area} sqft` : 'N/A' },
              { icon: Building2, label: 'Furnishing', value: property?.furnishing || 'N/A' }
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <Icon size={22} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {property?.description || 'No description available.'}
            </p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Amenities</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {amenities.map((a, i) => {
                  const Icon = getAmenityIcon(a);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                      <Icon size={16} color="var(--primary)" />
                      <span style={{ fontSize: '0.875rem' }}>{a}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location & Map Section */}
          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--primary)" /> Location & Map
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {property?.address}{property?.locality ? `, ${property.locality}` : ''}{property?.city ? `, ${property.city}` : ''}{property?.state ? `, ${property.state}` : ''}
            </p>
            {property?.latitude && property?.longitude ? (
              <div 
                ref={mapContainerRef} 
                style={{ 
                  width: '100%', 
                  height: '350px', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#0f172a'
                }}
              />
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                Map coordinates not available for this listing.
              </div>
            )}
          </div>
        </div>

        {/* Right - Booking Panel */}
        <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Rent</span>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={22} />{Number(property?.rentAmount).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {property?.securityDeposit && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Security Deposit</span>
              <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                <IndianRupee size={14} />{Number(property.securityDeposit).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Listed On</span>
            <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
              {property?.createdAt ? new Date(property.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
            </span>
          </div>

          {/* CTA */}
          {!user && (
            <Link to="/login" className="btn btn-primary btn-full btn-lg" style={{ marginBottom: '0.75rem' }}>
              Login to Book
            </Link>
          )}
          {user && user.role === 'TENANT' && property?.available && (
            <Link to={`/tenant/book/${property.id}`} className="btn btn-primary btn-full btn-lg" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Calendar size={18} /> Request Booking
            </Link>
          )}
          {user && user.role === 'TENANT' && !property?.available && (
            <button className="btn btn-secondary btn-full btn-lg" disabled style={{ marginBottom: '0.75rem' }}>
              Currently Unavailable
            </button>
          )}
          {isOwner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to={`/owner/property/edit/${property.id}`} className="btn btn-primary btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Edit size={16} /> Edit Property
              </Link>
              <button onClick={handleDelete} className="btn btn-full" disabled={deleting}
                style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem' }}>
                <Trash2 size={16} /> {deleting ? 'Deleting...' : 'Delete Property'}
              </button>
            </div>
          )}

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={16} color="#60a5fa" />
            <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>Verified listing by LuxeFlats</span>
          </div>
        </div>
      </div>

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
