const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_FILE = path.join(__dirname, 'data.json');
const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;

const defaultData = {
  users: [
    { id: 'u1', username: 'owner', name: 'Master Owner', role: 'owner', password: 'password123' },
    { id: 'u2', username: 'manager', name: 'Warehouse Manager', role: 'warehouse_manager', password: 'password123' },
    { id: 'u3', username: 'picker', name: 'Accessory Picker', role: 'accessory_picker', password: 'password123' },
    { id: 'u4', username: 'stitching', name: 'Stitching Unit Lead', role: 'job_work_stitching', password: 'password123' },
    { id: 'u5', username: 'finishing', name: 'Finishing Unit Lead', role: 'job_work_finishing', password: 'password123' }
  ],
  brands: [
    { id: 'b1', name: 'Kaypee Denim', code: 'KPD' }
  ],
  categories: [
    { id: 'c1', name: 'Size Label', target_unit: 'job_work_stitching', description: 'Woven size tags (28-50)' },
    { id: 'c2', name: 'Rivet', target_unit: 'job_work_stitching', description: 'Pocket rivets' },
    { id: 'c3', name: 'Jeans Button', target_unit: 'all', description: 'Shank buttons' },
    { id: 'c4', name: 'Sewing Thread', target_unit: 'job_work_stitching', description: 'Poly thread' },
    { id: 'c5', name: 'Hang Tag', target_unit: 'job_work_finishing', description: 'Brand price tag' },
    { id: 'c6', name: 'Polybag', target_unit: 'job_work_finishing', description: 'Packing polybag' },
    { id: 'c7', name: 'Wash Care Label', target_unit: 'job_work_finishing', description: 'Wash instructions label' }
  ],
  accessories: [],
  requests: []
};

function readDataLocal() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDataLocal(defaultData);
      return defaultData;
    }
    const dataStr = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(dataStr);
  } catch (err) {
    console.error('Error reading local DB file:', err);
    return defaultData;
  }
}

function writeDataLocal(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local DB file:', err);
  }
}

if (DATABASE_URL) {
  console.log('Connecting to PostgreSQL database on Render...');
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  initPgSchema();
}

async function initPgSchema() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log('Initializing PostgreSQL database schema...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS brands (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        target_unit VARCHAR(50) NOT NULL DEFAULT 'all',
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS accessories (
        id VARCHAR(50) PRIMARY KEY,
        brand_id VARCHAR(50) NOT NULL,
        category_id VARCHAR(50) NOT NULL,
        style_code VARCHAR(100) NOT NULL,
        color VARCHAR(100) NOT NULL,
        size VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS requests (
        id VARCHAR(50) PRIMARY KEY,
        req_no VARCHAR(50) NOT NULL,
        requester_id VARCHAR(50) NOT NULL,
        requester_name VARCHAR(100) NOT NULL,
        unit_type VARCHAR(50) NOT NULL,
        lot_batch_no VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        remarks TEXT,
        extra_qty_notes TEXT,
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP WITH TIME ZONE,
        ready_at TIMESTAMP WITH TIME ZONE,
        picked_at TIMESTAMP WITH TIME ZONE
      );
    `);

    // Seed default users if empty
    const userRes = await client.query('SELECT count(*) FROM users');
    if (parseInt(userRes.rows[0].count, 10) === 0) {
      for (const u of defaultData.users) {
        await client.query(
          'INSERT INTO users (id, username, name, role, password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [u.id, u.username, u.name, u.role, u.password]
        );
      }
    }

    // Seed default brand if empty
    const brandRes = await client.query('SELECT count(*) FROM brands');
    if (parseInt(brandRes.rows[0].count, 10) === 0) {
      for (const b of defaultData.brands) {
        await client.query(
          'INSERT INTO brands (id, name, code) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [b.id, b.name, b.code]
        );
      }
    }

    // Seed default categories if empty
    const catRes = await client.query('SELECT count(*) FROM categories');
    if (parseInt(catRes.rows[0].count, 10) === 0) {
      for (const c of defaultData.categories) {
        await client.query(
          'INSERT INTO categories (id, name, target_unit, description) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [c.id, c.name, c.target_unit, c.description]
        );
      }
    }

    client.release();
    console.log('PostgreSQL Database schema initialized successfully!');
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err);
  }
}

// ASYNC DATABASE ACCESSORS
async function getBrands() {
  if (pool) {
    const res = await pool.query('SELECT * FROM brands ORDER BY name');
    return res.rows;
  }
  return readDataLocal().brands;
}

async function addBrand(name, code) {
  const newB = { id: 'b_' + Date.now(), name: name.trim(), code: (code || name.substring(0, 3)).toUpperCase() };
  if (pool) {
    await pool.query('INSERT INTO brands (id, name, code) VALUES ($1, $2, $3)', [newB.id, newB.name, newB.code]);
  }
  const local = readDataLocal();
  local.brands.push(newB);
  writeDataLocal(local);
  return newB;
}

async function updateBrand(id, name, code) {
  if (pool) {
    await pool.query('UPDATE brands SET name=$1, code=$2 WHERE id=$3', [name.trim(), code.trim().toUpperCase(), id]);
  }
  const local = readDataLocal();
  const idx = local.brands.findIndex(b => b.id === id);
  if (idx !== -1) {
    local.brands[idx].name = name.trim();
    local.brands[idx].code = code.trim().toUpperCase();
    writeDataLocal(local);
  }
  return { id, name: name.trim(), code: code.trim().toUpperCase() };
}

async function deleteBrand(id) {
  if (pool) {
    await pool.query('DELETE FROM brands WHERE id = $1', [id]);
  }
  const local = readDataLocal();
  local.brands = local.brands.filter(b => b.id !== id);
  writeDataLocal(local);
}

async function getCategories() {
  if (pool) {
    const res = await pool.query('SELECT * FROM categories ORDER BY name');
    return res.rows;
  }
  return readDataLocal().categories;
}

async function addCategory(name, target_unit, description) {
  const newC = { id: 'c_' + Date.now(), name: name.trim(), target_unit: target_unit || 'all', description: description || '' };
  if (pool) {
    await pool.query('INSERT INTO categories (id, name, target_unit, description) VALUES ($1, $2, $3, $4)', [newC.id, newC.name, newC.target_unit, newC.description]);
  }
  const local = readDataLocal();
  local.categories.push(newC);
  writeDataLocal(local);
  return newC;
}

async function updateCategory(id, name, target_unit, description) {
  if (pool) {
    await pool.query('UPDATE categories SET name=$1, target_unit=$2, description=$3 WHERE id=$4', [name.trim(), target_unit, description || '', id]);
  }
  const local = readDataLocal();
  const idx = local.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    local.categories[idx] = { id, name: name.trim(), target_unit, description: description || '' };
    writeDataLocal(local);
  }
  return { id, name: name.trim(), target_unit, description: description || '' };
}

async function deleteCategory(id) {
  if (pool) {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  }
  const local = readDataLocal();
  local.categories = local.categories.filter(c => c.id !== id);
  writeDataLocal(local);
}

async function getAccessories() {
  if (pool) {
    const res = await pool.query(`
      SELECT a.*, b.name as brand_name, b.code as brand_code, c.name as category_name, c.target_unit as category_target_unit
      FROM accessories a
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);
    return res.rows.map(a => ({ ...a, quantity: Number(a.quantity), unit_cost: Number(a.unit_cost) }));
  }
  const local = readDataLocal();
  return local.accessories.map(acc => {
    const brand = local.brands.find(b => b.id === acc.brand_id) || { name: 'Unknown', code: 'UNK' };
    const category = local.categories.find(c => c.id === acc.category_id) || { name: 'Uncategorized', target_unit: 'all' };
    return {
      ...acc,
      brand_name: brand.name,
      brand_code: brand.code,
      category_name: category.name,
      category_target_unit: category.target_unit
    };
  });
}

