const pool = require("../config/database");

const findUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      nama,
      email,
      role,
      foto,
      password,
      created_at,
      updated_at
    FROM users
    WHERE deleted_at IS NULL
      AND LOWER(email) = LOWER($1)
    LIMIT 1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0] || null;
};

const findUserById = async (id) => {
  const query = `
    SELECT
      id,
      nama,
      email,
      role,
      foto,
      created_at,
      updated_at
    FROM users
    WHERE deleted_at IS NULL
      AND id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

module.exports = {
  findUserByEmail,
  findUserById,
};