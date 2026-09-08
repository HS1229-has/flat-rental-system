import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Hero = () => {
  return (
    <section style={{ 
      position: 'relative', 
      minHeight: '55vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      overflow: 'hidden',
      backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '5rem 1.5rem 3.5rem 1.5rem',
      textAlign: 'center'
    }}>
      <div className="container" style={{ zIndex: 1, maxWidth: '850px' }}>
        <span style={{ 
          color: '#60a5fa', 
          textTransform: 'uppercase', 
          letterSpacing: '0.15em', 
          fontWeight: '800', 
          fontSize: '0.8rem',
          display: 'inline-block',
          marginBottom: '1.25rem',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(96, 165, 250, 0.2)'
        }}>
          LuxeFlats Marketplace
        </span>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: '800', 
          marginBottom: '1.25rem', 
          lineHeight: 1.15,
          color: '#ffffff',
          letterSpacing: '-0.03em'
        }}>
          Find Your Perfect <br />
          <span style={{ color: '#60a5fa' }}>Rental Home</span>
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#cbd5e1', 
          maxWidth: '650px', 
          margin: '0 auto 2.25rem auto',
          lineHeight: '1.6'
        }}>
          Discover verified listings, clear pricing, transparent terms, and complete booking security in metropolitan hubs.
        </p>
        <Link to="/properties" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          Explore Properties <Compass size={20} />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
