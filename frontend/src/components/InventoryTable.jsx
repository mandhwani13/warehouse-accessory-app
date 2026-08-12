import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Lock, Edit3, DollarSign, Layers, Tag, PlusCircle } from 'lucide-react';

export const InventoryTable = ({ accessories, brands, categories, onEditStock, onOpenBrandModal, onOpenAddStock }) => {
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
          <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '12px', color: '#1e40af' }}>
            <Layers size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Stock Quantity</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{totalQuantity.toLocaleString()} Pcs</h3>
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
            background: '#fef3c7',
            border: '1px solid #fde68a'
          }}>
            <div style={{ background: '#f59e0b', padding: '12px', borderRadius: '12px', color: '#ffffff' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Master Financial Valuation
                </p>
                <span className="badge badge-owner" style={{ fontSize: '0.65rem' }}>Owner Only</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350f' }}>
                ₹ {totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#92400e' }}>Total capital blocked in stock</p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ background: '#e2e8f0', padding: '12px', borderRadius: '12px', color: '#64748b' }}>
              <Lock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Financial Valuation</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', fontStyle: 'italic' }}>Restricted to Owner</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {isManager ? 'Stock & cost entry active, total valuation hidden' : 'Role restricted'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls, Filter Bar & Quick Add Brand/Category Buttons */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search Style Code, Color, Size, Brand..."
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Brand Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-control"
              style={{ width: '180px' }}
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">All Accessory Types ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Add Brand & Add Accessory Type */}
        {['owner', 'warehouse_manager'].includes(user?.role) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onOpenBrandModal} className="btn btn-outline btn-sm">
              <Tag size={14} className="text-blue-600" /> + Add Brand / Type
            </button>
            <button onClick={onOpenAddStock} className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> + Add Stock Item
            </button>
          </div>
        )}
      </div>

      {/* Grid of Stock Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>No accessories found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map(item => (
            <div key={item.id} className="glass-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: item.quantity <= 100 ? '2px solid #fca5a5' : '1px solid #e2e8f0'
            }}>
              <div>
                {/* Image & Brand Banner */}
                <div style={{ position: 'relative', height: '150px', width: '100%', background: '#f1f5f9' }}>
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
                    background: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#2563eb'
                  }}>
                    {item.brand_name}
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#0f172a',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff'
                  }}>
                    {item.category_name}
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ padding: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    {item.style_code}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', marginBottom: '14px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Color: </span>
                      <strong style={{ color: '#334155' }}>{item.color}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Size: </span>
                      <strong style={{ color: '#2563eb' }}>{item.size}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock & Rate Footer */}
              <div style={{
                padding: '12px 16px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Available Stock</span>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: item.quantity <= 100 ? '#dc2626' : '#059669'
                  }}>
                    {item.quantity.toLocaleString()} Pcs
                  </span>
                </div>

                {canSeePrices && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 500 }}>Unit Rate</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#b45309' }}>
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
          ))}
        </div>
      )}
    </div>
  );
};
