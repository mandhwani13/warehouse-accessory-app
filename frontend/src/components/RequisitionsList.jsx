import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Clock, CheckCircle, PackageCheck, Truck, Printer, Eye, Edit2 } from 'lucide-react';

export const RequisitionsList = ({ requests, onSelectRequest, onEditPending, onPrint }) => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-status-pending"><Clock size={12} /> Pending</span>;
      case 'approved': return <span className="badge badge-status-approved"><CheckCircle size={12} /> Approved</span>;
      case 'ready': return <span className="badge badge-status-ready"><PackageCheck size={12} /> Ready for Pickup</span>;
      case 'picked_up': return <span className="badge badge-status-picked_up"><Truck size={12} /> Picked Up</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '24px auto', padding: '0 16px' }}>
      {/* Header & Status Filter Pills */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardList size={20} className="text-blue-400" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
            Accessory Requisition Gate Passes ({filtered.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'ready', 'picked_up'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p>No requisitions found under current filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(req => {
            const canEdit = req.status === 'pending' && (
              ['owner', 'warehouse_manager'].includes(user?.role) || req.requester_id === user?.id
            );

            return (
              <div key={req.id} className="glass-card" style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: req.status === 'pending' ? '4px solid #f59e0b' :
                           req.status === 'approved' ? '4px solid #3b82f6' :
                           req.status === 'ready' ? '4px solid #8b5cf6' : '4px solid #10b981'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa' }}>{req.req_no}</h4>
                    {getStatusBadge(req.status)}
                    <span style={{ fontSize: '0.8rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      LOT #: <strong>{req.lot_batch_no}</strong>
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                    Requested by: <strong>{req.requester_name}</strong> ({req.unit_type}) • {new Date(req.created_at).toLocaleString()}
                  </p>

                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                    Items: {(req.items || []).map(i => `${i.style_code} (${i.approved_qty || i.requested_qty} pcs)`).join(', ')}
                  </p>

                  {req.extra_qty_notes && (
                    <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px', fontStyle: 'italic' }}>
                      Extra Issue Note: {req.extra_qty_notes}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canEdit && (
                    <button onClick={() => onEditPending(req)} className="btn btn-outline btn-sm" title="Edit Pending Request">
                      <Edit2 size={14} /> Edit
                    </button>
                  )}

                  <button onClick={() => onPrint(req)} className="btn btn-outline btn-sm" title="Print A6 Challan">
                    <Printer size={14} /> A6 Pass
                  </button>

                  <button onClick={() => onSelectRequest(req)} className="btn btn-primary btn-sm">
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
