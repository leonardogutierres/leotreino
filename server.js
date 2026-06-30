require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Serve built React app + static pages
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
// SPA fallback: serve index.html for unmatched routes (except /api)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Auto-create tables
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS remedios_log (
      id SERIAL PRIMARY KEY,
      med_key TEXT NOT NULL,
      checked BOOLEAN NOT NULL DEFAULT false,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(med_key, date)
    );

    CREATE TABLE IF NOT EXISTS treino_historico (
      id SERIAL PRIMARY KEY,
      dia TEXT NOT NULL,
      data DATE NOT NULL DEFAULT CURRENT_DATE,
      duracao_min INTEGER,
      volume_total INTEGER,
      exercicios INTEGER,
      series INTEGER
    );

    CREATE TABLE IF NOT EXISTS pesos (
      id SERIAL PRIMARY KEY,
      dia TEXT NOT NULL,
      exercicio_index INTEGER NOT NULL,
      serie_index INTEGER NOT NULL,
      peso NUMERIC(5,2),
      reps INTEGER,
      data DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(dia, exercicio_index, serie_index, data)
    );

    CREATE TABLE IF NOT EXISTS timer_config (
      id SERIAL PRIMARY KEY,
      user_id TEXT DEFAULT 'default',
      duration_sec INTEGER DEFAULT 120,
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS pr_max (
      id SERIAL PRIMARY KEY,
      dia TEXT NOT NULL,
      exercicio_index INTEGER NOT NULL,
      peso NUMERIC(5,2) NOT NULL,
      data DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE(dia, exercicio_index)
    );
  `);
  console.log('✅ Tables created/verified');
}

// ── Remédios ──
app.get('/api/remedios', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    'SELECT med_key, checked, date FROM remedios_log WHERE date = $1',
    [date]
  );
  res.json(rows);
});

app.post('/api/remedios', async (req, res) => {
  const { med_key, checked, date } = req.body;
  const d = date || new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    `INSERT INTO remedios_log (med_key, checked, date)
     VALUES ($1, $2, $3)
     ON CONFLICT (med_key, date)
     DO UPDATE SET checked = $2
     RETURNING *`,
    [med_key, checked, d]
  );
  res.json(rows[0]);
});

app.post('/api/remedios/bulk', async (req, res) => {
  const { items, date } = req.body;
  const d = date || new Date().toISOString().split('T')[0];
  for (const { med_key, checked } of items) {
    await pool.query(
      `INSERT INTO remedios_log (med_key, checked, date)
       VALUES ($1, $2, $3)
       ON CONFLICT (med_key, date)
       DO UPDATE SET checked = $2`,
      [med_key, checked, d]
    );
  }
  res.json({ ok: true });
});

// ── Treino Histórico ──
app.get('/api/treinos/historico', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM treino_historico ORDER BY data DESC LIMIT 50'
  );
  res.json(rows);
});

app.post('/api/treinos/historico', async (req, res) => {
  const { dia, data, duracao_min, volume_total, exercicios, series } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO treino_historico (dia, data, duracao_min, volume_total, exercicios, series)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [dia, data || new Date().toISOString().split('T')[0], duracao_min, volume_total, exercicios, series]
  );
  res.json(rows[0]);
});

// ── Pesos ──
app.get('/api/pesos', async (req, res) => {
  const { dia, exercicio_index, serie_index, data } = req.query;
  const params = [];
  const where = [];

  if (dia) { params.push(dia); where.push(`dia = $${params.length}`); }
  if (exercicio_index) { params.push(exercicio_index); where.push(`exercicio_index = $${params.length}`); }
  if (serie_index) { params.push(serie_index); where.push(`serie_index = $${params.length}`); }
  if (data) { params.push(data); where.push(`data = $${params.length}`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const sql = data
    ? `SELECT * FROM pesos ${whereSql} ORDER BY data DESC, id DESC`
    : `SELECT DISTINCT ON (dia, exercicio_index, serie_index)
         *
       FROM pesos
       ${whereSql}
       ORDER BY dia, exercicio_index, serie_index, data DESC, id DESC`;

  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

app.post('/api/pesos', async (req, res) => {
  const { dia, exercicio_index, serie_index, peso, reps, data } = req.body;
  const d = data || new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    `INSERT INTO pesos (dia, exercicio_index, serie_index, peso, reps, data)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (dia, exercicio_index, serie_index, data)
     DO UPDATE SET peso = $4, reps = $5
     RETURNING *`,
    [dia, exercicio_index, serie_index, peso, reps, d]
  );
  res.json(rows[0]);
});

// ── PR Max ──
app.get('/api/pr', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pr_max ORDER BY dia, exercicio_index');
  res.json(rows);
});

app.post('/api/pr', async (req, res) => {
  const { dia, exercicio_index, peso } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO pr_max (dia, exercicio_index, peso)
     VALUES ($1, $2, $3)
     ON CONFLICT (dia, exercicio_index)
     DO UPDATE SET peso = $3, data = CURRENT_DATE
     RETURNING *`,
    [dia, exercicio_index, peso]
  );
  res.json(rows[0]);
});

// ── Timer Config ──
app.get('/api/timer', async (req, res) => {
  const { rows } = await pool.query("SELECT duration_sec FROM timer_config WHERE user_id = 'default'");
  res.json(rows[0] || { duration_sec: 120 });
});

app.post('/api/timer', async (req, res) => {
  const { duration_sec } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO timer_config (user_id, duration_sec) VALUES ('default', $1)
     ON CONFLICT (user_id) DO UPDATE SET duration_sec = $1
     RETURNING *`,
    [duration_sec]
  );
  res.json(rows[0]);
});

// ── Start ──
const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 LeoTreino API → http://localhost:${PORT}`));
});
