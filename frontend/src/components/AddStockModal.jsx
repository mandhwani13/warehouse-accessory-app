import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Check, Sparkles, Layers } from 'lucide-react';

const SIZES_LIST = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'Standard', 'Free Size'];
const COMMON_SIZES_DENIM = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50'];

export const AddStockModal = ({ isOpen, onClose, onSave, onSaveBatch, editingItem, brands, categories }) => {
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Multi-variation rows state
  const [variations, setVariations] = useState([
    { color: 'Standard', size: '32', quantity: '', unit_cost: '' }
  ]);

  useEffect(() => {
    if (editingItem) {
      setBrandId(editingItem.brand_id || '');
      setCategoryId(editingItem.category_id || '');
      setStyleCode(editingItem.style_code || '');
      setImageUrl(editingItem.image_url || '');
      setVariations([
        {
          color: editingItem.color || 'Standard',
          size: editingItem.size || '32',
          quantity: editingItem.quantity || '',
          unit_cost: editingItem.unit_cost || ''
        }
      ]);
    } else {
      if (brands.length > 0) setBrandId(brands[0].id);
      if (categories.length > 0) setCategoryId(categories[0].id);
      setStyleCode('');
      setImageUrl('');
      setVariations([
        { color: 'Navy Blue / White', size: '30', quantity: '500', unit_cost: '1.50' },
        { color: 'Navy Blue / White', size: '32', quantity: '600', unit_cost: '1.50' }
      ]);
    }
  }, [editingItem, isOpen, brands, categories]);

  if (!isOpen) return null;

  const handleAddVariationRow = () => {
    const last = variations[variations.length - 1] || {};
    setVariations([
      ...variations,
      { color: last.color || 'Standard', size: '34', quantity: last.quantity || '', unit_cost: last.unit_cost || '' }
    ]);
  };

  const handleRemoveVariationRow = (index) => {
    if (variations.length === 1) return;
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleVariationChange = (index, field, value) => {
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  // Quick Multi-Size Batch Generator (Sizes 28 to 50)
  const handleGenerateSizeSet = () => {
    const defaultColor = variations[0]?.color || 'Standard';
    const defaultQty = variations[0]?.quantity || '500';
    const defaultCost = variations[0]?.unit_cost || '1.50';

    const generated = COMMON_SIZES_DENIM.map(sz => ({
      color: defaultColor,
      size: sz,
      quantity: defaultQty,
      unit_cost: defaultCost
    }));

    setVariations(generated);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('kaypee_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.imageUrl) setImageUrl(data.imageUrl);
    } catch (err) {
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!styleCode.trim()) {
      alert('Style Code is required');
      return;
    }

    if (editingItem) {
      // Single edit mode
      const v = variations[0] || {};
      onSave({
        id: editingItem.id,
        brand_id: brandId,
        category_id: categoryId,
        style_code: styleCode.trim(),
        color: v.color || 'Standard',
        size: v.size || 'N/A',
        quantity: Number(v.quantity) || 0,
        unit_cost: Number(v.unit_cost) || 0,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80'
      });
    } else {
      // Batch multi-variation inward mode
      const itemsToCreate = variations.map(v => ({
        brand_id: brandId,
        category_id: categoryId,
        style_code: styleCode.trim(),
        color: (v.color || 'Standard').trim(),
        size: (v.size || 'N/A').trim(),
        quantity: Number(v.quantity) || 0,
        unit_cost: Number(v.unit_cost) || 0,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80'
      }));

      onSaveBatch(itemsToCreate);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {editingItem ? 'Edit Accessory Stock Item' : 'Inward Multi-Variation Accessory Stock'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {editingItem ? 'Update stock quantity or unit cost rate' : 'Add multiple colors (e.g. Black, Blue) or sizes (e.g. 28 to 50) in one single entry'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Header Brand, Category, Style Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Brand *</label>
              <select className="form-control" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Accessory Type *</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Style Code / Item Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. KP-JEAN-501"
                value={styleCode}
                onChange={(e) => setStyleCode(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick Generator Toolbar */}
          {!editingItem && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              marginBottom: '12px',
              background: '#f8fafc',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Variations List ({variations.length} items)
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleGenerateSizeSet}
                  className="btn btn-outline btn-sm"
                  style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}
                  title="Generate size 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50 rows automatically"
                >
                  <Sparkles size={14} /> Quick Sizes 28 to 50
                </button>

                <button type="button" onClick={handleAddVariationRow} className="btn btn-primary btn-sm">
                  <Plus size={14} /> + Add Color / Size Row
                </button>
              </div>
            </div>
          )}

          {/* Variations Table / Rows */}
          <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', width: '30%' }}>Color / Finish</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', width: '25%' }}>Size / Dimension</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: '20%' }}>Quantity (Pcs)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', width: '20%' }}>Unit Cost (₹)</th>
                  {!editingItem && <th style={{ padding: '8px 8px', width: '5%' }}></th>}
                </tr>
              </thead>
              <tbody>
                {variations.map((v, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Black, Navy, Brass"
                        value={v.color}
                        onChange={(e) => handleVariationChange(idx, 'color', e.target.value)}
                        required
                      />
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <select
                        className="form-control"
                        value={v.size}
                        onChange={(e) => handleVariationChange(idx, 'size', e.target.value)}
                      >
                        {SIZES_LIST.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        style={{ textAlign: 'right' }}
                        placeholder="e.g. 500"
                        value={v.quantity}
                        onChange={(e) => handleVariationChange(idx, 'quantity', e.target.value)}
                        required
                      />
                    </td>

                    <td style={{ padding: '6px 8px' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        style={{ textAlign: 'right' }}
                        placeholder="e.g. 1.50"
                        value={v.unit_cost}
                        onChange={(e) => handleVariationChange(idx, 'unit_cost', e.target.value)}
                        required
                      />
                    </td>

                    {!editingItem && (
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        {variations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariationRow(idx)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px', color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Photo Image Upload */}
          <div className="form-group">
            <label>Accessory Photo Image (Optional URL or File Upload)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Image URL or click upload button..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <label className="btn btn-outline" style={{ cursor: 'pointer', flexShrink: 0 }}>
                <Upload size={16} />
                {isUploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              {editingItem ? 'Save Changes' : `Save ${variations.length} Variation Items Inward`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