async function addAccessory(acc) {
  const newAcc = {
    id: acc.id || ('a_' + Date.now() + '_' + Math.round(Math.random() * 1000)),
    brand_id: acc.brand_id,
    category_id: acc.category_id,
    style_code: acc.style_code.trim(),
    color: (acc.color || 'Standard').trim(),
    size: (acc.size || 'N/A').trim(),
    quantity: Number(acc.quantity) || 0,
    unit_cost: Number(acc.unit_cost) || 0.0,
    image_url: acc.image_url || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80',
    created_at: new Date().toISOString()
  };

  if (pool) {
    await pool.query(
      `INSERT INTO accessories (id, brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [newAcc.id, newAcc.brand_id, newAcc.category_id, newAcc.style_code, newAcc.color, newAcc.size, newAcc.quantity, newAcc.unit_cost, newAcc.image_url, newAcc.created_at]
    );
  }
  const local = readDataLocal();
  local.accessories.push(newAcc);
  writeDataLocal(local);
  return newAcc;
}

async function addAccessoryBatch(items) {
  const created = [];
  for (const item of items) {
    const acc = await addAccessory(item);
    created.push(acc);
  }
  return created;
}

async function updateAccessory(id, updates) {
  if (pool) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.quantity !== undefined) { fields.push(`quantity = $${idx++}`); values.push(Number(updates.quantity)); }
    if (updates.unit_cost !== undefined) { fields.push(`unit_cost = $${idx++}`); values.push(Number(updates.unit_cost)); }
    if (updates.style_code) { fields.push(`style_code = $${idx++}`); values.push(updates.style_code.trim()); }
    if (updates.color) { fields.push(`color = $${idx++}`); values.push(updates.color.trim()); }
    if (updates.size) { fields.push(`size = $${idx++}`); values.push(updates.size.trim()); }
    if (updates.image_url) { fields.push(`image_url = $${idx++}`); values.push(updates.image_url); }

    if (fields.length > 0) {
      values.push(id);
      await pool.query(`UPDATE accessories SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }
  }

  const local = readDataLocal();
  const accIndex = local.accessories.findIndex(a => a.id === id);
  if (accIndex !== -1) {
    if (updates.quantity !== undefined) local.accessories[accIndex].quantity = Number(updates.quantity);
    if (updates.unit_cost !== undefined) local.accessories[accIndex].unit_cost = Number(updates.unit_cost);
    if (updates.style_code) local.accessories[accIndex].style_code = updates.style_code.trim();
    if (updates.color) local.accessories[accIndex].color = updates.color.trim();
    if (updates.size) local.accessories[accIndex].size = updates.size.trim();
    if (updates.image_url) local.accessories[accIndex].image_url = updates.image_url;
    writeDataLocal(local);
  }
}

// Synchronous fallbacks for legacy readers
function readData() {
  return readDataLocal();
}
function writeData(data) {
  writeDataLocal(data);
}

module.exports = {
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
  updateAccessory,
  readData,
  writeData,
  pool
};
