const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT NOW() as now');
    console.log('DB Connected! Time:', rows[0].now);
    process.exit();
  } catch (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
})();
