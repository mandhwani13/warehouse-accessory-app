const express = require('express');
const { readData } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET total financial monetary valuation (OWNER ONLY)
router.get('/valuation', authenticateToken, requireRole(['owner']), (req, res) => {
  const db = readData();

  let totalMonetaryValuation = 0;
  let totalQuantity = 0;

  const brandBreakdown = {};
  const categoryBreakdown = {};

  db.accessories.forEach(acc => {
    const qty = Number(acc.quantity) || 0;
    const cost = Number(acc.unit_cost) || 0;
    const itemValue = qty * cost;

    totalQuantity += qty;
    totalMonetaryValuation += itemValue;

    const brand = db.brands.find(b => b.id === acc.brand_id) || { name: 'Unknown Brand' };
    const category = db.categories.find(c => c.id === acc.category_id) || { name: 'Uncategorized' };

    brandBreakdown[brand.name] = (brandBreakdown[brand.name] || 0) + itemValue;
    categoryBreakdown[category.name] = (categoryBreakdown[category.name] || 0) + itemValue;
  });

  res.json({
    total_monetary_valuation: Number(totalMonetaryValuation.toFixed(2)),
    total_quantity: totalQuantity,
    total_items_count: db.accessories.length,
    brand_breakdown: brandBreakdown,
    category_breakdown: categoryBreakdown
  });
});

// GET general summary stats (Owner & Manager)
router.get('/summary', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const db = readData();

  const totalQuantity = db.accessories.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
  const pendingRequests = db.requests.filter(r => r.status === 'pending').length;
  const approvedRequests = db.requests.filter(r => r.status === 'approved').length;
  const readyRequests = db.requests.filter(r => r.status === 'ready').length;
  const completedRequests = db.requests.filter(r => r.status === 'picked_up').length;

  res.json({
    total_stock_items: db.accessories.length,
    total_stock_quantity: totalQuantity,
    brands_count: db.brands.length,
    pending_requests: pendingRequests,
    approved_requests: approvedRequests,
    ready_requests: readyRequests,
    completed_requests: completedRequests
  });
});

module.exports = router;
