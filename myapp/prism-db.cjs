// Minimal "Prism" style file database used for this demo
const fs = require('fs');
const path = require('path');
// Previous versions of this demo stored the database encrypted on disk which
// occasionally caused corrupted files when the server crashed.  The app does
// not handle such corruption gracefully which resulted in a blank dashboard
// after login.  To keep things simple and more reliable for the demo we now
// store the JSON data directly without encryption.

const FILE = path.join(__dirname, 'db.json');
const DEFAULT = { users: [], posts: [], groups: [], messages: [] };

function read() {
  try {
    const text = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(text || '{}');
  } catch (err) {
    console.error('DB read failed, resetting file', err);
    write({ ...DEFAULT });
    return { ...DEFAULT };
  }
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  get(key) {
    return read()[key] || [];
  },
  set(key, val) {
    const db = read();
    db[key] = val;
    write(db);
  }
};
