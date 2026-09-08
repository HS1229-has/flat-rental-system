import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: '#ffffff', 
      borderTop: '1px solid var(--border-color)', 
      color: 'var(--text-main)',
      padding: '4rem 2rem 2rem 2rem',
      fontSize: '0.9rem'
    }}>
      <div className="container" style={{ 
        maxWidth: '1200px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '2.5rem',
        marginBottom: '3rem'
      }}>
        {/* Brand info */}
        <div>
          <Link to="/" style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#0f172a',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={18} color="white" />
            </div>
            <span>Luxe<span style={{ color: 'var(--primary)' }}>Flats</span></span>
          </Link>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            LuxeFlats is a premium, trust-driven marketplace for rental flat properties, connecting verified tenants directly with property owners.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
            <a href="#" aria-label="Facebook" style={{ transition: 'var(--transition)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" aria-label="Twitter" style={{ transition: 'var(--transition)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" aria-label="Instagram" style={{ transition: 'var(--transition)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" aria-label="LinkedIn" style={{ transition: 'var(--transition)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--secondary)' }}>Platform</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Home</Link></li>
            <li><Link to="/properties" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Properties</Link></li>
            <li><Link to="/about" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>About Us</Link></li>
            <li><a href="#how-it-works" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>How It Works</a></li>
          </ul>
        </div>

        {/* Support links */}
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--secondary)' }}>Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="#" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>FAQs</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Privacy Policy</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Terms & Conditions</a></li>
            <li><a href="#" style={{ color: 'var(--text-muted)', transition: 'var(--transition)' }} onMouseEnter={e => e.target.style.color = 'var(--primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Contact Support</a></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--secondary)' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} /> 101 Luxe Corporate Hub, Pune, MH
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} /> +91 800-LUXE-FLAT
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} /> support@luxeflats.com
            </li>
          </ul>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        paddingTop: '2.0rem', 
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem'
      }}>
        <p>&copy; {new Date().getFullYear()} LuxeFlats. All rights reserved. Built for verified trust-driven leasing.</p>
      </div>
    </footer>
  );
};

export default Footer;
