import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    city: '',
    type: '',
    budget: ''
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (params.city) query.append('city', params.city);
    if (params.type) query.append('type', params.type);
    if (params.budget) query.append('maxPrice', params.budget);
    navigate(`/properties?${query.toString()}`);
  };

  return (
    <section style={{ 
      position: 'relative', 
      zIndex: 10, 
      marginTop: '-3rem', 
      padding: '0 1.5rem',
      marginBottom: '3rem'
    }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        <form onSubmit={handleSearchSubmit} className="glass-panel" style={{ 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-md)', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.25rem',
          alignItems: 'end',
          textAlign: 'left',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: '#ffffff'
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Location / City</label>
            <select 
              className="form-select" 
              value={params.city} 
              onChange={(e) => setParams({...params, city: e.target.value})}
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select City</option>
              <option value="Pune">Pune</option>
              <option value="Noida">Noida</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Gurgaon">Gurgaon</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Property Type</label>
            <select 
              className="form-select"
              value={params.type}
              onChange={(e) => setParams({...params, type: e.target.value})}
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select Type</option>
              <option value="ONE_BHK">1 BHK</option>
              <option value="TWO_BHK">2 BHK</option>
              <option value="THREE_BHK">3 BHK</option>
              <option value="STUDIO">Studio</option>
              <option value="VILLA">Villa</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Monthly Rent (₹)</label>
            <select 
              className="form-select"
              value={params.budget}
              onChange={(e) => setParams({...params, budget: e.target.value})}
              style={{ backgroundColor: '#ffffff', color: '#0f172a', border: '1px solid var(--border-color)' }}
            >
              <option value="">Select Budget</option>
              <option value="15000">Up to ₹15,000</option>
              <option value="25000">Up to ₹25,000</option>
              <option value="35000">Up to ₹35,000</option>
              <option value="50000">Up to ₹50,000</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', width: '100%', height: '46px', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Search size={18} /> Search Homes
          </button>
        </form>
      </div>
    </section>
  );
};

export default SearchBar;
