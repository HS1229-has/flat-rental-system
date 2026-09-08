import React from 'react';
import { Search, Compass, ShieldCheck } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Search',
    desc: 'Find properties based on location, budget and property type using advanced filters.',
    icon: Search,
    color: 'var(--primary)'
  },
  {
    num: '02',
    title: 'Explore & Select',
    desc: 'View detailed specs, check photos, browse amenities, and compare available options.',
    icon: Compass,
    color: 'var(--accent)'
  },
  {
    num: '03',
    title: 'Book Securely',
    desc: 'Request booking, complete token payments safely, and lock in your new home.',
    icon: ShieldCheck,
    color: 'var(--success)'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff', scrollMarginTop: '80px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            How It Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Three simple steps to renting your dream flat on LuxeFlats
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', position: 'relative' }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} style={{ position: 'relative', textAlign: 'center' }}>
                {/* Connector line for desktop */}
                {i < 2 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    right: '-40px', 
                    width: '60px', 
                    height: '2px', 
                    borderTop: '2px dotted var(--border-color)', 
                    zIndex: 0
                  }} className="desktop-connector" />
                )}
                
                {/* Number Bubble */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '55%',
                  transform: 'translateX(10px)',
                  backgroundColor: step.color,
                  color: 'white',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  zIndex: 2,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {step.num}
                </div>

                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '24px', 
                  backgroundColor: 'var(--bg-dark)', 
                  border: '1px solid var(--border-color)',
                  color: step.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.75rem auto',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Icon size={32} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6', maxWidth: '280px', margin: '0 auto' }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Hide connectors on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-connector { display: none !important; }
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
