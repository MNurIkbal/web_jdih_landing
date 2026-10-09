const pool = require("../config/database");

const create = async (data) => {
  const { nama, email, subject, pesan } = data;

  const query = `
    INSERT INTO kontak (
      nama,
      email,
      subject,
      pesan
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const values = [
    nama,
    email,
    subject,
    pesan,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const findAll = async ({ search = "", page = 1, size = 10 }) => {
  const offset = (page - 1) * size;

  const searchValue = `%${search}%`;

  const whereClause = search
    ? `
      WHERE
        nama ILIKE $1
        OR email ILIKE $1
        OR subject ILIKE $1
        OR pesan ILIKE $1
    `
    : "";

  const dataQuery = `
    SELECT
      kontak_id,
      nama,
      email,
      subject,
      pesan,
      created_at,
      updated_at
    FROM kontak
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${search ? 2 : 1}
    OFFSET $${search ? 3 : 2}
  `;

  const dataValues = search
    ? [searchValue, size, offset]
    : [size, offset];

  // =========================
  // Query total data
  // =========================
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM kontak
    ${whereClause}
  `;

  const countValues = search
    ? [searchValue]
    : [];

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

const removeById = async (id) => {
  const query = `
    DELETE FROM kontak
    WHERE kontak_id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

module.exports = {
  create,
  findAll,
  removeById
};