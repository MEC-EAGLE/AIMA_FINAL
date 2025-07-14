const http = require('http');
const prism = require('./prism-db.cjs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const PORT = 3001;


const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const key = url.pathname.slice(1);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }
  if (url.pathname === '/send-otp' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const { email, otp } = data;
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASS;
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        });
        await transporter.sendMail({
          from: user,
          to: email,
          subject: 'Your verification code',
          text: 'Your OTP is ' + otp
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'sent' }));
      } catch (err) {
        console.error('OTP email failed', err);
        res.statusCode = 500;
        res.end('Send failed');
      }
    });
    return;
  }
  if (!['users','posts','groups','messages'].includes(key)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(prism.get(key)));
  }
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || 'null');
        prism.set(key, data);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({status:'ok'}));
      } catch {
        res.statusCode = 400;
        res.end('Bad request');
      }
    });
    return;
  }
  res.statusCode = 405;
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log('Database API running at http://localhost:' + PORT);
});
