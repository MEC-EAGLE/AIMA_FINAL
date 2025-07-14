const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'db.json');
const DEFAULT = { users: [], posts: [], groups: [], messages: [] };
fs.writeFileSync(FILE, JSON.stringify(DEFAULT, null, 2));
console.log('Database cleared');
