import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Search, Lock, UserCheck, ArrowRight, Home, Building } from 'lucide-react';

const AboutUs = () => {
  return (
    <div style={{ backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <section style={{ 
        padding: '5rem 1.5rem 3rem 1.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        backgroundColor: '#ffffff',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--secondary)' }}>
            About LuxeFlats
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '1.5rem' }}>
            Find a place you can confidently call home.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.75', fontSize: '1.05rem', margin: '0 auto', maxWidth: '700px' }}>
            LuxeFlats is a rental platform designed to make finding and renting residential properties simpler, clearer, and more secure. 
            The platform connects tenants looking for rental homes with property owners who want to list and manage their properties 
            through a straightforward digital platform.
          </p>
        </div>
      </section>

      {/* Why LuxeFlats? / Features */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '3.5rem' }}>
            Why LuxeFlats?
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>Verified Properties</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Help users discover reliable property listings with accurate property information.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Building size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>Transparent Rental Information</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Provide clear information about rent, property details, amenities and applicable charges.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>Simple Property Discovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Allow tenants to search and explore properties based on relevant requirements such as location, property type and budget.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(220, 38, 38, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>Secure User Experience</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Protect user accounts and application interactions through secure authentication and authorization.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>For Property Owners</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Provide owners with a convenient way to list their rental properties and reach potential tenants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section style={{ 
        padding: '5rem 1.5rem', 
        backgroundColor: '#ffffff', 
        borderTop: '1px solid var(--border-color)', 
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Our Mission</h2>
          <p style={{ fontSize: '1.35rem', fontStyle: 'italic', color: 'var(--text-main)', lineHeight: '1.75', maxWidth: '650px', margin: '0 auto' }}>
            "Make property rental discovery more <span style={{ color: 'var(--primary)', fontWeight: '700' }}>simple, transparent and convenient</span> for both tenants and property owners."
          </p>
        </div>
      </section>

      {/* Who is LuxeFlats for? */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '3.5rem' }}>
            Built for Tenants & Property Owners
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Home size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>For Tenants</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                Find suitable rental properties, compare available options and choose a home according to your requirements.
              </p>
              <Link to="/properties" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                Browse Rentals <ArrowRight size={14} />
              </Link>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Building size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>For Property Owners</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                List properties and make them discoverable to potential tenants through the platform.
              </p>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: '0.25rem' }}>
                List Your Property <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        backgroundColor: '#eff6ff', 
        padding: '5rem 1.5rem', 
        borderTop: '1px solid #dbeafe', 
        borderBottom: '1px solid #dbeafe',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>
            Ready to find your next home?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Search hundreds of verified listings and connect with direct property owners.
          </p>
          <Link to="/properties" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Explore Properties <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
