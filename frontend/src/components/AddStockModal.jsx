import React, { useState, useEffect } from 'react';
import { X, Upload, PlusCircle, Check } from 'lucide-react';

const SIZES_LIST = ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'Standard', 'Free Size'];

export const AddStockModal = ({ isOpen, onClose, onSave, editingItem, brands, categories }) => {
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [styleCode, setStyleCode] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('32');
  const [customSize, setCustomSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setBrandId(editingItem.brand_id || '');
      setCategoryId(editingItem.category_id || '');
      setStyleCode(editingItem.style_code || '');
      setColor(editingItem.color || '');
      if (SIZES_LIST.includes(editingItem.size)) {
        setSize(editingItem.size);
        setCustomSize('');
      } else {
        setSize('Custom');
        setCustomSize(editingItem.size || '');
      }
      setQuantity(editingItem.quantity || '');
      setUnitCost(editingItem.unit_cost || '');
      setImageUrl(editingItem.image_url || '');
    } else {
      if (brands.length > 0) setBrandId(brands[0].id);
      if (categories.length > 0) setCategoryId(categories[0].id);
      setStyleCode('');
      setColor('');
      setSize('32');
      setCustomSize('');
      setQuantity('');
      setUnitCost('');
      setImageUrl('');
    }
  }, [editingItem, isOpen, brands, categories]);

  if (!isOpen) return null;

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
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      // Fallback sample image
      setImageUrl(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalSize = size === 'Custom' ? customSize : size;
    onSave({
      id: editingItem?.id,
      brand_id: brandId,
      category_id: categoryId,
      style_code: styleCode,
      color: color || 'Standard',
      size: finalSize || 'Standard',
      quantity: Number(quantity) || 0,
      unit_cost: Number(unitCost) || 0,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80'
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            {editingItem ? 'Edit Accessory Stock' : 'Add New Accessory Stock'}
          </h3>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Brand */}
            <div className="form-group">
              <label>Brand</label>
              <select className="form-control" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Accessory Category</label>
              <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Style Code */}
          <div className="form-group">
            <label>Style Code / Item Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. KP-JEAN-501 or RIVET-BRASS-01"
              value={styleCode}
              onChange={(e) => setStyleCode(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Color */}
            <div className="form-group">
              <label>Color / Finish</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Navy Blue, Antique Brass, Gold"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>

            {/* Size */}
            <div className="form-group">
              <label>Size / Dimension</label>
              <select className="form-control" value={size} onChange={(e) => setSize(e.target.value)}>
                {SIZES_LIST.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="Custom">Custom Size...</option>
              </select>
            </div>
          </div>

          {size === 'Custom' && (
            <div className="form-group">
              <label>Custom Size Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 14x18 Inch, 50mm"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Quantity */}
            <div className="form-group">
              <label>Stock Quantity (Pcs)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 1500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {/* Unit Cost Rate */}
            <div className="form-group">
              <label>Unit Cost Rate (₹ per pc)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                placeholder="e.g. 1.50"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Image Upload & URL */}
          <div className="form-group">
            <label>Accessory Photo Image</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Image URL or upload below..."
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

          {imageUrl && (
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              {editingItem ? 'Save Changes' : 'Add Stock Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
