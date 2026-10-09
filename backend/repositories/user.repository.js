const pool = require("../config/database");

// ============================================================
// GET ALL
// ============================================================

const findAll = async ({
    search = "",
    page = 1,
    size = 10,
}) => {
    const offset = (page - 1) * size;

    const searchValue = `%${search}%`;

    const dataQuery = `
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
          AND (
              nama ILIKE $1
              OR email ILIKE $1
              OR role ILIKE $1
          )
        ORDER BY id DESC
        LIMIT $2
        OFFSET $3
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM users
        WHERE deleted_at IS NULL
          AND (
              nama ILIKE $1
              OR email ILIKE $1
              OR role ILIKE $1
          )
    `;

    const [dataResult, countResult] = await Promise.all([
        pool.query(dataQuery, [
            searchValue,
            size,
            offset,
        ]),

        pool.query(countQuery, [
            searchValue,
        ]),
    ]);

    return {
        data: dataResult.rows,
        total: Number(countResult.rows[0].total),
    };
};


// ============================================================
// FIND BY ID
// ============================================================

const findById = async (id) => {
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
        WHERE id = $1
          AND deleted_at IS NULL
        LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
};


// ============================================================
// FIND BY ID WITH PASSWORD
// ============================================================

const findByIdWithPassword = async (id) => {
    const query = `
        SELECT
            id,
            nama,
            email,
            password,
            role,
            foto,
            created_at,
            updated_at
        FROM users
        WHERE id = $1
          AND deleted_at IS NULL
        LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
};


// ============================================================
// FIND BY EMAIL
// ============================================================

const findByEmail = async (email) => {
    const query = `
        SELECT
            id,
            nama,
            email,
            password,
            role,
            foto,
            created_at,
            updated_at
        FROM users
        WHERE email = $1
          AND deleted_at IS NULL
        LIMIT 1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
};


// ============================================================
// CREATE
// ============================================================

const create = async ({
    nama,
    email,
    password,
    role,
    foto,
}) => {
    const query = `
        INSERT INTO users (
            nama,
            email,
            password,
            role,
            foto
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            nama,
            email,
            role,
            foto,
            created_at,
            updated_at
    `;

    const result = await pool.query(query, [
        nama,
        email,
        password,
        role,
        foto,
    ]);

    return result.rows[0];
};

const update = async (
    id,
    {
        nama,
        email,
        foto,
    }
) => {
    let query;
    let params;

    if (foto) {
        query = `
            UPDATE users
            SET
                nama = $1,
                email = $2,
                foto = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
              AND deleted_at IS NULL
            RETURNING
                id,
                nama,
                email,
                role,
                foto,
                created_at,
                updated_at
        `;

        params = [
            nama,
            email,
            foto,
            id,
        ];
    } else {
        query = `
            UPDATE users
            SET
                nama = $1,
                email = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
              AND deleted_at IS NULL
            RETURNING
                id,
                nama,
                email,
                role,
                foto,
                created_at,
                updated_at
        `;

        params = [
            nama,
            email,
            id,
        ];
    }

    const result = await pool.query(
        query,
        params
    );

    return result.rows[0] || null;
};


const updatePassword = async (id, password) => {
    const query = `
        UPDATE users
        SET
            password = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND deleted_at IS NULL
        RETURNING
            id,
            nama,
            email,
            role,
            foto,
            created_at,
            updated_at
    `;

    const result = await pool.query(query, [
        password,
        id,
    ]);

    return result.rows[0] || null;
};

const softDelete = async (id) => {
    const query = `
        UPDATE users
        SET
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING id
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
};



module.exports = {
    findAll,
    findById,
    findByIdWithPassword,
    findByEmail,
    create,
    update,
    updatePassword,
    softDelete,
};