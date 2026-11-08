const pool = require('../config/database');

const ensureTable = async () => {
  try {
    // 1. Table Pertanyaan Survey
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_pertanyaan (
        survey_pertanyaan_id SERIAL PRIMARY KEY,
        pertanyaan TEXT NOT NULL,
        status BOOLEAN DEFAULT true,
        urutan INT DEFAULT 0,
        tipe_survey VARCHAR(50) DEFAULT 'layanan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pastikan kolom tipe_survey ada (migrasi backward-compatible)
    await pool.query(`
      ALTER TABLE survey_pertanyaan ADD COLUMN IF NOT EXISTS tipe_survey VARCHAR(50) DEFAULT 'layanan';
    `);

    // 2. Table Jawaban Survey dari Pengguna
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_jawaban (
        survey_jawaban_id SERIAL PRIMARY KEY,
        survey_pertanyaan_id INT REFERENCES survey_pertanyaan(survey_pertanyaan_id) ON DELETE CASCADE,
        jawaban VARCHAR(50) NOT NULL,
        nilai INT NOT NULL,
        dokumen_hukum_id INT,
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE survey_jawaban ADD COLUMN IF NOT EXISTS dokumen_hukum_id INT;
    `);

    // Tambah default pertanyaan layanan jika belum ada
    const checkLayanan = await pool.query("SELECT COUNT(*) AS total FROM survey_pertanyaan WHERE tipe_survey = 'layanan' OR tipe_survey IS NULL");
    if (Number(checkLayanan.rows[0]?.total || 0) === 0) {
      await pool.query(`
        INSERT INTO survey_pertanyaan (pertanyaan, status, urutan, tipe_survey)
        VALUES 
          ('Bagaimana penilaian Anda terhadap kemudahan akses dan kelengkapan informasi hukum pada portal JDIH?', true, 1, 'layanan'),
          ('Bagaimana kualitas dan kecepatan layanan konsultasi / respon yang diberikan?', true, 2, 'layanan')
      `);
    }

    // Tambah default pertanyaan dokumen hukum jika belum ada
    const checkDokumen = await pool.query("SELECT COUNT(*) AS total FROM survey_pertanyaan WHERE tipe_survey = 'dokumen'");
    if (Number(checkDokumen.rows[0]?.total || 0) === 0) {
      await pool.query(`
        INSERT INTO survey_pertanyaan (pertanyaan, status, urutan, tipe_survey)
        VALUES 
          ('Bagaimana kemudahan dan kejelasan struktur naskah dokumen hukum yang diunduh?', true, 1, 'dokumen'),
          ('Sejauh mana dokumen hukum ini memenuhi kebutuhan referensi dan keabsahan hukum Anda?', true, 2, 'dokumen'),
          ('Bagaimana kualitas hasil unduhan file resmi (PDF) dokumen hukum ini?', true, 3, 'dokumen')
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
const getAllPertanyaan = async ({ search = "", tipe = "layanan", page = 0, size = 10 } = {}) => {
  let pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 0) pageNum = 0;
  size = Number(size) || 10;
  if (size < 1) size = 10;
  const offset = pageNum * size;

  const params = [];
  let whereClauses = [];

  if (tipe && tipe !== "all") {
    params.push(tipe);
    whereClauses.push(`(tipe_survey = $${params.length}${tipe === 'layanan' ? ' OR tipe_survey IS NULL' : ''})`);
  }

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

  const [dataRes, countRes] = await Promise.all([
    pool.query(dataQuery, dataParams),
    pool.query(countQuery, params),
  ]);

  const totalElements = Number(countRes.rows[0]?.total || 0);
  const totalPages = Math.ceil(totalElements / size);

  return {
    data: dataRes.rows,
    pagination: {
      page: pageNum,
      size,
      totalElements,
      totalPages,
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

const createPertanyaan = async ({ pertanyaan, status = true, urutan = 0, tipe_survey = "layanan" }) => {
  const cleanPertanyaan = String(pertanyaan || "").trim();
  const statusVal = Boolean(status);
  const urutanVal = Number(urutan) || 0;
  const cleanTipe = String(tipe_survey || "layanan").trim();

  const result = await pool.query(
    `
      INSERT INTO survey_pertanyaan (pertanyaan, status, urutan, tipe_survey)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [cleanPertanyaan, statusVal, urutanVal, cleanTipe]
  );
  return result.rows[0];
};

const updatePertanyaan = async (id, { pertanyaan, status, urutan, tipe_survey }) => {
  const existing = await getPertanyaanById(id);
  if (!existing) return null;

  const newPertanyaan = pertanyaan !== undefined ? String(pertanyaan).trim() : existing.pertanyaan;
  const statusVal = status !== undefined ? Boolean(status) : existing.status;
  const urutanVal = urutan !== undefined ? Number(urutan) : existing.urutan;
  const cleanTipe = tipe_survey !== undefined ? String(tipe_survey).trim() : existing.tipe_survey || "layanan";

  const result = await pool.query(
    `
      UPDATE survey_pertanyaan
      SET pertanyaan = $1, status = $2, urutan = $3, tipe_survey = $4, updated_at = CURRENT_TIMESTAMP
      WHERE survey_pertanyaan_id = $5
      RETURNING *
    `,
    [newPertanyaan, statusVal, urutanVal, cleanTipe, id]
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

// Public: Ambil pertanyaan aktif untuk modal survey berdasarkan tipe (layanan / dokumen)
const getActivePertanyaan = async (tipe = "layanan") => {
  const cleanTipe = String(tipe || "layanan").trim();
  const result = await pool.query(
    `
      SELECT survey_pertanyaan_id, pertanyaan, urutan, tipe_survey
      FROM survey_pertanyaan
      WHERE status = true AND (tipe_survey = $1 OR ($1 = 'layanan' AND tipe_survey IS NULL))
      ORDER BY urutan ASC, survey_pertanyaan_id ASC
    `,
    [cleanTipe]
  );
  return result.rows;
};

// Public: Submit survey jawaban
const submitJawaban = async ({ survey_pertanyaan_id, jawaban, dokumen_hukum_id = null, ip_address = "", user_agent = "" }) => {
  const cleanJawaban = String(jawaban || "").trim();
  const nilai = NILAI_MAP[cleanJawaban] || 3;

  const result = await pool.query(
    `
      INSERT INTO survey_jawaban (survey_pertanyaan_id, jawaban, nilai, dokumen_hukum_id, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [survey_pertanyaan_id, cleanJawaban, nilai, dokumen_hukum_id, ip_address, user_agent]
  );
  return result.rows[0];
};

// Statistik & Grafik Kepuasan Pengguna
const getStatistikGrafik = async (tipe = "layanan") => {
  const cleanTipe = String(tipe || "layanan").trim();

  // 1. Ringkasan Keseluruhan Berdasarkan Opsi Jawaban
  const summaryQuery = `
    SELECT 
      j.jawaban, 
      COUNT(*) AS total
    FROM survey_jawaban j
    JOIN survey_pertanyaan p ON j.survey_pertanyaan_id = p.survey_pertanyaan_id
    WHERE (p.tipe_survey = $1 OR ($1 = 'layanan' AND p.tipe_survey IS NULL))
    GROUP BY j.jawaban
  `;

  // 2. Total Responden & Rata-rata Skor
  const scoreQuery = `
    SELECT 
      COUNT(*) AS total_responden,
      COALESCE(AVG(j.nilai), 0) AS rata_rata_skor
    FROM survey_jawaban j
    JOIN survey_pertanyaan p ON j.survey_pertanyaan_id = p.survey_pertanyaan_id
    WHERE (p.tipe_survey = $1 OR ($1 = 'layanan' AND p.tipe_survey IS NULL))
  `;

  // 3. Rincian per Pertanyaan
  const perPertanyaanQuery = `
    SELECT 
      p.survey_pertanyaan_id,
      p.pertanyaan,
      p.tipe_survey,
      COUNT(j.survey_jawaban_id) AS total_jawaban,
      COALESCE(ROUND(AVG(j.nilai)::numeric, 2), 0) AS rata_rata,
      COUNT(CASE WHEN j.jawaban = 'Sangat Baik' THEN 1 END) AS sangat_baik,
      COUNT(CASE WHEN j.jawaban = 'Baik' THEN 1 END) AS baik,
      COUNT(CASE WHEN j.jawaban = 'Cukup' THEN 1 END) AS cukup,
      COUNT(CASE WHEN j.jawaban = 'Kurang' THEN 1 END) AS kurang,
      COUNT(CASE WHEN j.jawaban = 'Kurang Sekali' THEN 1 END) AS kurang_sekali
    FROM survey_pertanyaan p
    LEFT JOIN survey_jawaban j ON p.survey_pertanyaan_id = j.survey_pertanyaan_id
    WHERE (p.tipe_survey = $1 OR ($1 = 'layanan' AND p.tipe_survey IS NULL))
    GROUP BY p.survey_pertanyaan_id, p.pertanyaan, p.tipe_survey
    ORDER BY p.urutan ASC, p.survey_pertanyaan_id ASC
  `;

  const [summaryRes, scoreRes, perPertanyaanRes] = await Promise.all([
    pool.query(summaryQuery, [cleanTipe]),
    pool.query(scoreQuery, [cleanTipe]),
    pool.query(perPertanyaanQuery, [cleanTipe]),
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
    tipe_survey: cleanTipe,
    totalResponden,
    rataRataSkor: Number(rataRataSkor.toFixed(2)),
    persentaseKepuasan: Number(persentaseKepuasan.toFixed(1)),
    distribusiJawaban: defaultCounts,
    perPertanyaan: perPertanyaanRes.rows.map((row) => ({
      survey_pertanyaan_id: Number(row.survey_pertanyaan_id),
      pertanyaan: row.pertanyaan,
      tipe_survey: row.tipe_survey || "layanan",
      total_jawaban: Number(row.total_jawaban || 0),
      rata_rata: Number(row.rata_rata || 0),
      sangat_baik: Number(row.sangat_baik || 0),
      baik: Number(row.baik || 0),
      cukup: Number(row.cukup || 0),
      kurang: Number(row.kurang || 0),
      kurang_sekali: Number(row.kurang_sekali || 0),
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
