import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Trash2, Send, Tag } from 'lucide-react';

export const RequestModal = ({ isOpen, onClose, accessories, onCreateRequest }) => {
  const { user } = useAuth();
  const [lotBatchNo, setLotBatchNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedItems, setSelectedItems] = useState([
    { accessory_id: '', requested_qty: '' }
  ]);

  if (!isOpen) return null;

  // Filter available accessories for requisition based on role
  const allowedAccessories = accessories.filter(a => {
    if (user?.role === 'job_work_stitching') {
      return a.category_target_unit === 'job_work_stitching' || a.category_target_unit === 'all';
    }
    if (user?.role === 'job_work_finishing') {
      return a.category_target_unit === 'job_work_finishing' || a.category_target_unit === 'all';
    }
    return true;
  });

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { accessory_id: '', requested_qty: '' }]);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = selectedItems.filter(i => i.accessory_id && Number(i.requested_qty) > 0);
    if (!lotBatchNo.trim()) {
      alert('Batch Number / Lot Number is required');
      return;
    }
    if (validItems.length === 0) {
      alert('Please add at least one accessory with a valid requested quantity');
      return;
    }

    onCreateRequest({
      lot_batch_no: lotBatchNo.trim(),
      remarks,
      items: validItems
    });

    // Reset
    setLotBatchNo('');
    setRemarks('');
    setSelectedItems([{ accessory_id: '', requested_qty: '' }]);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Create Requisition Pass Request
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Unit: <strong style={{ color: '#60a5fa' }}>{user?.name}</strong> ({user?.role})
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lot/Batch Number */}
          <div className="form-group">
            <label style={{ color: '#fbbf24', fontWeight: 600 }}>
              Batch Number / Lot Number * (Required)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. LOT-2026-889A or BATCH-994"
              value={lotBatchNo}
              onChange={(e) => setLotBatchNo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Purpose / Production Remarks</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Size labels required for 500 pcs denim jeans lot"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Requested Accessories List */}
          <div style={{ marginTop: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ fontWeight: 600, color: '#f8fafc' }}>Select Accessories Required</label>
              <button type="button" onClick={handleAddItem} className="btn btn-outline btn-sm">
                <Plus size={14} /> Add Item Line
              </button>
            </div>

            {selectedItems.map((item, idx) => {
              const selectedAcc = allowedAccessories.find(a => a.id === item.accessory_id);
              return (
                <div key={idx} className="glass-card" style={{
                  padding: '12px',
                  marginBottom: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr auto',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  {/* Accessory Dropdown */}
                  <div>
                    <select
                      className="form-control"
                      value={item.accessory_id}
                      onChange={(e) => handleItemChange(idx, 'accessory_id', e.target.value)}
                      required
                    >
                      <option value="">-- Choose Accessory --</option>
                      {allowedAccessories.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          [{acc.brand_name}] {acc.style_code} ({acc.category_name} | {acc.color} | Sz: {acc.size}) - Stock: {acc.quantity}
                        </option>
                      ))}
                    </select>

                    {selectedAcc && (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Avail. Stock: <strong style={{ color: '#34d399' }}>{selectedAcc.quantity} Pcs</strong> | Brand: {selectedAcc.brand_name}
                      </p>
                    )}
                  </div>

                  {/* Quantity requested */}
                  <div>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="Req Qty (Pcs)"
                      value={item.requested_qty}
                      onChange={(e) => handleItemChange(idx, 'requested_qty', e.target.value)}
                      required
                    />
                  </div>

                  {/* Delete line */}
                  <div>
                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <Send size={16} />
              Submit Requisition Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
