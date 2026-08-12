const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DB_FILE = path.join(__dirname, 'data.json');
const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;
if (DATABASE_URL) {
  console.log('Connecting to PostgreSQL database on Render...');
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  initPostgresSchema();
}

async function initPostgresSchema() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    console.log('Initializing PostgreSQL database tables...');
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

    // Seed users if empty
    const userRes = await client.query('SELECT count(*) FROM users');
    if (parseInt(userRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial user logins into PostgreSQL...');
      await client.query(`
        INSERT INTO users (id, username, name, role, password) VALUES
        ('u1', 'owner', 'Master Owner', 'owner', 'password123'),
        ('u2', 'manager', 'Warehouse Manager', 'warehouse_manager', 'password123'),
        ('u3', 'picker', 'Accessory Picker', 'accessory_picker', 'password123'),
        ('u4', 'stitching', 'Stitching Unit Lead', 'job_work_stitching', 'password123'),
        ('u5', 'finishing', 'Finishing Unit Lead', 'job_work_finishing', 'password123');
      `);
    }

    client.release();
    console.log('PostgreSQL Database initialization complete!');
    await syncPgToMemory();
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err);
  }
}

let inMemoryDb = null;

async function syncPgToMemory() {
  if (!pool) return;
  try {
    const usersRes = await pool.query('SELECT * FROM users');
    const brandsRes = await pool.query('SELECT * FROM brands');
    const categoriesRes = await pool.query('SELECT * FROM categories');
    const accessoriesRes = await pool.query('SELECT * FROM accessories');
    const requestsRes = await pool.query('SELECT * FROM requests');

    inMemoryDb = {
      users: usersRes.rows,
      brands: brandsRes.rows,
      categories: categoriesRes.rows,
      accessories: accessoriesRes.rows.map(a => ({ ...a, quantity: Number(a.quantity), unit_cost: Number(a.unit_cost) })),
      requests: requestsRes.rows.map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items }))
    };
    writeDataLocal(inMemoryDb);
  } catch (err) {
    console.error('PostgreSQL sync error:', err);
  }
}

const defaultData = {
  users: [
    { id: 'u1', username: 'owner', name: 'Master Owner', role: 'owner', password: 'password123' },
    { id: 'u2', username: 'manager', name: 'Warehouse Manager', role: 'warehouse_manager', password: 'password123' },
    { id: 'u3', username: 'picker', name: 'Accessory Picker', role: 'accessory_picker', password: 'password123' },
    { id: 'u4', username: 'stitching', name: 'Stitching Unit Lead', role: 'job_work_stitching', password: 'password123' },
    { id: 'u5', username: 'finishing', name: 'Finishing Unit Lead', role: 'job_work_finishing', password: 'password123' }
  ],
  brands: [
    { id: 'b1', name: "Kaypee Denim", code: 'KPD' }
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
    console.error('Error reading DB file:', err);
    return defaultData;
  }
}

function writeDataLocal(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

function readData() {
  if (inMemoryDb) return inMemoryDb;
  return readDataLocal();
}

function writeData(data) {
  inMemoryDb = data;
  writeDataLocal(data);

  if (pool) {
    persistDataToPg(data).catch(err => console.error('Error saving to PostgreSQL:', err));
  }
}

async function persistDataToPg(data) {
  if (!pool) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Sync users
    for (const u of data.users || []) {
      await client.query(
        'INSERT INTO users (id, username, name, role, password) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET username=$2, name=$3, role=$4, password=$5',
        [u.id, u.username, u.name, u.role, u.password]
      );
    }

    // Sync brands
    await client.query('DELETE FROM brands');
    for (const b of data.brands || []) {
      await client.query(
        'INSERT INTO brands (id, name, code) VALUES ($1, $2, $3)',
        [b.id, b.name, b.code]
      );
    }

    // Sync categories
    await client.query('DELETE FROM categories');
    for (const c of data.categories || []) {
      await client.query(
        'INSERT INTO categories (id, name, target_unit, description) VALUES ($1, $2, $3, $4)',
        [c.id, c.name, c.target_unit || 'all', c.description || '']
      );
    }

    // Sync accessories
    await client.query('DELETE FROM accessories');
    for (const a of data.accessories || []) {
      await client.query(
        'INSERT INTO accessories (id, brand_id, category_id, style_code, color, size, quantity, unit_cost, image_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [a.id, a.brand_id, a.category_id, a.style_code, a.color, a.size, Number(a.quantity) || 0, Number(a.unit_cost) || 0, a.image_url || '', a.created_at || new Date().toISOString()]
      );
    }

    // Sync requests
    await client.query('DELETE FROM requests');
    for (const r of data.requests || []) {
      await client.query(
        'INSERT INTO requests (id, req_no, requester_id, requester_name, unit_type, lot_batch_no, status, remarks, extra_qty_notes, items, created_at, approved_at, ready_at, picked_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
        [r.id, r.req_no, r.requester_id, r.requester_name, r.unit_type, r.lot_batch_no, r.status, r.remarks || '', r.extra_qty_notes || '', JSON.stringify(r.items || []), r.created_at || new Date().toISOString(), r.approved_at, r.ready_at, r.picked_at]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PostgreSQL transaction rollback:', err);
  } finally {
    client.release();
  }
}

module.exports = {
  readData,
  writeData,
  pool
};
