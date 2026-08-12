import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Lock, Edit3, DollarSign, Layers, Tag, ShieldAlert } from 'lucide-react';

export const InventoryTable = ({ accessories, brands, categories, onEditStock }) => {
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'warehouse_manager';
  const canSeePrices = isOwner || isManager;

  // Filter accessories
  const filtered = accessories.filter(acc => {
    const matchesBrand = selectedBrand === 'all' || acc.brand_id === selectedBrand;
    const matchesCat = selectedCat === 'all' || acc.category_id === selectedCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      acc.style_code.toLowerCase().includes(q) ||
      acc.color.toLowerCase().includes(q) ||
      acc.size.toLowerCase().includes(q) ||
      (acc.brand_name && acc.brand_name.toLowerCase().includes(q)) ||
      (acc.category_name && acc.category_name.toLowerCase().includes(q));

    return matchesBrand && matchesCat && matchesSearch;
  });

  // Total Monetary Valuation calculation (OWNER ONLY)
  const totalValuation = filtered.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_cost || 0)), 0);
  const totalQuantity = filtered.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
      {/* Header Summary & Security Restriction Notice */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Stock Quantity Card */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '12px', color: '#60a5fa' }}>
            <Layers size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Stock Quantity</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{totalQuantity.toLocaleString()} Units</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{filtered.length} Items Listed</p>
          </div>
        </div>

        {/* OWNER ONLY: Total Blocked Monetary Value */}
        {isOwner ? (
          <div className="glass-card" style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(30, 41, 59, 0.9))',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.25)', padding: '12px', borderRadius: '12px', color: '#fbbf24' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Master Financial Valuation
                </p>
                <span className="badge badge-owner" style={{ fontSize: '0.65rem' }}>Owner Only</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                ₹ {totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Total blocked capital in accessories</p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px border-color'
          }}>
            <div style={{ background: 'rgba(148, 163, 184, 0.1)', padding: '12px', borderRadius: '12px', color: '#94a3b8' }}>
              <Lock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Financial Valuation</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#64748b', fontStyle: 'italic' }}>Restricted to Owner</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {isManager ? 'Manager rights: stock quantity & rate entry enabled, total valuation hidden' : 'Role restricted'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by Style Code, Color, Size, Brand..."
            className="form-control"
            style={{ paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Brand Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={16} style={{ color: '#94a3b8' }} />
          <select
            className="form-control"
            style={{ width: '160px' }}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="all">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} style={{ color: '#94a3b8' }} />
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Stock Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: '1.1rem' }}>No accessories found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map(item => (
            <div key={item.id} className="glass-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              border: item.quantity <= 100 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* Image & Brand Banner */}
              <div style={{ position: 'relative', height: '160px', width: '100%', background: '#0f172a' }}>
                <img
                  src={item.image_url}
                  alt={item.style_code}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#60a5fa'
                }}>
                  {item.brand_name}
                </div>

                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(30, 41, 59, 0.9)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#f8fafc'
                }}>
                  {item.category_name}
                </div>
              </div>

              {/* Content Details */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
                    {item.style_code}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.825rem', marginBottom: '14px' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Color: </span>
                      <strong style={{ color: '#cbd5e1' }}>{item.color}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Size: </span>
                      <strong style={{ color: '#60a5fa' }}>{item.size}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Available Stock</span>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: item.quantity <= 100 ? '#ef4444' : '#10b981'
                    }}>
                      {item.quantity.toLocaleString()} Pcs
                    </span>
                  </div>

                  {canSeePrices && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Unit Rate</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                        ₹ {Number(item.unit_cost || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {canSeePrices && (
                    <button
                      onClick={() => onEditStock(item)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 8px' }}
                      title="Edit Stock or Rate"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
