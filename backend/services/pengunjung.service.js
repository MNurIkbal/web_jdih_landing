const pool = require("../config/database");

// Batas waktu pengunjung dianggap "online" (menit sejak aktivitas terakhir)
const ONLINE_WINDOW_MINUTES = 5;

const ensureTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pengunjung (
        pengunjung_id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
        hits INT NOT NULL DEFAULT 1,
        last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pengunjung_visitor_tanggal_unique UNIQUE (visitor_id, tanggal)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pengunjung_tanggal ON pengunjung (tanggal);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_pengunjung_last_seen ON pengunjung (last_seen);
    `);
  } catch (err) {
    console.error("ensureTable pengunjung error:", err.message);
  }
};

ensureTable();

/**
 * Catat kunjungan. Satu pengunjung (visitor_id) dihitung sekali per hari,
 * kunjungan berikutnya di hari yang sama hanya memperbarui last_seen & hits.
 */
const track = async ({ visitor_id, ip_address = "", user_agent = "" }) => {
  await pool.query(
    `
      INSERT INTO pengunjung (visitor_id, ip_address, user_agent, tanggal, last_seen)
      VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_TIMESTAMP)
      ON CONFLICT (visitor_id, tanggal)
      DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        hits = pengunjung.hits + 1,
        ip_address = EXCLUDED.ip_address
    `,
    [visitor_id, ip_address, user_agent]
  );
};

const getStatistik = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(DISTINCT visitor_id) FILTER (
        WHERE last_seen >= NOW() - INTERVAL '${ONLINE_WINDOW_MINUTES} minutes'
      ) AS online,

      COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE) AS hari_ini,

      COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE - 1) AS kemarin,

      COUNT(*) FILTER (
        WHERE tanggal >= date_trunc('week', CURRENT_DATE)::date
      ) AS minggu_ini,

      COUNT(*) FILTER (
        WHERE tanggal >= (date_trunc('week', CURRENT_DATE) - INTERVAL '1 week')::date
          AND tanggal <  date_trunc('week', CURRENT_DATE)::date
      ) AS minggu_lalu,

      COUNT(*) FILTER (
        WHERE tanggal >= date_trunc('month', CURRENT_DATE)::date
      ) AS bulan_ini,

      COUNT(*) FILTER (
        WHERE tanggal >= (date_trunc('month', CURRENT_DATE) - INTERVAL '1 month')::date
          AND tanggal <  date_trunc('month', CURRENT_DATE)::date
      ) AS bulan_lalu,

      COUNT(*) AS total
    FROM pengunjung
  `);

  const row = result.rows[0] || {};

  return {
    online: Number(row.online || 0),
    hari_ini: Number(row.hari_ini || 0),
    kemarin: Number(row.kemarin || 0),
    minggu_ini: Number(row.minggu_ini || 0),
    minggu_lalu: Number(row.minggu_lalu || 0),
    bulan_ini: Number(row.bulan_ini || 0),
    bulan_lalu: Number(row.bulan_lalu || 0),
    total: Number(row.total || 0),
  };
};

module.exports = {
  track,
  getStatistik,
};
