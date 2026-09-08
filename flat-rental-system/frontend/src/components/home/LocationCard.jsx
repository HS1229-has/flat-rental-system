import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const locations = [
  { name: 'Noida', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80' },
  { name: 'Greater Noida', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Delhi', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80' },
  { name: 'Gurgaon', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1617806118233-18e1db207faf?auto=format&fit=crop&w=300&q=80' },
  { name: 'Pune', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80' },
];

const LocationCard = ({ properties }) => {
  const navigate = useNavigate();

  const handleCityClick = (cityName) => {
    navigate(`/properties?city=${cityName}`);
  };

  const getCityPropertyCount = (cityName) => {
    if (!properties || properties.length === 0) return 0;
    return properties.filter(p => 
      p.available !== false && 
      p.city && 
      p.city.toLowerCase().includes(cityName.toLowerCase())
    ).length;
  };

  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            Explore Popular Locations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Find listing locations in premium metropolitan corporate hubs
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {locations.map((city) => {
            const count = getCityPropertyCount(city.name);
            return (
              <div 
                key={city.name} 
                onClick={() => handleCityClick(city.name)}
                className="glass-card" 
                style={{ 
                  height: '240px', 
                  position: 'relative', 
                  cursor: 'pointer',
                  backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.15)), url("${city.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.25s ease-in-out'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {city.name}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: '500' }}>
                      {count} Available Flat{count === 1 ? '' : 's'}
                    </span>
                    <span style={{ color: '#ffffff' }}>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LocationCard;
