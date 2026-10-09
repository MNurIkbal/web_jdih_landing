const pool = require("../config/database");

const findAll = async ({ search = "", page = 1, size = 10 }) => {
  const offset = (page - 1) * size;

  const searchValue = `%${search}%`;

  const whereClause = search
    ? `
            WHERE
                judul ILIKE $1
                OR kategori ILIKE $1
                OR penulis ILIKE $1
                OR isi_berita ILIKE $1
        `
    : "";

  const dataQuery = `
        SELECT
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status,
            views,
            created_at,
            updated_at
        FROM berita
        ${whereClause}
        ORDER BY berita_id DESC
        LIMIT $${search ? 2 : 1}
        OFFSET $${search ? 3 : 2}
    `;

  const dataValues = search ? [searchValue, size, offset] : [size, offset];

  const countQuery = `
        SELECT COUNT(*) AS total
        FROM berita
        ${whereClause}
    `;

  const countValues = search ? [searchValue] : [];

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataValues),

    pool.query(countQuery, countValues),
  ]);

  const total = Number(countResult.rows[0].total);

  return {
    data: dataResult.rows,
    total,
  };
};

const findById = async (id) => {
  const result = await pool.query(
    `
        SELECT 
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            CASE
                WHEN gambar IS NOT NULL AND gambar <> ''
                THEN $2 || '/' || gambar
                ELSE NULL
            END AS gambar,
            isi_berita,
            status,
            views,
            created_at,
            updated_at
        FROM berita
        WHERE berita_id = $1
        `,
    [id, imageBaseUrl],
  );

  return result.rows[0] || null;
};

const create = async ({
  judul,
  kategori,
  tanggal_berita,
  penulis,
  gambar,
  isi_berita,
  status,
}) => {
  const result = await pool.query(
    `
        INSERT INTO berita (
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        RETURNING
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status,
            created_at,
            updated_at
        `,
    [judul, kategori, tanggal_berita, penulis, gambar, isi_berita, status],
  );

  return result.rows[0];
};

const update = async (id, data) => {
  const fields = [];
  const values = [];

  let index = 1;

  if (data.judul !== undefined) {
    fields.push(`judul = $${index}`);
    values.push(data.judul);
    index++;
  }

  if (data.kategori !== undefined) {
    fields.push(`kategori = $${index}`);
    values.push(data.kategori);
    index++;
  }

  if (data.tanggal_berita !== undefined) {
    fields.push(`tanggal_berita = $${index}`);
    values.push(data.tanggal_berita);
    index++;
  }

  if (data.penulis !== undefined) {
    fields.push(`penulis = $${index}`);
    values.push(data.penulis);
    index++;
  }

  // ==========================================
  // GAMBAR
  // HANYA UPDATE JIKA ADA GAMBAR BARU
  // ==========================================

  if (data.gambar !== undefined) {
    fields.push(`gambar = $${index}`);
    values.push(data.gambar);
    index++;
  }

  if (data.isi_berita !== undefined) {
    fields.push(`isi_berita = $${index}`);
    values.push(data.isi_berita);
    index++;
  }

  if (data.status !== undefined) {
    fields.push(`status = $${index}`);
    values.push(data.status);
    index++;
  }

  // updated_at selalu berubah
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  // ID
  values.push(id);

  const result = await pool.query(
    `
      UPDATE berita
      SET
        ${fields.join(",\n        ")}
      WHERE berita_id = $${index}
      RETURNING
        berita_id,
        judul,
        kategori,
        tanggal_berita,
        penulis,
        gambar,
        isi_berita,
        status,
        created_at,
        updated_at
    `,
    values,
  );

  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM berita
        WHERE berita_id = $1
        RETURNING *
        `,
    [id],
  );

  return result.rows[0] || null;
};

const backendUrl =
  process.env.APP_BACKEND_URL || "https://jdih-be.asiasistem.com";

const imageBaseUrl = `${backendUrl.replace(/\/$/, "")}/uploads/berita`;

const formatBerita = (item) => {
  if (!item) {
    return item;
  }

  return {
    ...item,
    gambar: item.gambar ? `${imageBaseUrl}/${item.gambar}` : null,
  };
};

const getWebList = async () => {
  const query = `
        SELECT 
            berita_id, 
            judul, 
            kategori, 
            tanggal_berita, 
            penulis, 
            gambar, 
            isi_berita, 
            status, 
            views,
            created_at, 
            updated_at 
        FROM berita 
        WHERE status = true 
        ORDER BY berita_id DESC 
        LIMIT 7
    `;

  const result = await pool.query(query);

  return result.rows.map(formatBerita);
};

const getWebListPagination = async ({ page = 1, size = 10 } = {}) => {
  page = Number(page);

  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  size = Number(size);

  if (!Number.isInteger(size) || size < 1) {
    size = 10;
  }

  if (size > 100) {
    size = 100;
  }

  const offset = (page - 1) * size;

  const query = `
        SELECT
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status,
            views,
            created_at,
            updated_at
        FROM berita
        WHERE status = true
        ORDER BY berita_id DESC
        LIMIT $1
        OFFSET $2
    `;

  const countQuery = `
        SELECT COUNT(*) AS total
        FROM berita
        WHERE status = true
    `;

  const [result, countResult] = await Promise.all([
    pool.query(query, [size, offset]),
    pool.query(countQuery),
  ]);

  const totalElements = Number(countResult.rows[0].total);

  const totalPages = Math.ceil(totalElements / size);

  return {
    content: result.rows.map(formatBeritaList),

    page,
    size,

    totalElements,
    totalPages,

    first: page === 1,
    last: page >= totalPages,
  };
};

const formatBeritaList = (row) => {
  return {
    berita_id: row.berita_id,
    judul: row.judul,
    kategori: row.kategori,
    tanggal_berita: row.tanggal_berita,
    penulis: row.penulis,
    gambar: row.gambar ? `${imageBaseUrl}/${row.gambar}` : null,
    isi_berita: row.isi_berita,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const findLatest = async () => {
  const query = `
        SELECT
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status,
            COALESCE(views, 0) AS views,
            created_at,
            updated_at
        FROM berita
        WHERE status = true
        ORDER BY berita_id DESC
        LIMIT 7
    `;

  const result = await pool.query(query);

  return result.rows;
};

const incrementViews = async (beritaId) => {
  const query = `
        UPDATE berita
        SET
            views = COALESCE(views, 0) + 1,
            updated_at = NOW()
        WHERE berita_id = $1
          AND status = true
        RETURNING
            berita_id,
            views
    `;

  const result = await pool.query(query, [beritaId]);

  return result.rows[0] || null;
};
const findOtherBerita = async (beritaId) => {
    const query = `
        SELECT
            berita_id,
            judul,
            kategori,
            tanggal_berita,
            penulis,
            gambar,
            isi_berita,
            status,
            views,
            created_at,
            updated_at
        FROM berita
        WHERE status = true
          AND berita_id <> $1
          ORDER BY RANDOM()
        LIMIT 5
    `;

    const result = await pool.query(query, [beritaId]);

    return result.rows.map((item) => ({
        ...item,
        gambar: item.gambar
            ? `${imageBaseUrl}/${item.gambar}`
            : null,
    }));
};
module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getWebList,
  getWebListPagination,
  incrementViews,
  findLatest,
  findOtherBerita
};
