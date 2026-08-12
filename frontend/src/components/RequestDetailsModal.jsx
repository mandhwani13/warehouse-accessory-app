import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, Clock, PackageCheck, Truck, Printer, PlusCircle } from 'lucide-react';

export const RequestDetailsModal = ({ isOpen, onClose, request, onApprove, onMarkReady, onMarkPicked, onPrint }) => {
  const { user } = useAuth();
  const [approvedItems, setApprovedItems] = useState([]);
  const [extraNotes, setExtraNotes] = useState('');
  const [showExtraToggle, setShowExtraToggle] = useState(false);

  useEffect(() => {
    if (request && request.items) {
      setApprovedItems(
        request.items.map(item => ({
          accessory_id: item.accessory_id,
          requested_qty: item.requested_qty,
          approved_qty: item.approved_qty || item.requested_qty,
          extra_qty: item.extra_qty || 0
        }))
      );
      setExtraNotes(request.extra_qty_notes || '');
      setShowExtraToggle(Boolean(request.extra_qty_notes || request.items.some(i => i.extra_qty > 0)));
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'warehouse_manager';
  const isPicker = user?.role === 'accessory_picker';
  const canApprove = isOwner || isManager;
  const canPick = isOwner || isManager || isPicker;

  const handleQtyChange = (index, field, value) => {
    const updated = [...approvedItems];
    updated[index][field] = Number(value) || 0;
    setApprovedItems(updated);
  };

  const handleApproveSubmit = () => {
    onApprove(request.id, {
      approved_items: approvedItems,
      extra_qty_notes: showExtraToggle ? extraNotes : ''
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-status-pending"><Clock size={12} /> Pending Approval</span>;
      case 'approved': return <span className="badge badge-status-approved"><CheckCircle size={12} /> Approved</span>;
      case 'ready': return <span className="badge badge-status-ready"><PackageCheck size={12} /> Ready for Pickup</span>;
      case 'picked_up': return <span className="badge badge-status-picked_up"><Truck size={12} /> Picked Up & Handed Over</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '750px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{request.req_no}</h3>
              {getStatusBadge(request.status)}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
              Lot / Batch #: <strong style={{ color: '#b45309' }}>{request.lot_batch_no}</strong> | Unit: {request.requester_name}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onPrint(request)} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print A6 Gate Pass
            </button>
            <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workflow Timeline Status */}
        <div className="glass-card" style={{ padding: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', textAlign: 'center', background: '#f8fafc' }}>
          <div style={{ color: request.created_at ? '#059669' : '#94a3b8' }}>
            <strong>1. Created</strong>
            <p>{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div style={{ color: request.approved_at ? '#059669' : '#94a3b8' }}>
            <strong>2. Manager Approval</strong>
            <p>{request.approved_at ? new Date(request.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</p>
          </div>
          <div style={{ color: request.ready_at ? '#059669' : '#94a3b8' }}>
            <strong>3. Picker Ready</strong>
            <p>{request.ready_at ? new Date(request.ready_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</p>
          </div>
          <div style={{ color: request.picked_at ? '#059669' : '#94a3b8' }}>
            <strong>4. Picked Up</strong>
            <p>{request.picked_at ? new Date(request.picked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            Requested Accessory Items List
          </h4>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Item / Brand / Style</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Size & Color</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Req. Qty</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Approved Qty</th>
                {showExtraToggle && <th style={{ padding: '8px', textAlign: 'right' }}>Extra Given</th>}
              </tr>
            </thead>
            <tbody>
              {(request.items || []).map((item, idx) => {
                const approvedItem = approvedItems[idx] || {};
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80'}
                          alt={item.style_code}
                          style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                        />
                        <div>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{item.style_code}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>{item.brand_name} ({item.category_name})</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>
                        Sz: {item.size}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.color}</p>
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {item.requested_qty} Pcs
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      {request.status === 'pending' && canApprove ? (
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          style={{ width: '80px', textAlign: 'right', padding: '4px 6px' }}
                          value={approvedItem.approved_qty}
                          onChange={(e) => handleQtyChange(idx, 'approved_qty', e.target.value)}
                        />
                      ) : (
                        <strong style={{ color: '#059669' }}>{item.approved_qty || item.requested_qty} Pcs</strong>
                      )}
                    </td>

                    {showExtraToggle && (
                      <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                        {request.status === 'pending' && canApprove ? (
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            style={{ width: '80px', textAlign: 'right', padding: '4px 6px', color: '#b45309', fontWeight: 'bold' }}
                            value={approvedItem.extra_qty}
                            onChange={(e) => handleQtyChange(idx, 'extra_qty', e.target.value)}
                          />
                        ) : (
                          <strong style={{ color: '#b45309' }}>+{item.extra_qty || 0} Pcs</strong>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Manager Toggle for Extra Accessories */}
        {canApprove && request.status === 'pending' && (
          <div className="glass-card" style={{ padding: '12px', marginBottom: '20px', background: '#fef3c7', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} className="text-amber-700" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#78350f' }}>
                  Warehouse Manager Extra Accessory Issuing Toggle
                </span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showExtraToggle}
                  onChange={(e) => setShowExtraToggle(e.target.checked)}
                />
                <span style={{ fontSize: '0.8rem', color: '#78350f', fontWeight: 600 }}>Issue Extra Quantities</span>
              </label>
            </div>

            {showExtraToggle && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>Extra Issue Explanation / Remarks</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Added 50 extra size 32 labels as backup since lot size increased"
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons based on status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <div>
            <button onClick={() => onPrint(request)} className="btn btn-outline">
              <Printer size={16} /> Print Gate Pass (A6)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {request.status === 'pending' && canApprove && (
              <button onClick={handleApproveSubmit} className="btn btn-primary">
                <CheckCircle size={16} /> Approve & Issue Request
              </button>
            )}

            {request.status === 'approved' && canPick && (
              <button onClick={() => onMarkReady(request.id)} className="btn btn-primary" style={{ background: '#7c3aed' }}>
                <PackageCheck size={16} /> Mark "Ready for Pickup"
              </button>
            )}

            {request.status === 'ready' && canPick && (
              <button onClick={() => onMarkPicked(request.id)} className="btn btn-success">
                <Truck size={16} /> Confirm "Picked Up" & Deduct Stock
              </button>
            )}

            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
