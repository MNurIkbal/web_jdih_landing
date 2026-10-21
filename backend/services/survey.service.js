const pool = require("../config/database");

const ensureTable = async () => {
  try {
    // 1. Table Pertanyaan Survey
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_pertanyaan (
        survey_pertanyaan_id SERIAL PRIMARY KEY,
        pertanyaan TEXT NOT NULL,
        status BOOLEAN DEFAULT true,
        urutan INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Table Jawaban Survey dari Pengguna
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_jawaban (
        survey_jawaban_id SERIAL PRIMARY KEY,
        survey_pertanyaan_id INT REFERENCES survey_pertanyaan(survey_pertanyaan_id) ON DELETE CASCADE,
        jawaban VARCHAR(50) NOT NULL,
        nilai INT NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tambah default pertanyaan jika belum ada sama sekali
    const check = await pool.query("SELECT COUNT(*) AS total FROM survey_pertanyaan");
    if (Number(check.rows[0]?.total || 0) === 0) {
      await pool.query(`
        INSERT INTO survey_pertanyaan (pertanyaan, status, urutan)
        VALUES 
          ('Bagaimana penilaian Anda terhadap kemudahan akses dan kelengkapan informasi hukum pada portal JDIH?', true, 1),
          ('Bagaimana kualitas dan kecepatan layanan konsultasi / respon yang diberikan?', true, 2)
      `);
    }
  } catch (err) {
    console.error("ensureTable survey error:", err.message);
  }
};

ensureTable();

// Mapping nilai skala kepuasan
const NILAI_MAP = {
  "Sangat Baik": 5,
  "Baik": 4,
  "Cukup": 3,
  "Kurang": 2,
  "Kurang Sekali": 1,
};

// CRUD Pertanyaan (Admin)
const getAllPertanyaan = async ({ search = "", page = 0, size = 10 } = {}) => {
  let pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 0) pageNum = 0;
  size = Number(size) || 10;
  if (size < 1) size = 10;
  const offset = pageNum * size;

  const params = [];
  let whereClauses = [];

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    whereClauses.push(`pertanyaan ILIKE $${params.length}`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const dataParams = [...params, size, offset];

  const dataQuery = `
    SELECT * FROM survey_pertanyaan
    ${whereStr}
    ORDER BY urutan ASC, survey_pertanyaan_id DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const countQuery = `SELECT COUNT(*) AS total FROM survey_pertanyaan ${whereStr}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataParams),
    pool.query(countQuery, params),
  ]);

  const total = Number(countResult.rows[0]?.total || 0);
  const totalPages = total > 0 ? Math.ceil(total / size) : 0;

  return {
    data: dataResult.rows,
    pagination: {
      page: pageNum,
      size,
      total,
      totalElements: total,
      totalPages,
      hasNext: pageNum + 1 < totalPages,
      hasPrevious: pageNum > 0,
    },
  };
};

const getPertanyaanById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM survey_pertanyaan WHERE survey_pertanyaan_id = $1",
    [id]
  );
  return result.rows[0] || null;
};

