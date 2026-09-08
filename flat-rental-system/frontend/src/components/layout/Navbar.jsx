import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, LayoutDashboard, Menu, X, Home, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'TENANT': return '/tenant/dashboard';
      case 'OWNER': return '/owner/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkStyle = (path) => ({
    color: isActive(path) ? 'var(--primary)' : 'var(--text-muted)',
    fontWeight: isActive(path) ? '700' : '500',
    fontSize: '0.95rem',
    transition: 'var(--transition)',
    padding: '0.5rem 0',
    borderBottom: isActive(path) ? '2px solid var(--primary)' : '2px solid transparent',
  });

  return (
    <nav style={{
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      height: '70px'
    }}>
      {/* Logo */}
      <Link to="/" style={{
        fontSize: '1.5rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#0f172a'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Building2 size={20} color="white" />
        </div>
        <span>Luxe<span style={{ color: 'var(--primary)' }}>Flats</span></span>
      </Link>

      {/* Desktop Nav Links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
        <Link to="/" style={navLinkStyle('/')}>Home</Link>
        <Link to="/properties" style={navLinkStyle('/properties')}>Properties</Link>
        <a href="/#how-it-works" style={navLinkStyle('/#how-it-works')} onClick={(e) => {
          if (location.pathname === '/') {
            e.preventDefault();
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}>How It Works</a>
        <Link to="/about" style={navLinkStyle('/about')}>About Us</Link>

        {user && (
          <Link to={getDashboardLink()} style={navLinkStyle(getDashboardLink())}>Dashboard</Link>
        )}
      </div>

      {/* Auth Section */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="desktop-nav">
        {user ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.2)'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '800',
                color: 'white'
              }}>
                {user.username ? user.username[0].toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{user.username}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user.role}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#0f172a',
          cursor: 'pointer',
          padding: '0.5rem'
        }}
        className="mobile-menu-btn"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 999
        }} className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: '#0f172a', fontWeight: '600' }}>Home</Link>
          <Link to="/properties" onClick={() => setMenuOpen(false)} style={{ color: '#0f172a', fontWeight: '600' }}>Properties</Link>
          <a href="/#how-it-works" onClick={() => {
            setMenuOpen(false);
            setTimeout(() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} style={{ color: '#0f172a', fontWeight: '600' }}>How It Works</a>
          <Link to="/about" onClick={() => setMenuOpen(false)} style={{ color: '#0f172a', fontWeight: '600' }}>About Us</Link>
          {user && <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} style={{ color: '#0f172a', fontWeight: '600' }}>Dashboard</Link>}
          {user ? (
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
