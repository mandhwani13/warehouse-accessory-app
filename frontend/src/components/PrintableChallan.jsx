import React from 'react';

export const PrintableChallan = ({ request }) => {
  if (!request) return null;

  const formattedDate = new Date(request.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(request.created_at || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div id="printable-challan">
      <div className="challan-header">
        <div className="challan-title">KAYPEE ACCESSORY WAREHOUSE</div>
        <div className="challan-subtitle">OFFICIAL A6 ACCESSORY REQUISITION GATE PASS</div>
      </div>

      <div className="challan-meta-grid">
        <div>
          <strong>Challan No:</strong> {request.req_no}<br />
          <strong>Date & Time:</strong> {formattedDate} {formattedTime}
        </div>
        <div>
          <strong>Requesting Unit:</strong> {request.requester_name || request.unit_type}<br />
          <strong style={{ color: '#000' }}>LOT / BATCH #:</strong> <span style={{ textDecoration: 'underline', fontWeight: 800 }}>{request.lot_batch_no}</span>
        </div>
      </div>

      {request.remarks && (
        <div style={{ fontSize: '7.5pt', marginBottom: '6px', fontStyle: 'italic' }}>
          <strong>Remarks:</strong> {request.remarks}
        </div>
      )}

      {/* Itemization Table */}
      <table className="challan-table">
        <thead>
          <tr>
            <th style={{ width: '22%' }}>Brand</th>
            <th style={{ width: '30%' }}>Style / Item</th>
            <th style={{ width: '20%' }}>Size / Color</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Req</th>
            <th style={{ width: '14%', textAlign: 'right' }}>Issued</th>
          </tr>
        </thead>
        <tbody>
          {(request.items || []).map((item, i) => (
            <tr key={i}>
              <td><strong>{item.brand_name || 'KPD'}</strong></td>
              <td>{item.style_code} ({item.category_name})</td>
              <td>{item.size} / {item.color}</td>
              <td style={{ textAlign: 'right' }}>{item.requested_qty}</td>
              <td style={{ textAlign: 'right', fontWeight: 800 }}>{item.approved_qty || item.requested_qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {request.extra_qty_notes && (
        <div className="challan-extra-box">
          <strong>EXTRA ITEMS ISSUED BY MANAGER:</strong><br />
          {request.extra_qty_notes}
        </div>
      )}

      {/* Dual Signature Block for Gate Pass */}
      <div className="challan-signatures">
        <div className="signature-box">
          <br /><br />
          ___________________________<br />
          <strong>ISSUED BY (WAREHOUSE)</strong><br />
          Sign & Date
        </div>
        <div className="signature-box">
          <br /><br />
          ___________________________<br />
          <strong>RECEIVED BY (JOB WORK REP)</strong><br />
          Sign & Date
        </div>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '6.5pt', color: '#666', borderTop: '1px dotted #ccc', paddingTop: '3px' }}>
        System Generated Gate Pass Document • Kaypee Warehouse Operations
      </div>
    </div>
  );
};
