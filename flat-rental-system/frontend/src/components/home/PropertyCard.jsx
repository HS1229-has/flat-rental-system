import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, IndianRupee } from 'lucide-react';
import api, { splitImageUrls } from '../../api/axiosConfig';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80';

const PropertyCard = ({ property }) => {
  const getFirstImage = () => {
    if (!property.imageUrls) return FALLBACK_IMG;
    const images = splitImageUrls(property.imageUrls);
    return images.length > 0 ? images[0] : FALLBACK_IMG;
  };

  const amenities = property.amenities
    ? property.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <Link to={`/properties/${property.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glass-card property-card" style={{ 
        overflow: 'hidden', 
        transition: 'transform 0.25s ease, box-shadow 0.25s ease', 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
        {/* Image */}
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <img src={getFirstImage()} alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = FALLBACK_IMG; }} />
          
          {/* Top Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
            <span style={{
              padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800',
              backgroundColor: 'rgba(37, 99, 235, 0.95)', color: 'white', letterSpacing: '0.05em'
            }}>
              VERIFIED
            </span>
            {property.furnishing === 'Furnished' && (
              <span style={{
                padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800',
                backgroundColor: 'rgba(13, 148, 136, 0.95)', color: 'white', letterSpacing: '0.05em'
              }}>
                FULLY FURNISHED
              </span>
            )}
          </div>
          
          <span style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800',
            backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.03em'
          }}>
            {(property.propertyType || '').replace('_', ' ')}
          </span>
        </div>

        {/* Info */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--secondary)' }}>
            {property.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <MapPin size={13} />
            {property.locality ? `${property.locality}, ` : ''}{property.city}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.75rem' }}>
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
              {amenities.slice(0, 2).map((a, i) => (
                <span key={i} style={{
                  padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                  backgroundColor: 'rgba(37, 99, 235, 0.06)', color: 'var(--primary)', fontWeight: '600'
                }}>{a}</span>
              ))}
              {amenities.length > 2 && (
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem',
                  backgroundColor: 'rgba(100, 116, 139, 0.06)', color: 'var(--text-muted)', fontWeight: '600'
                }}>+{amenities.length - 2} more</span>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
              <IndianRupee size={15} />{Number(property.rentAmount).toLocaleString('en-IN')}
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>/mo</span>
            </span>
            <span className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.75rem' }}>Details</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
