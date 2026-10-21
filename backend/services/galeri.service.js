const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

const ensureTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS galeri (
        galeri_id SERIAL PRIMARY KEY,
        judul VARCHAR(255) DEFAULT '',
        keterangan TEXT,
        media_url TEXT,
        status BOOLEAN DEFAULT true,
        tanggal DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pastikan judul bisa nullable / default string jika kolom pernah dibuat NOT NULL
    await pool.query(`
      ALTER TABLE galeri ALTER COLUMN judul DROP NOT NULL;
    `).catch(() => {});
  } catch (err) {
    console.error("ensureTable galeri error:", err.message);
  }
};

ensureTable();

const deleteFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(process.cwd(), "uploads", "galeri", filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Gagal hapus file:", e.message);
    }
  }
};

const getAll = async ({ search = "", page = 0, size = 10 } = {}) => {
  // Support both 0-based (DataTable standard) and 1-based page numbers
  let pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 0) {
    pageNum = 0;
  }
  // Internally calculate offset based on 0-indexed pageNum
  const offset = pageNum * Number(size || 10);

  size = Number(size) || 10;
  if (size < 1) size = 10;
  if (size > 100) size = 100;

  search = String(search || "").trim();
  const params = [];
  let whereClauses = [];

  if (search) {
    params.push(`%${search}%`);
    whereClauses.push(`(keterangan ILIKE $${params.length} OR judul ILIKE $${params.length})`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const dataParams = [...params, size, offset];
  const dataQuery = `
    SELECT * FROM galeri
    ${whereStr}
    ORDER BY galeri_id DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const countQuery = `SELECT COUNT(*) AS total FROM galeri ${whereStr}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataParams),
    pool.query(countQuery, params),
  ]);

  const total = Number(countResult.rows[0]?.total || 0);
  const totalPages = total > 0 ? Math.ceil(total / size) : 0;

  const backendUrl = process.env.APP_BACKEND_URL || "http://localhost:8080";
  const mediaBaseUrl = `${backendUrl.replace(/\/$/, "")}/uploads/galeri`;

  const data = dataResult.rows.map((item) => ({
    ...item,
    media_full_url: item.media_url
      ? item.media_url.startsWith("http")
        ? item.media_url
        : `${mediaBaseUrl}/${item.media_url}`
      : null,
  }));

  return {
    data,
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

const getPublished = async ({ page = 0, size = 10, limit = 100, search = "" } = {}) => {
  let pageNum = Number(page);
  if (isNaN(pageNum) || pageNum < 0) {
    pageNum = 0;
  }
  
  const takeSize = Number(size) || Number(limit) || 10;
  const offset = pageNum * takeSize;
  const params = [];
  let whereClauses = ["status = true"];

  const searchStr = String(search || "").trim();
  if (searchStr) {
    params.push(`%${searchStr}%`);
    whereClauses.push(`(keterangan ILIKE $${params.length} OR judul ILIKE $${params.length})`);
  }

  const whereStr = `WHERE ${whereClauses.join(" AND ")}`;
  const dataParams = [...params, takeSize, offset];

  const query = `
    SELECT * FROM galeri
    ${whereStr}
    ORDER BY galeri_id DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
  `;

  const countQuery = `SELECT COUNT(*) AS total FROM galeri ${whereStr}`;

  const [result, countResult] = await Promise.all([
    pool.query(query, dataParams),
    pool.query(countQuery, params),
  ]);

  const total = Number(countResult.rows[0]?.total || 0);
  const totalPages = total > 0 ? Math.ceil(total / takeSize) : 0;

  const backendUrl = process.env.APP_BACKEND_URL || "http://localhost:8080";
  const mediaBaseUrl = `${backendUrl.replace(/\/$/, "")}/uploads/galeri`;

  const data = result.rows.map((item) => ({
    ...item,
    media_full_url: item.media_url
      ? item.media_url.startsWith("http")
        ? item.media_url
        : `${mediaBaseUrl}/${item.media_url}`
      : null,
  }));

  return {
    data,
    pagination: {
      page: pageNum,
      size: takeSize,
      total,
      totalElements: total,
      totalPages,
      hasNext: pageNum + 1 < totalPages,
      hasPrevious: pageNum > 0,
    },
  };
};

const getById = async (id) => {
  const result = await pool.query("SELECT * FROM galeri WHERE galeri_id = $1", [id]);
  if (!result.rows[0]) return null;

  const item = result.rows[0];
  const backendUrl = process.env.APP_BACKEND_URL || "http://localhost:8080";
  const mediaBaseUrl = `${backendUrl.replace(/\/$/, "")}/uploads/galeri`;

  return {
    ...item,
    media_full_url: item.media_url
      ? item.media_url.startsWith("http")
        ? item.media_url
        : `${mediaBaseUrl}/${item.media_url}`
      : null,
  };
};

const create = async ({ judul = "", keterangan = "", media_url = "", status = true }) => {
  const statusVal = status === "true" || status === true || status === "1" || status === 1;
  const judulVal = judul ? judul.trim() : (keterangan ? keterangan.trim() : "Dokumentasi");

  const result = await pool.query(
    `
      INSERT INTO galeri (judul, keterangan, media_url, status, tanggal)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
      RETURNING *
    `,
    [judulVal, keterangan ? keterangan.trim() : "", media_url, statusVal]
  );

  return result.rows[0];
};

const update = async (id, { judul, keterangan, media_url, status }) => {
  const old = await getById(id);
  if (!old) return null;

  const newMedia = media_url || old.media_url;
  const statusVal = status !== undefined
    ? status === "true" || status === true || status === "1" || status === 1
    : old.status;
  const newJudul = judul !== undefined ? judul.trim() : old.judul;
  const newKet = keterangan !== undefined ? keterangan.trim() : old.keterangan;

  const result = await pool.query(
    `
      UPDATE galeri
      SET
        judul = $1,
        keterangan = $2,
        media_url = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE galeri_id = $5
      RETURNING *
    `,
    [newJudul, newKet, newMedia, statusVal, id]
  );

  if (media_url && old.media_url && old.media_url !== media_url) {
    deleteFile(old.media_url);
  }

  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query("DELETE FROM galeri WHERE galeri_id = $1 RETURNING *", [id]);
  if (!result.rows[0]) return null;

  const item = result.rows[0];
  if (item.media_url) {
    deleteFile(item.media_url);
  }

  return item;
};

module.exports = {
  getAll,
  getPublished,
  getById,
  create,
  update,
  remove,
  deleteFile,
};
