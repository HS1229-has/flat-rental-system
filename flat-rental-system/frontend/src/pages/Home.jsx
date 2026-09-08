import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

// Reusable components
import Hero from '../components/home/Hero';
import SearchBar from '../components/home/SearchBar';
import LocationCard from '../components/home/LocationCard';
import PropertyCard from '../components/home/PropertyCard';
import FeatureCard from '../components/home/FeatureCard';
import HowItWorks from '../components/home/HowItWorks';
import StatsSection from '../components/home/StatsSection';
import TestimonialCard from '../components/home/TestimonialCard';

import { Compass, ArrowRight } from 'lucide-react';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        setLoading(true);
        const response = await api.get('/properties');
        setProperties(response.data || []);
      } catch (err) {
        console.error('Error fetching properties on Home mount:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProperties();
  }, []);

  // Filter out top 3 to 6 available properties for the featured section
  const featured = properties.filter(p => p.available !== false).slice(0, 6);

  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }}>
      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Advanced Property Search */}
      <SearchBar />

      {/* 4. Popular Locations */}
      <LocationCard properties={properties} />

      {/* 5. Featured Properties & 6. Badges */}
      <section style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                Featured Properties
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Handpicked verified rentals for premium comfort
              </p>
            </div>
            <Link to="/properties" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Explore All <Compass size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card" style={{ height: '380px', animation: 'pulse 1.5s infinite', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}></div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="glass-card text-center" style={{ padding: '4rem', border: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
              <p style={{ color: 'var(--text-muted)' }}>No properties listed currently. Log in to list properties.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Why Choose LuxeFlats */}
      <FeatureCard />

      {/* 8. How It Works */}
      <HowItWorks />

      {/* 9. Statistics Section */}
      <StatsSection properties={properties} />

      {/* 10. Testimonials */}
      <TestimonialCard />

      {/* 11. Final CTA Section */}
      <section style={{ 
        backgroundColor: '#eff6ff', 
        padding: '5.5rem 1.5rem', 
        borderTop: '1px solid #dbeafe', 
        borderBottom: '1px solid #dbeafe',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
            Ready to Find Your Next Home?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.25rem', lineHeight: '1.6' }}>
            Find verified rental properties that match your budget and lifestyle.
          </p>
          <Link to="/properties" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Explore Properties <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
