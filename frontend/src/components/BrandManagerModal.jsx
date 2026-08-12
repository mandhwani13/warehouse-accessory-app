import React, { useState } from 'react';
import { X, Plus, Tag, Layers, Edit2, Trash2, Check, RotateCcw } from 'lucide-react';

export const BrandManagerModal = ({
  isOpen,
  onClose,
  brands,
  categories,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}) => {
  const [activeSubTab, setActiveSubTab] = useState('brand'); // 'brand' | 'category'

  // New Brand form
  const [brandName, setBrandName] = useState('');
  const [brandCode, setBrandCode] = useState('');

  // Editing Brand state
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandCode, setEditBrandCode] = useState('');

  // New Category form
  const [catName, setCatName] = useState('');
  const [catTarget, setCatTarget] = useState('all');
  const [catDesc, setCatDesc] = useState('');

  // Editing Category state
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatTarget, setEditCatTarget] = useState('all');
  const [editCatDesc, setEditCatDesc] = useState('');

  if (!isOpen) return null;

  // Brand Handlers
  const handleBrandSubmit = (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    onAddBrand({ name: brandName.trim(), code: (brandCode || brandName.substring(0, 3)).toUpperCase() });
    setBrandName('');
    setBrandCode('');
  };

  const startEditBrand = (b) => {
    setEditingBrandId(b.id);
    setEditBrandName(b.name);
    setEditBrandCode(b.code || '');
  };

  const saveEditBrand = (id) => {
    if (!editBrandName.trim()) return;
    onEditBrand(id, { name: editBrandName.trim(), code: editBrandCode.trim().toUpperCase() });
    setEditingBrandId(null);
  };

  // Category Handlers
  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory({ name: catName.trim(), target_unit: catTarget, description: catDesc.trim() });
    setCatName('');
    setCatDesc('');
  };

  const startEditCat = (c) => {
    setEditingCatId(c.id);
    setEditCatName(c.name);
    setEditCatTarget(c.target_unit || 'all');
    setEditCatDesc(c.description || '');
  };

  const saveEditCat = (id) => {
    if (!editCatName.trim()) return;
    onEditCategory(id, { name: editCatName.trim(), target_unit: editCatTarget, description: editCatDesc.trim() });
    setEditingCatId(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '700px' }}>
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
            <Tag size={16} /> Brands ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('category')}
            className={`btn ${activeSubTab === 'category' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
          >
            <Layers size={16} /> Accessory Types ({categories.length})
          </button>
        </div>

        {/* TAB 1: BRANDS */}
        {activeSubTab === 'brand' && (
          <div>
            {/* Add Brand Form */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Register New Brand
              </h4>
              <form onSubmit={handleBrandSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: '10px' }}>
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
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  <Plus size={16} /> Add
                </button>
              </form>
            </div>

            {/* List & Edit/Delete Brands */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>Registered Brands List:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {brands.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No brands added yet.</p>
              ) : (
                brands.map(b => (
                  <div key={b.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
                    {editingBrandId === b.id ? (
                      <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={editBrandName}
                          onChange={(e) => setEditBrandName(e.target.value)}
                          placeholder="Brand Name"
                        />
                        <input
                          type="text"
                          className="form-control"
                          style={{ width: '100px' }}
                          value={editBrandCode}
                          onChange={(e) => setEditBrandCode(e.target.value)}
                          placeholder="Code"
                        />
                        <button type="button" onClick={() => saveEditBrand(b.id)} className="btn btn-success btn-sm">
                          <Check size={14} />
                        </button>
                        <button type="button" onClick={() => setEditingBrandId(null)} className="btn btn-secondary btn-sm">
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Tag size={16} className="text-blue-600" />
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{b.name}</strong>
                          <span className="badge badge-manager" style={{ fontSize: '0.7rem' }}>{b.code}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => startEditBrand(b)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }} title="Edit Brand">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" onClick={() => onDeleteBrand(b.id)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }} title="Delete Brand">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACCESSORY TYPES */}
        {activeSubTab === 'category' && (
          <div>
            {/* Add Category Form */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Register New Accessory Type
              </h4>
              <form onSubmit={handleCatSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Accessory Type (e.g. Size Label, Zipper)"
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Description / Usage notes..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success" style={{ flexShrink: 0, padding: '8px 16px' }}>
                    <Plus size={16} /> Add Type
                  </button>
                </div>
              </form>
            </div>

            {/* List & Edit/Delete Accessory Types */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>Registered Accessory Types:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {categories.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No accessory types added yet.</p>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="glass-card" style={{ padding: '10px 14px', background: '#ffffff' }}>
                    {editingCatId === c.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            placeholder="Type Name"
                          />
                          <select className="form-control" value={editCatTarget} onChange={(e) => setEditCatTarget(e.target.value)}>
                            <option value="all">All Units</option>
                            <option value="job_work_stitching">Stitching Only</option>
                            <option value="job_work_finishing">Finishing Only</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editCatDesc}
                            onChange={(e) => setEditCatDesc(e.target.value)}
                            placeholder="Description"
                          />
                          <button type="button" onClick={() => saveEditCat(c.id)} className="btn btn-success btn-sm">
                            <Check size={14} /> Save
                          </button>
                          <button type="button" onClick={() => setEditingCatId(null)} className="btn btn-secondary btn-sm">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{c.name}</strong>
                            <span className="badge badge-stitching" style={{ fontSize: '0.7rem' }}>
                              {c.target_unit === 'job_work_stitching' ? 'Stitching Only' :
                               c.target_unit === 'job_work_finishing' ? 'Finishing Only' : 'All Units'}
                            </span>
                          </div>
                          {c.description && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{c.description}</p>}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => startEditCat(c)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }} title="Edit Accessory Type">
                            <Edit2 size={14} />
                          </button>
                          <button type="button" onClick={() => onDeleteCategory(c.id)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', color: '#dc2626', borderColor: '#fca5a5' }} title="Delete Accessory Type">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
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
