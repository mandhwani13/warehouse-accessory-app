import React, { useState } from 'react';
import { X, Plus, Tag, Layers, Check } from 'lucide-react';

export const BrandManagerModal = ({ isOpen, onClose, brands, categories, onAddBrand, onAddCategory }) => {
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');

  const [catName, setCatName] = useState('');
  const [catTarget, setCatTarget] = useState('all');
  const [catDesc, setCatDesc] = useState('');

  const [activeSubTab, setActiveSubTab] = useState('brand'); // 'brand' | 'category'

  if (!isOpen) return null;

  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    onAddBrand({ name: brandName.trim(), code: (brandCode || brandName.substring(0, 3)).toUpperCase() });
    setBrandName('');
    setBrandCode('');
  };

  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory({ name: catName.trim(), target_unit: catTarget, description: catDesc.trim() });
    setCatName('');
    setCatDesc('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Manage Brands & Accessory Types
          </h3>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Sub Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('brand')}
            className={`btn ${activeSubTab === 'brand' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Tag size={16} /> + Add Brand ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('category')}
            className={`btn ${activeSubTab === 'category' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Layers size={16} /> + Add Accessory Type ({categories.length})
          </button>
        </div>

        {/* Add Brand Form */}
        {activeSubTab === 'brand' && (
          <div className="glass-card" style={{ padding: '20px', background: '#f8fafc' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e40af', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={18} /> Register New Brand
            </h4>
            <form onSubmit={handleBrandSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Levi's, Zara, Raymond"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Brand Code (3 letters)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. LEV"
                    value={brandCode}
                    onChange={(e) => setBrandCode(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Save New Brand
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Existing Registered Brands:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {brands.map(b => (
                  <span key={b.id} className="badge badge-manager">
                    {b.name} ({b.code})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Category / Accessory Type Form */}
        {activeSubTab === 'category' && (
          <div className="glass-card" style={{ padding: '20px', background: '#f8fafc' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#065f46', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} /> Register New Accessory Type
            </h4>
            <form onSubmit={handleCatSubmit}>
              <div className="form-group">
                <label>Accessory Type Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Metallic Zipper, Care Label, Main Label, Elastic, Eyelet"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Allowed Job Work Unit</label>
                <select className="form-control" value={catTarget} onChange={(e) => setCatTarget(e.target.value)}>
                  <option value="all">Allowed for All Units (Stitching & Finishing)</option>
                  <option value="job_work_stitching">Job Work Stitching Unit Only</option>
                  <option value="job_work_finishing">Job Work Finishing Unit Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description / Usage Note</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Woven labels for jeans back pocket..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                <Plus size={16} /> Save New Accessory Type
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Existing Accessory Types:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categories.map(c => (
                  <span key={c.id} className="badge badge-stitching">
                    {c.name} ({c.target_unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
