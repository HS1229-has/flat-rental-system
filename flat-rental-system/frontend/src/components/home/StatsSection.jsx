import React from 'react';
import { Home, MapPin, Smile, Award } from 'lucide-react';

const StatsSection = ({ properties }) => {
  const listingsCount = properties ? properties.length : 0;
  const citiesCount = properties 
    ? new Set(properties.map(p => p.city?.trim().toLowerCase()).filter(Boolean)).size 
    : 0;

  const stats = [
    {
      label: 'Verified Properties',
      value: listingsCount > 0 ? `${listingsCount}+` : '150+',
      icon: Home,
      color: '#2563eb'
    },
    {
      label: 'Operating Cities',
      value: citiesCount > 0 ? `${citiesCount}+` : '6+',
      icon: MapPin,
      color: '#0d9488'
    },
    {
      label: 'Happy Tenants',
      value: '1,200+',
      icon: Smile,
      color: '#ec4899'
    },
    {
      label: 'Customer Satisfaction',
      value: '98%',
      icon: Award,
      color: '#d97706'
    }
  ];

  return (
    <section style={{ padding: '4rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div 
                key={i} 
                className="glass-card" 
                style={{ 
                  padding: '2rem 1.5rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  backgroundColor: `${s.color}10`, 
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '850', color: 'var(--secondary)', lineHeight: '1.2' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {s.label}
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

export default StatsSection;
