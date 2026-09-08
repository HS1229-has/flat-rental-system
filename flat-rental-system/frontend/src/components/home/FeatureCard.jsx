import React from 'react';
import { CheckCircle, Shield, Building2, Headphones } from 'lucide-react';

const features = [
  {
    title: 'Verified Properties',
    desc: 'Properties are verified before being listed to ensure accurate layouts, details, and photos.',
    icon: CheckCircle,
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.08)'
  },
  {
    title: 'Secure Booking',
    desc: 'Enjoy a reliable and secure booking experience protected by integrated microservice layers.',
    icon: Shield,
    color: '#0d9488',
    bgColor: 'rgba(13, 148, 136, 0.08)'
  },
  {
    title: 'Transparent Pricing',
    desc: 'Clear rental pricing, defined security deposits, and absolutely zero hidden broker charges.',
    icon: Building2,
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.08)'
  },
  {
    title: 'Quick Assistance',
    desc: 'Get easy, professional support and quick problem-solving throughout the entire leasing process.',
    icon: Headphones,
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)'
  }
];

const FeatureCard = () => {
  return (
    <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            Why Choose LuxeFlats?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Providing a premium, trust-driven marketplace for rental properties
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="glass-card" 
                style={{ 
                  padding: '2.5rem 2rem', 
                  textAlign: 'center', 
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  transition: 'transform 0.25s ease-in-out'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: f.bgColor, 
                  color: f.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1.5rem auto', 
                  border: `1px solid ${f.color}15`
                }}>
                  <Icon size={26} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCard;
