import React, { useState } from 'react';
import { X, Plus, Tag, Layers } from 'lucide-react';

export const BrandManagerModal = ({ isOpen, onClose, brands, categories, onAddBrand, onAddCategory }) => {
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');

  const [catName, setCatName] = useState('');
  const [catTarget, setCatTarget] = useState('all');
  const [catDesc, setCatDesc] = useState('');

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
      <div className="modal-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            Manage Brands & Accessory Categories
          </h3>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Add Brand Form */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#60a5fa', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} /> Add New Brand
          </h4>
          <form onSubmit={handleBrandSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '12px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Brand Name (e.g. Levi's, Zara)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-control"
              placeholder="Code (e.g. LEV)"
              value={brandCode}
              onChange={(e) => setBrandCode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add Brand
            </button>
          </form>

          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {brands.map(b => (
              <span key={b.id} className="badge badge-manager">
                {b.name} ({b.code})
              </span>
            ))}
          </div>
        </div>

        {/* Add Category Form */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} /> Add New Category
          </h4>
          <form onSubmit={handleCatSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Category Name (e.g. Zipper, care label)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                required
              />
              <select className="form-control" value={catTarget} onChange={(e) => setCatTarget(e.target.value)}>
                <option value="all">Allowed for All Units</option>
                <option value="job_work_stitching">Stitching Unit Only</option>
                <option value="job_work_finishing">Finishing Unit Only</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Short Description..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-success" style={{ flexShrink: 0 }}>
                <Plus size={16} /> Add Category
              </button>
            </div>
          </form>

          <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map(c => (
              <span key={c.id} className="badge badge-stitching">
                {c.name} ({c.target_unit})
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
