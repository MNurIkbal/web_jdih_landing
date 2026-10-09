const pool = require("../config/database");

const getOne = async () => {
  const query = `
    SELECT
      id,
      struktur_organisasi,
      tentang,
      sejarah,
      dasar_hukum,
      jdih_perwakilan,
      alamat,
      no_hp,
      email
    FROM pengaturan
    ORDER BY id ASC
    LIMIT 1
  `;

  const { rows } = await pool.query(query);

  return rows[0] || null;
};

const update = async (id, data) => {
  const query = `
    UPDATE pengaturan
    SET
      struktur_organisasi = $1,
      tentang = $2,
      sejarah = $3,
      dasar_hukum = $4,
      jdih_perwakilan = $5,
      alamat = $6,
      no_hp = $7,
      email = $8
    WHERE id = $9
    RETURNING
      id,
      struktur_organisasi,
      tentang,
      sejarah,
      dasar_hukum,
      jdih_perwakilan,
      alamat,
      no_hp,
      email
  `;

  const values = [
    data.struktur_organisasi,
    data.tentang,
    data.sejarah,
    data.dasar_hukum,
    data.jdih_perwakilan,
    data.alamat,
    data.no_hp,
    data.email,
    id,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0] || null;
};

const getDokumenSummary = async () => {
  const query = ` SELECT COUNT(*)::int AS total, COUNT(*) FILTER ( WHERE TRIM(kategori) = 'Keputusan' )::int AS Keputusan, COUNT(*) FILTER ( WHERE TRIM(kategori) = 'Peraturan' )::int AS Peraturan, COUNT(*) FILTER ( WHERE TRIM(kategori) = 'Perundang-Undangan' )::int AS Perundang_Undangan FROM dokumen_hukum WHERE deleted_at IS NULL `;
  const result = await pool.query(query);
  return result.rows[0];
};

const getBeritaSummary = async () => {
  const query = ` SELECT COUNT(*)::int AS total FROM berita `;
  const result = await pool.query(query);
  return result.rows[0];
};

const getSummary = async () => {
  const [dokumen, berita] = await Promise.all([
    getDokumenSummary(),
    getBeritaSummary(),
  ]);
  return { dokumen, berita };
};

const getDokumenSummaryKategori = async () => {
  const query = `
    SELECT
      tahun,
      COUNT(*)::int AS total
    FROM dokumen_hukum
    WHERE deleted_at IS NULL
      AND tahun IS NOT NULL
    GROUP BY tahun
    ORDER BY tahun ASC
  `;

  const result = await pool.query(query);

  return result.rows;
};
module.exports = {
  getOne,
  update,
  getDokumenSummary,
  getBeritaSummary,
  getSummary,
  getDokumenSummaryKategori
};
