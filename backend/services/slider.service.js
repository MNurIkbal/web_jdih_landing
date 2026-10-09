const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

/**
 * Hapus file gambar
 */
const deleteImage = (filename) => {
  if (!filename) {
    return;
  }

  const filePath = path.join(process.cwd(), "uploads", "sliders", filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Convert status dari multipart/form-data
 */
const parseStatus = (status, defaultValue = true) => {
  if (status === undefined || status === null || status === "") {
    return defaultValue;
  }

  return status === true || status === "true" || status === "1" || status === 1;
};

const getAll = async ({ search = "", page = 1, size = 10 } = {}) => {
  
  page = Number(page);

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  size = Number(size);

  if (!Number.isInteger(size) || size < 1) {
    size = 10;
  }

  // Maksimal 100 data
  if (size > 100) {
    size = 100;
  }

  search = String(search || "").trim();

  const offset = (page - 1) * size;

  const searchValue = `%${search}%`;

  const whereClause = search
    ? `
            WHERE
                judul ILIKE $1
                OR keterangan ILIKE $1
        `
    : "";

  const dataQuery = `
        SELECT
            slider_id,
            gambar,
            judul,
            keterangan,
            status,
            created_at,
            updated_at
        FROM slider
        ${whereClause}
        ORDER BY slider_id DESC
        LIMIT $${search ? 2 : 1}
        OFFSET $${search ? 3 : 2}
    `;

  const dataValues = search ? [searchValue, size, offset] : [size, offset];

  const countQuery = `
        SELECT COUNT(*) AS total
        FROM slider
        ${whereClause}
    `;

  const countValues = search ? [searchValue] : [];

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),

    pool.query(countQuery, countValues),
  ]);

  const total = Number(countResult.rows[0].total);

  const totalPages = total > 0 ? Math.ceil(total / size) : 0;

  const backendUrl = process.env.APP_BACKEND_URL || "https://jdih-be.asiasistem.com";

  const imageBaseUrl = `${backendUrl.replace(/\/$/, "")}/uploads/sliders`;

  const data = dataResult.rows.map((item) => ({
    ...item,

    gambar: item.gambar ? `${imageBaseUrl}/${item.gambar}` : null,
  }));

  return {
    data,

    pagination: {
      page,

      size,

      total,

      totalPages,

      hasNext: page < totalPages,

      hasPrevious: page > 1 && totalPages > 0,
    },
  };
};

/**
 * GET BY ID
 */
const getById = async (id) => {
  const result = await pool.query(
    `
        SELECT
            slider_id,
            gambar,
            judul,
            keterangan,
            status,
            created_at,
            updated_at
        FROM slider
        WHERE slider_id = $1
        `,
    [id],
  );

  return result.rows[0] || null;
};

/**
 * CREATE
 */
const create = async ({ judul, keterangan, status, gambar }) => {
  const statusValue = parseStatus(status, true);
  
  
  

  const result = await pool.query(
    `
        INSERT INTO slider (
            gambar,
            judul,
            keterangan,
            status
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            slider_id,
            gambar,
            judul,
            keterangan,
            status,
            created_at,
            updated_at
        `,
    [gambar, judul.trim(), keterangan.trim(), statusValue],
  );

  return result.rows[0];
};

/**
 * UPDATE
 */
const update = async (id, { judul, keterangan, status, gambar }) => {
  // Ambil data lama
  const oldSlider = await getById(id);

  if (!oldSlider) {
    return null;
  }

  // Kalau tidak ada gambar baru,
  // gunakan gambar lama
  const newGambar = gambar || oldSlider.gambar;

  // Kalau status tidak dikirim,
  // gunakan status lama
  const statusValue = parseStatus(status, oldSlider.status);

  const result = await pool.query(
    `
        UPDATE slider
        SET
            gambar = $1,
            judul = $2,
            keterangan = $3,
            status = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE slider_id = $5
        RETURNING
            slider_id,
            gambar,
            judul,
            keterangan,
            status,
            created_at,
            updated_at
        `,
    [newGambar, judul.trim(), keterangan.trim(), statusValue, id],
  );

  // Hapus gambar lama jika upload gambar baru
  if (gambar && oldSlider.gambar && oldSlider.gambar !== gambar) {
    deleteImage(oldSlider.gambar);
  }

  return result.rows[0];
};

/**
 * DELETE
 */
const remove = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM slider
        WHERE slider_id = $1
        RETURNING *
        `,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const slider = result.rows[0];

  // Hapus file gambar
  if (slider.gambar) {
    deleteImage(slider.gambar);
  }

  return slider;
};

/**
 * Hapus gambar yang baru saja diupload
 * ketika proses gagal
 */
const removeUploadedImage = (filename) => {
  deleteImage(filename);
};


const getRessult = async () => {
  const backendUrl =
    process.env.APP_BACKEND_URL || "https://jdih-be.asiasistem.com";

  const imageBaseUrl =
    `${backendUrl.replace(/\/$/, "")}/uploads/sliders`;

  const query = `
    SELECT 
      slider_id,
      gambar,
      judul,
      keterangan,
      status,
      created_at,
      updated_at
    FROM slider
    WHERE status = true
    ORDER BY slider_id DESC
  `;

  const result = await pool.query(query);

  // ==========================================
  // FORMAT DATA
  // ==========================================

  return result.rows.map((item) => ({
    ...item,

    gambar: item.gambar
      ? `${imageBaseUrl}/${item.gambar}`
      : null,
  }));
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  removeUploadedImage,
  getRessult
};
