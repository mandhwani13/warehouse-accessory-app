const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAccessories,
  addAccessory,
  addAccessoryBatch,
  updateAccessory
} = require('../db');
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
router.get('/brands', authenticateToken, async (req, res) => {
  try {
    const brands = await getBrands();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add brand
router.post('/brands', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ error: 'Brand name is required' });

  try {
    const newBrand = await addBrand(name, code);
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update brand
router.put('/brands/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  try {
    const updated = await updateBrand(id, name, code);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE brand
router.delete('/brands/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { id } = req.params;
  try {
    await deleteBrand(id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST category
router.post('/categories', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { name, target_unit, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const newCat = await addCategory(name, target_unit, description);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update category
router.put('/categories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { id } = req.params;
  const { name, target_unit, description } = req.body;
  try {
    const updated = await updateCategory(id, name, target_unit, description);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category
router.delete('/categories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCategory(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all accessories (Role aware)
router.get('/accessories', authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    let items = await getAccessories();

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add batch of multi-variation accessory items
router.post('/accessories/batch', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Array of accessory items is required' });
  }

  try {
    const created = await addAccessoryBatch(items);
    res.status(201).json({ message: `Successfully added ${created.length} variation items`, items: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add single accessory stock
router.post('/accessories', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url } = req.body;

  if (!brand_id || !category_id || !style_code || quantity === undefined) {
    return res.status(400).json({ error: 'Brand, category, style code, and quantity are required' });
  }

  try {
    const newAcc = await addAccessory({ brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url });
    res.status(201).json(newAcc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update accessory stock quantity / rate
router.put('/accessories/:id', authenticateToken, requireRole(['owner', 'warehouse_manager']), async (req, res) => {
  const { id } = req.params;
  const { quantity, unit_cost, style_code, color, size, image_url } = req.body;

  try {
    await updateAccessory(id, { quantity, unit_cost, style_code, color, size, image_url });
    res.json({ message: 'Accessory updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
