const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

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

function readData() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeData(defaultData);
      return defaultData;
    }
    const dataStr = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(dataStr);
  } catch (err) {
    console.error('Error reading DB file, reinitializing:', err);
    writeData(defaultData);
    return defaultData;
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

module.exports = {
  readData,
  writeData
};
