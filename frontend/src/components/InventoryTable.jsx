import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Lock, Edit3, DollarSign, Layers, Tag, PlusCircle, ChevronDown, ChevronUp, PackageCheck } from 'lucide-react';

export const InventoryTable = ({ accessories, brands, categories, onEditStock, onOpenBrandModal, onOpenAddStock }) => {
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

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

  // Group accessories by Brand + Category + Style Code
  const groupedStock = useMemo(() => {
    const groups = {};
    filtered.forEach(item => {
      const key = `${item.brand_id}_${item.category_id}_${(item.style_code || '').trim().toLowerCase()}`;
      if (!groups[key]) {
        groups[key] = {
          groupKey: key,
          style_code: item.style_code,
          brand_id: item.brand_id,
          brand_name: item.brand_name || 'Unknown',
          category_id: item.category_id,
          category_name: item.category_name || 'Uncategorized',
          image_url: item.image_url,
          total_quantity: 0,
          total_valuation: 0,
          variations: []
        };
      }
      groups[key].variations.push(item);
      groups[key].total_quantity += Number(item.quantity || 0);
      groups[key].total_valuation += Number(item.quantity || 0) * Number(item.unit_cost || 0);
    });
    return Object.values(groups);
  }, [filtered]);

  const toggleExpand = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

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
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{groupedStock.length} Style Items ({filtered.length} Variations)</p>
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

        {/* Action Buttons */}
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

      {/* Grid of Grouped Stock Cards */}
      {groupedStock.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>No accessories found matching your filter criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groupedStock.map(group => {
            const isExpanded = !!expandedGroups[group.groupKey];

            return (
              <div
                key={group.groupKey}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  border: group.total_quantity <= 100 ? '2px solid #fca5a5' : '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Main Summary Header Line */}
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '16px',
                  background: isExpanded ? '#f8fafc' : '#ffffff',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Item Image Thumbnail */}
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                      <img
                        src={group.image_url}
                        alt={group.style_code}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80';
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                          {group.style_code}
                        </h4>
                        <span className="badge badge-manager" style={{ fontSize: '0.75rem' }}>{group.brand_name}</span>
                        <span className="badge badge-stitching" style={{ fontSize: '0.75rem' }}>{group.category_name}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                        <span>
                          <strong>{group.variations.length}</strong> {group.variations.length === 1 ? 'Variation' : 'Variations'} available
                        </span>
                        <span>•</span>
                        <span>
                          Sizes: {group.variations.map(v => v.size).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock Quantity, Valuation, & Expand Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total Combined Stock</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: group.total_quantity <= 100 ? '#dc2626' : '#059669' }}>
                        {group.total_quantity.toLocaleString()} Pcs
                      </span>
                    </div>

                    {isOwner && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'block', fontWeight: 600 }}>Total Value</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f' }}>
                          ₹ {group.total_valuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => toggleExpand(group.groupKey)}
                      className={`btn ${isExpanded ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isExpanded ? (
                        <>Hide Variations <ChevronUp size={16} /></>
                      ) : (
                        <>View Variations ({group.variations.length}) <ChevronDown size={16} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Variations Breakdown Drawer */}
                {isExpanded && (
                  <div style={{ padding: '16px', background: '#ffffff' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PackageCheck size={16} className="text-blue-600" /> Color & Size Breakdown for {group.style_code}:
                    </h5>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Color / Finish</th>
                            <th style={{ padding: '10px 12px', textAlign: 'left' }}>Size / Dimension</th>
                            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Available Stock</th>
                            {canSeePrices && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Rate (₹)</th>}
                            {isOwner && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total Value (₹)</th>}
                            {canSeePrices && <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {group.variations.map(v => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155' }}>
                                {v.color}
                              </td>

                              <td style={{ padding: '10px 12px' }}>
                                <span className="badge badge-manager" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                  Size {v.size}
                                </span>
                              </td>

                              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: v.quantity <= 100 ? '#dc2626' : '#059669' }}>
                                {v.quantity.toLocaleString()} Pcs
                              </td>

                              {canSeePrices && (
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                                  ₹ {Number(v.unit_cost || 0).toFixed(2)}
                                </td>
                              )}

                              {isOwner && (
                                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#78350f' }}>
                                  ₹ {(v.quantity * v.unit_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              )}

                              {canSeePrices && (
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  <button
                                    onClick={() => onEditStock(v)}
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px' }}
                                    title="Edit Quantity or Rate"
                                  >
                                    <Edit3 size={14} /> Edit
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
