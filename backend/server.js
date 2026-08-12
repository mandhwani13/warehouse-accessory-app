const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { readData, writeData } = require('./db');

const PORT = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Simple token helper
function parseAuthToken(req) {
  const authHeader = req.headers['authorization'] || '';
  return authHeader.replace('Bearer ', '').trim();
}

function getUserFromToken(token) {
  const db = readData();
  if (token === 'demo_token') return db.users[0]; // default owner
  const found = db.users.find(u => u.username.toLowerCase() === token.toLowerCase() || u.id === token);
  return found || db.users[0];
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Helper response handlers
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const getBody = (cb) => {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', () => {
      try {
        cb(bodyStr ? JSON.parse(bodyStr) : {});
      } catch (err) {
        cb({});
      }
    });
  };

  // Static file serving for uploads
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      res.writeHead(200);
      return fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      return res.end('File not found');
    }
  }

  // Health check
  if (pathname === '/api/health') {
    return sendJSON(200, { status: 'ok', timestamp: new Date().toISOString() });
  }

  // AUTH ROUTES
  if (pathname === '/api/auth/login' && method === 'POST') {
    return getBody(body => {
      const db = readData();
      const user = db.users.find(
        u => u.username.toLowerCase() === (body.username || '').toLowerCase() && u.password === body.password
      );
      if (!user) return sendJSON(401, { error: 'Invalid username or password' });
      return sendJSON(200, {
        token: user.username,
        user: { id: user.id, username: user.username, name: user.name, role: user.role }
      });
    });
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    const token = parseAuthToken(req);
    const user = getUserFromToken(token);
    return sendJSON(200, { user });
  }

  if (pathname === '/api/auth/users') {
    const token = parseAuthToken(req);
    const currentUser = getUserFromToken(token);
    if (currentUser.role !== 'owner') return sendJSON(403, { error: 'Owner access required' });

    const db = readData();

    if (method === 'GET') {
      return sendJSON(200, db.users.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role })));
    }

    if (method === 'POST') {
      return getBody(body => {
        if (!body.username || !body.password || !body.name || !body.role) {
          return sendJSON(400, { error: 'All fields required' });
        }
        if (db.users.some(u => u.username.toLowerCase() === body.username.toLowerCase())) {
          return sendJSON(400, { error: 'Username exists' });
        }
        const newUser = { id: 'u_' + Date.now(), username: body.username, password: body.password, name: body.name, role: body.role };
        db.users.push(newUser);
        writeData(db);
        return sendJSON(201, { message: 'User created', user: newUser });
      });
    }
  }

  // ACCESSORY & STOCK ROUTES
  if (pathname === '/api/brands') {
    const db = readData();
    if (method === 'GET') return sendJSON(200, db.brands);
    if (method === 'POST') {
      return getBody(body => {
        if (!body.name) return sendJSON(400, { error: 'Brand name required' });
        const newB = { id: 'b_' + Date.now(), name: body.name, code: (body.code || body.name.substring(0, 3)).toUpperCase() };
        db.brands.push(newB);
        writeData(db);
        return sendJSON(201, newB);
      });
    }
  }

  if (pathname === '/api/categories') {
    const db = readData();
    if (method === 'GET') return sendJSON(200, db.categories);
    if (method === 'POST') {
      return getBody(body => {
        if (!body.name) return sendJSON(400, { error: 'Category name required' });
        const newC = { id: 'c_' + Date.now(), name: body.name, target_unit: body.target_unit || 'all', description: body.description || '' };
        db.categories.push(newC);
        writeData(db);
        return sendJSON(201, newC);
      });
    }
  }

  if (pathname === '/api/accessories') {
    const token = parseAuthToken(req);
    const currentUser = getUserFromToken(token);
    const db = readData();

    if (method === 'GET') {
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

      if (currentUser.role === 'job_work_stitching') {
        items = items.filter(i => i.category_target_unit === 'job_work_stitching' || i.category_target_unit === 'all');
      } else if (currentUser.role === 'job_work_finishing') {
        items = items.filter(i => i.category_target_unit === 'job_work_finishing' || i.category_target_unit === 'all');
      }

      if (!['owner', 'warehouse_manager'].includes(currentUser.role)) {
        items = items.map(({ unit_cost, ...rest }) => rest);
      }

      return sendJSON(200, items);
    }

    if (method === 'POST') {
      if (!['owner', 'warehouse_manager'].includes(currentUser.role)) {
        return sendJSON(403, { error: 'Access denied' });
      }
      return getBody(body => {
        const newAcc = {
          id: 'a_' + Date.now(),
          brand_id: body.brand_id,
          category_id: body.category_id,
          style_code: body.style_code,
          color: body.color || 'Standard',
          size: body.size || 'N/A',
          quantity: Number(body.quantity) || 0,
          unit_cost: Number(body.unit_cost) || 0,
          image_url: body.image_url || 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&q=80',
          created_at: new Date().toISOString()
        };
        db.accessories.push(newAcc);
        writeData(db);
        return sendJSON(201, newAcc);
      });
    }
  }

  if (pathname.startsWith('/api/accessories/') && method === 'PUT') {
    const id = pathname.replace('/api/accessories/', '');
    const db = readData();
    const idx = db.accessories.findIndex(a => a.id === id);
    if (idx === -1) return sendJSON(404, { error: 'Not found' });

    return getBody(body => {
      const existing = db.accessories[idx];
      if (body.quantity !== undefined) existing.quantity = Number(body.quantity);
      if (body.unit_cost !== undefined) existing.unit_cost = Number(body.unit_cost);
      if (body.style_code !== undefined) existing.style_code = body.style_code;
      if (body.color !== undefined) existing.color = body.color;
      if (body.size !== undefined) existing.size = body.size;
      if (body.image_url !== undefined) existing.image_url = body.image_url;

      db.accessories[idx] = existing;
      writeData(db);
      return sendJSON(200, existing);
    });
  }

  // REQUISITION REQUEST ROUTES
  if (pathname === '/api/requests') {
    const token = parseAuthToken(req);
    const currentUser = getUserFromToken(token);
    const db = readData();

    if (method === 'GET') {
      let list = db.requests;
      if (['job_work_stitching', 'job_work_finishing'].includes(currentUser.role)) {
        list = list.filter(r => r.requester_id === currentUser.id || r.unit_type === currentUser.role);
      }

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
      populated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return sendJSON(200, populated);
    }

    if (method === 'POST') {
      return getBody(body => {
        if (!body.lot_batch_no) return sendJSON(400, { error: 'Lot/Batch number required' });
        const reqNo = `REQ-${new Date().getFullYear()}-${String(db.requests.length + 1).padStart(3, '0')}`;
        const newReq = {
          id: 'r_' + Date.now(),
          req_no: reqNo,
          requester_id: currentUser.id,
          requester_name: currentUser.name,
          unit_type: currentUser.role,
          lot_batch_no: body.lot_batch_no.trim(),
          status: 'pending',
          remarks: body.remarks || '',
          extra_qty_notes: '',
          items: (body.items || []).map(i => ({
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
        return sendJSON(201, newReq);
      });
    }
  }

  if (pathname.includes('/approve') && method === 'POST') {
    const id = pathname.split('/')[3];
    const db = readData();
    const idx = db.requests.findIndex(r => r.id === id);
    if (idx === -1) return sendJSON(404, { error: 'Request not found' });

    return getBody(body => {
      const existing = db.requests[idx];
      existing.status = 'approved';
      existing.approved_at = new Date().toISOString();
      if (body.extra_qty_notes) existing.extra_qty_notes = body.extra_qty_notes;

      if (body.approved_items && Array.isArray(body.approved_items)) {
        existing.items = existing.items.map(item => {
          const match = body.approved_items.find(ai => ai.accessory_id === item.accessory_id);
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

      db.requests[idx] = existing;
      writeData(db);
      return sendJSON(200, existing);
    });
  }

  if (pathname.includes('/ready') && method === 'POST') {
    const id = pathname.split('/')[3];
    const db = readData();
    const idx = db.requests.findIndex(r => r.id === id);
    if (idx === -1) return sendJSON(404, { error: 'Not found' });

    const existing = db.requests[idx];
    existing.status = 'ready';
    existing.ready_at = new Date().toISOString();
    db.requests[idx] = existing;
    writeData(db);
    return sendJSON(200, existing);
  }

  if (pathname.includes('/picked') && method === 'POST') {
    const id = pathname.split('/')[3];
    const db = readData();
    const idx = db.requests.findIndex(r => r.id === id);
    if (idx === -1) return sendJSON(404, { error: 'Not found' });

    const existing = db.requests[idx];
    existing.status = 'picked_up';
    existing.picked_at = new Date().toISOString();

    (existing.items || []).forEach(item => {
      const accIdx = db.accessories.findIndex(a => a.id === item.accessory_id);
      if (accIdx !== -1) {
        const issuedQty = item.approved_qty || item.requested_qty;
        db.accessories[accIdx].quantity = Math.max(0, db.accessories[accIdx].quantity - issuedQty);
      }
    });

    db.requests[idx] = existing;
    writeData(db);
    return sendJSON(200, existing);
  }

  // FINANCIAL REPORTING (OWNER ONLY)
  if (pathname === '/api/reports/valuation' && method === 'GET') {
    const token = parseAuthToken(req);
    const currentUser = getUserFromToken(token);
    if (currentUser.role !== 'owner') {
      return sendJSON(403, { error: 'Financial valuation report is restricted to Owner' });
    }

    const db = readData();
    let totalValuation = 0;
    let totalQty = 0;
    const brandBreakdown = {};
    const categoryBreakdown = {};

    db.accessories.forEach(acc => {
      const qty = Number(acc.quantity) || 0;
      const cost = Number(acc.unit_cost) || 0;
      const itemVal = qty * cost;
      totalQty += qty;
      totalValuation += itemVal;

      const brand = db.brands.find(b => b.id === acc.brand_id) || { name: 'Unknown Brand' };
      const category = db.categories.find(c => c.id === acc.category_id) || { name: 'Uncategorized' };

      brandBreakdown[brand.name] = (brandBreakdown[brand.name] || 0) + itemVal;
      categoryBreakdown[category.name] = (categoryBreakdown[category.name] || 0) + itemVal;
    });

    return sendJSON(200, {
      total_monetary_valuation: Number(totalValuation.toFixed(2)),
      total_quantity: totalQty,
      brand_breakdown: brandBreakdown,
      category_breakdown: categoryBreakdown
    });
  }

  // Serve static frontend dist index fallback for SPA
  const distDir = path.join(__dirname, '..', 'frontend', 'dist');
  let requestedFile = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
    res.writeHead(200);
    return fs.createReadStream(requestedFile).pipe(res);
  } else if (fs.existsSync(path.join(distDir, 'index.html'))) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }

  return sendJSON(404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`===================================================`);
  console.log(`Warehouse Accessory App Server running on http://127.0.0.1:${PORT}`);
  console.log(`===================================================`);
});