const createPertanyaan = async ({ pertanyaan, status = true, urutan = 0 }) => {
  const statusVal = status === true || status === "true" || status === 1 || status === "1";
  const result = await pool.query(
    `
      INSERT INTO survey_pertanyaan (pertanyaan, status, urutan)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [pertanyaan ? pertanyaan.trim() : "", statusVal, Number(urutan) || 0]
  );
  return result.rows[0];
};

const updatePertanyaan = async (id, { pertanyaan, status, urutan }) => {
  const old = await getPertanyaanById(id);
  if (!old) return null;

  const newPertanyaan = pertanyaan !== undefined ? pertanyaan.trim() : old.pertanyaan;
  const statusVal = status !== undefined
    ? status === true || status === "true" || status === 1 || status === "1"
    : old.status;
  const urutanVal = urutan !== undefined ? Number(urutan) : old.urutan;

  const result = await pool.query(
    `
      UPDATE survey_pertanyaan
      SET pertanyaan = $1, status = $2, urutan = $3, updated_at = CURRENT_TIMESTAMP
      WHERE survey_pertanyaan_id = $4
      RETURNING *
    `,
    [newPertanyaan, statusVal, urutanVal, id]
  );
  return result.rows[0];
};

const removePertanyaan = async (id) => {
  const result = await pool.query(
    "DELETE FROM survey_pertanyaan WHERE survey_pertanyaan_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
};

// Public: Ambil pertanyaan aktif untuk ditampilkan di modal popup
const getActivePertanyaan = async () => {
  const result = await pool.query(
    `
      SELECT survey_pertanyaan_id, pertanyaan, urutan
      FROM survey_pertanyaan
      WHERE status = true
      ORDER BY urutan ASC, survey_pertanyaan_id ASC
    `
  );
  return result.rows;
};

// Public: Submit survey jawaban
const submitJawaban = async ({ survey_pertanyaan_id, jawaban, ip_address = "", user_agent = "" }) => {
  const cleanJawaban = String(jawaban || "").trim();
  const nilai = NILAI_MAP[cleanJawaban] || 3;

  const result = await pool.query(
    `
      INSERT INTO survey_jawaban (survey_pertanyaan_id, jawaban, nilai, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [survey_pertanyaan_id, cleanJawaban, nilai, ip_address, user_agent]
  );
  return result.rows[0];
};

// Statistik & Grafik Kepuasan Pengguna
const getStatistikGrafik = async () => {
  // 1. Ringkasan Keseluruhan Berdasarkan Opsi Jawaban
  const summaryQuery = `
    SELECT 
      jawaban, 
      COUNT(*) AS total
    FROM survey_jawaban
    GROUP BY jawaban
  `;

  // 2. Total Responden & Rata-rata Skor
  const scoreQuery = `
    SELECT 
      COUNT(*) AS total_responden,
      COALESCE(AVG(nilai), 0) AS rata_rata_skor
    FROM survey_jawaban
  `;

  // 3. Rincian per Pertanyaan
  const perPertanyaanQuery = `
    SELECT 
      p.survey_pertanyaan_id,
      p.pertanyaan,
      COUNT(j.survey_jawaban_id) AS total_jawaban,
      COALESCE(ROUND(AVG(j.nilai)::numeric, 2), 0) AS rata_rata,
      COUNT(CASE WHEN j.jawaban = 'Sangat Baik' THEN 1 END) AS sangat_baik,
      COUNT(CASE WHEN j.jawaban = 'Baik' THEN 1 END) AS baik,
      COUNT(CASE WHEN j.jawaban = 'Cukup' THEN 1 END) AS cukup,
      COUNT(CASE WHEN j.jawaban = 'Kurang' THEN 1 END) AS kurang,
      COUNT(CASE WHEN j.jawaban = 'Kurang Sekali' THEN 1 END) AS kurang_sekali
    FROM survey_pertanyaan p
    LEFT JOIN survey_jawaban j ON p.survey_pertanyaan_id = j.survey_pertanyaan_id
    GROUP BY p.survey_pertanyaan_id, p.pertanyaan
    ORDER BY p.urutan ASC, p.survey_pertanyaan_id ASC
  `;

  const [summaryRes, scoreRes, perPertanyaanRes] = await Promise.all([
    pool.query(summaryQuery),
    pool.query(scoreQuery),
    pool.query(perPertanyaanQuery),
  ]);

  const defaultCounts = {
    "Sangat Baik": 0,
    "Baik": 0,
    "Cukup": 0,
    "Kurang": 0,
    "Kurang Sekali": 0,
  };

  summaryRes.rows.forEach((row) => {
    if (defaultCounts.hasOwnProperty(row.jawaban)) {
      defaultCounts[row.jawaban] = Number(row.total);
    }
  });

  const totalResponden = Number(scoreRes.rows[0]?.total_responden || 0);
  const rataRataSkor = Number(scoreRes.rows[0]?.rata_rata_skor || 0);
  const persentaseKepuasan = totalResponden > 0 ? (rataRataSkor / 5) * 100 : 0;

  return {
    totalResponden,
    rataRataSkor: Number(rataRataSkor.toFixed(2)),
    persentaseKepuasan: Number(persentaseKepuasan.toFixed(1)),
    distribusiJawaban: defaultCounts,
    perPertanyaan: perPertanyaanRes.rows.map((r) => ({
      ...r,
      total_jawaban: Number(r.total_jawaban),
      rata_rata: Number(r.rata_rata),
      sangat_baik: Number(r.sangat_baik),
      baik: Number(r.baik),
      cukup: Number(r.cukup),
      kurang: Number(r.kurang),
      kurang_sekali: Number(r.kurang_sekali),
    })),
  };
};

module.exports = {
  getAllPertanyaan,
  getPertanyaanById,
  createPertanyaan,
  updatePertanyaan,
  removePertanyaan,
  getActivePertanyaan,
  submitJawaban,
  getStatistikGrafik,
};
