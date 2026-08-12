const express = require('express');
const { readData, writeData } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET all requests
router.get('/', authenticateToken, (req, res) => {
  const db = readData();
  const user = req.user;

  let list = db.requests;

  // Job Work units only see their own requests (or unit's requests)
  if (['job_work_stitching', 'job_work_finishing'].includes(user.role)) {
    list = list.filter(r => r.requester_id === user.id || r.unit_type === user.role);
  }

  // Populate accessory & brand details for each item
  const populated = list.map(reqItem => {
    const items = (reqItem.items || []).map(it => {
      const acc = db.accessories.find(a => a.id === it.accessory_id) || {};
      const brand = db.brands.find(b => b.id === acc.brand_id) || { name: 'N/A' };
      const category = db.categories.find(c => c.id === acc.category_id) || { name: 'N/A' };
      return {
        ...it,
        style_code: acc.style_code || 'N/A',
        color: acc.color || 'N/A',
        size: acc.size || 'N/A',
        brand_name: brand.name,
        category_name: category.name,
        image_url: acc.image_url
      };
    });
    return { ...reqItem, items };
  });

  // Sort descending by created_at
  populated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(populated);
});

// GET request by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = readData();
  const request = db.requests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  const items = (request.items || []).map(it => {
    const acc = db.accessories.find(a => a.id === it.accessory_id) || {};
    const brand = db.brands.find(b => b.id === acc.brand_id) || { name: 'N/A' };
    const category = db.categories.find(c => c.id === acc.category_id) || { name: 'N/A' };
    return {
      ...it,
      style_code: acc.style_code || 'N/A',
      color: acc.color || 'N/A',
      size: acc.size || 'N/A',
      brand_name: brand.name,
      category_name: category.name,
      image_url: acc.image_url,
      available_stock: acc.quantity
    };
  });

  res.json({ ...request, items });
});

// POST create request (Job Work Units, Manager, Owner)
router.post('/', authenticateToken, requireRole(['job_work_stitching', 'job_work_finishing', 'warehouse_manager', 'owner']), (req, res) => {
  const { lot_batch_no, remarks, items } = req.body;
  const user = req.user;

  if (!lot_batch_no || !lot_batch_no.trim()) {
    return res.status(400).json({ error: 'Lot / Batch Number is required' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one accessory item is required' });
  }

  const db = readData();
  const reqNo = `REQ-${new Date().getFullYear()}-${String(db.requests.length + 1).padStart(3, '0')}`;

  const newReq = {
    id: 'r_' + Date.now(),
    req_no: reqNo,
    requester_id: user.id,
    requester_name: user.name,
    unit_type: user.role,
    lot_batch_no: lot_batch_no.trim(),
    status: 'pending',
    remarks: remarks || '',
    extra_qty_notes: '',
    items: items.map(i => ({
      accessory_id: i.accessory_id,
      requested_qty: Number(i.requested_qty) || 0,
      approved_qty: Number(i.requested_qty) || 0,
      extra_qty: 0
    })),
    created_at: new Date().toISOString(),
    approved_at: null,
    ready_at: null,
    picked_at: null
  };

  db.requests.push(newReq);
  writeData(db);

  res.status(201).json(newReq);
});

// PUT edit request while pending (Requester, Manager, Owner)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { lot_batch_no, remarks, items } = req.body;
  const db = readData();

  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });

  const existing = db.requests[reqIndex];

  if (existing.status !== 'pending') {
    return res.status(400).json({ error: 'Cannot edit request once it has been approved or processed' });
  }

  // Only owner, manager, or the original requester can edit
  if (!['owner', 'warehouse_manager'].includes(req.user.role) && existing.requester_id !== req.user.id) {
    return res.status(403).json({ error: 'Permission denied to edit this request' });
  }

  if (lot_batch_no) existing.lot_batch_no = lot_batch_no.trim();
  if (remarks !== undefined) existing.remarks = remarks;
  if (items && Array.isArray(items)) {
    existing.items = items.map(i => ({
      accessory_id: i.accessory_id,
      requested_qty: Number(i.requested_qty) || 0,
      approved_qty: Number(i.requested_qty) || 0,
      extra_qty: 0
    }));
  }

  db.requests[reqIndex] = existing;
  writeData(db);
  res.json(existing);
});

// POST approve request & update approved/extra quantities (Warehouse Manager & Owner)
router.post('/:id/approve', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const { approved_items, extra_qty_notes, manager_notes } = req.body;

  const db = readData();
  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });

  const existing = db.requests[reqIndex];
  existing.status = 'approved';
  existing.approved_at = new Date().toISOString();
  if (extra_qty_notes) existing.extra_qty_notes = extra_qty_notes;
  if (manager_notes) existing.manager_notes = manager_notes;

  // Update item approved quantities and extra quantities
  if (approved_items && Array.isArray(approved_items)) {
    existing.items = existing.items.map(item => {
      const match = approved_items.find(ai => ai.accessory_id === item.accessory_id);
      if (match) {
        return {
          ...item,
          approved_qty: Number(match.approved_qty) || item.requested_qty,
          extra_qty: Number(match.extra_qty) || 0
        };
      }
      return item;
    });
  }

  db.requests[reqIndex] = existing;
  writeData(db);
  res.json({ message: 'Request approved successfully', request: existing });
});

// POST mark "Ready for Pickup" (Picker, Manager, Owner)
router.post('/:id/ready', authenticateToken, requireRole(['owner', 'warehouse_manager', 'accessory_picker']), (req, res) => {
  const { id } = req.params;
  const db = readData();
  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });

  const existing = db.requests[reqIndex];
  if (existing.status !== 'approved') {
    return res.status(400).json({ error: 'Request must be approved before marking ready for pickup' });
  }

  existing.status = 'ready';
  existing.ready_at = new Date().toISOString();

  db.requests[reqIndex] = existing;
  writeData(db);
  res.json({ message: 'Marked as Ready for Pickup', request: existing });
});

// POST mark "Picked Up" & Deduct Inventory Stock (Picker, Manager, Owner)
router.post('/:id/picked', authenticateToken, requireRole(['owner', 'warehouse_manager', 'accessory_picker']), (req, res) => {
  const { id } = req.params;
  const db = readData();
  const reqIndex = db.requests.findIndex(r => r.id === id);
  if (reqIndex === -1) return res.status(404).json({ error: 'Request not found' });

  const existing = db.requests[reqIndex];
  if (['picked_up', 'rejected'].includes(existing.status)) {
    return res.status(400).json({ error: `Request is already in ${existing.status} status` });
  }

  existing.status = 'picked_up';
  existing.picked_at = new Date().toISOString();

  // Deduct quantities from warehouse stock
  (existing.items || []).forEach(item => {
    const accIndex = db.accessories.findIndex(a => a.id === item.accessory_id);
    if (accIndex !== -1) {
      const issuedQty = item.approved_qty || item.requested_qty;
      db.accessories[accIndex].quantity = Math.max(0, db.accessories[accIndex].quantity - issuedQty);
    }
  });

  db.requests[reqIndex] = existing;
  writeData(db);
  res.json({ message: 'Accessories marked as Picked Up and inventory updated!', request: existing });
});

module.exports = router;
