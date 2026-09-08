import React from 'react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Aravind Sharma',
    role: 'Tenant in Noida Sector 62',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    stars: 5,
    text: 'Finding a verified 2 BHK flat near my office was incredibly simple on LuxeFlats. The pricing was totally transparent and there were absolutely no brokers involved!'
  },
  {
    name: 'Priyanka Sen',
    role: 'Tenant in Pune, Viman Nagar',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    stars: 5,
    text: 'The booking process was secure and direct. The digital verification of the property specs matched the actual flat perfectly. Strongly recommended!'
  },
  {
    name: 'Rahul Nair',
    role: 'Tenant in Bangalore, HSR Layout',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    stars: 4,
    text: 'Loved the direct coordination with the owner. The support team assisted me promptly with the rental agreements and keys. Great experience!'
  }
];

const TestimonialCard = () => {
  return (
    <section style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            What Our Tenants Say
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real reviews from verify-registered renters on our platform
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {reviews.map((r, i) => (
            <div 
              key={i} 
              className="glass-card" 
              style={{ 
                padding: '2rem', 
                border: '1px solid var(--border-color)',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'rgba(37, 99, 235, 0.15)' }}>
                <Quote size={32} />
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.15rem', color: '#fbbf24', marginBottom: '1.25rem' }}>
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={16} fill={idx < r.stars ? '#fbbf24' : 'none'} stroke={idx < r.stars ? '#fbbf24' : '#cbd5e1'} />
                ))}
              </div>

              <p style={{ 
                color: 'var(--text-main)', 
                fontSize: '0.925rem', 
                lineHeight: '1.6', 
                fontStyle: 'italic', 
                marginBottom: '1.5rem',
                flex: 1
              }}>
                "{r.text}"
              </p>

              {/* User profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={r.img} alt={r.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--secondary)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCard;
