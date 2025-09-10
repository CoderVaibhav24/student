const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: process.env.WEB_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));

app.get('/', (_req, res) => res.json({ ok: true, name: 'student-portal-api' }));

const PORT = process.env.PORT || 5080;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
