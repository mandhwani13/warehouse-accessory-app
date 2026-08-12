const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readData, writeData } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Multer storage configuration for accessory images
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `acc_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// POST upload image
router.post('/upload', authenticateToken, requireRole(['owner', 'warehouse_manager']), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// GET all brands
router.get('/brands', authenticateToken, (req, res) => {
  const db = readData();
  res.json(db.brands);
});

// POST add brand (Owner & Manager)
router.post('/brands', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ error: 'Brand name is required' });

  const db = readData();
  const newBrand = {
    id: 'b_' + Date.now(),
    name: name.trim(),
    code: (code || name.substring(0, 3)).toUpperCase()
  };
  db.brands.push(newBrand);
  writeData(db);
  res.status(201).json(newBrand);
});

// PUT update brand (Owner & Manager)
router.put('/brands/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  const db = readData();
  const idx = db.brands.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Brand not found' });

  if (name) db.brands[idx].name = name.trim();
  if (code) db.brands[idx].code = code.trim().toUpperCase();

  writeData(db);
  res.json(db.brands[idx]);
});

// DELETE brand (Owner & Manager)
router.delete('/brands/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const db = readData();
  const idx = db.brands.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Brand not found' });

  const deleted = db.brands.splice(idx, 1)[0];
  writeData(db);
  res.json({ message: 'Brand deleted successfully', brand: deleted });
});

// GET categories
router.get('/categories', authenticateToken, (req, res) => {
  const db = readData();
  res.json(db.categories);
});

// POST category
router.post('/categories', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { name, target_unit, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const db = readData();
  const newCat = {
    id: 'c_' + Date.now(),
    name: name.trim(),
    target_unit: target_unit || 'all',
    description: description || ''
  };
  db.categories.push(newCat);
  writeData(db);
  res.status(201).json(newCat);
});

// PUT update category (Owner & Manager)
router.put('/categories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const { name, target_unit, description } = req.body;
  const db = readData();
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });

  if (name) db.categories[idx].name = name.trim();
  if (target_unit) db.categories[idx].target_unit = target_unit;
  if (description !== undefined) db.categories[idx].description = description.trim();

  writeData(db);
  res.json(db.categories[idx]);
});

// DELETE category (Owner & Manager)
router.delete('/categories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const db = readData();
  const idx = db.categories.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Category not found' });

  const deleted = db.categories.splice(idx, 1)[0];
  writeData(db);
  res.json({ message: 'Category deleted successfully', category: deleted });
});

// GET all accessories (Role aware)
router.get('/accessories', authenticateToken, (req, res) => {
  const db = readData();
  const userRole = req.user.role;

  let items = db.accessories.map(acc => {
    const brand = db.brands.find(b => b.id === acc.brand_id) || { name: 'Unknown' };
    const category = db.categories.find(c => c.id === acc.category_id) || { name: 'Uncategorized', target_unit: 'all' };
    return {
      ...acc,
      brand_name: brand.name,
      brand_code: brand.code,
      category_name: category.name,
      category_target_unit: category.target_unit
    };
  });

  // Role filtering for Job Work units
  if (userRole === 'job_work_stitching') {
    items = items.filter(i => i.category_target_unit === 'job_work_stitching' || i.category_target_unit === 'all');
  } else if (userRole === 'job_work_finishing') {
    items = items.filter(i => i.category_target_unit === 'job_work_finishing' || i.category_target_unit === 'all');
  }

  // Hide unit cost for job work & picker users
  if (!['owner', 'warehouse_manager'].includes(userRole)) {
    items = items.map(({ unit_cost, ...rest }) => rest);
  }

  res.json(items);
});

// POST add batch of multi-variation accessory items (Owner & Manager)
router.post('/accessories/batch', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Array of accessory items is required' });
  }

  const db = readData();
  const createdItems = [];

  for (const item of items) {
    const { brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url } = item;
    if (!brand_id || !category_id || !style_code || quantity === undefined) continue;

    const newAcc = {
      id: 'a_' + Date.now() + '_' + Math.round(Math.random() * 1000),
      brand_id,
      category_id,
      style_code: style_code.trim(),
      color: (color || 'Standard').trim(),
      size: (size || 'N/A').trim(),
      quantity: Number(quantity) || 0,
      unit_cost: Number(unit_cost) || 0.0,
      image_url: image_url || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80',
      created_at: new Date().toISOString()
    };
    db.accessories.push(newAcc);
    createdItems.push(newAcc);
  }

  writeData(db);
  res.status(201).json({ message: `Successfully added ${createdItems.length} variation items`, items: createdItems });
});

// POST add accessory stock (Owner & Manager)
router.post('/accessories', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url } = req.body;

  if (!brand_id || !category_id || !style_code || quantity === undefined) {
    return res.status(400).json({ error: 'Brand, category, style code, and quantity are required' });
  }

  const db = readData();
  const newAcc = {
    id: 'a_' + Date.now(),
    brand_id,
    category_id,
    style_code: style_code.trim(),
    color: (color || 'Standard').trim(),
    size: (size || 'N/A').trim(),
    quantity: Number(quantity) || 0,
    unit_cost: Number(unit_cost) || 0.0,
    image_url: image_url || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80',
    created_at: new Date().toISOString()
  };

  db.accessories.push(newAcc);
  writeData(db);
  res.status(201).json(newAcc);
});

// PUT update accessory stock quantity / rate (Owner & Manager)
router.put('/accessories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), (req, res) => {
  const { id } = req.params;
  const { quantity, unit_cost, style_code, color, size, image_url } = req.body;

  const db = readData();
  const accIndex = db.accessories.findIndex(a => a.id === id);

  if (accIndex === -1) {
    return res.status(404).json({ error: 'Accessory not found' });
  }

  const existing = db.accessories[accIndex];
  if (quantity !== undefined) existing.quantity = Number(quantity);
  if (unit_cost !== undefined) existing.unit_cost = Number(unit_cost);
  if (style_code !== undefined) existing.style_code = style_code.trim();
  if (color !== undefined) existing.color = color.trim();
  if (size !== undefined) existing.size = size.trim();
  if (image_url !== undefined) existing.image_url = image_url;

  db.accessories[accIndex] = existing;
  writeData(db);
  res.json(existing);
});

module.exports = router;
