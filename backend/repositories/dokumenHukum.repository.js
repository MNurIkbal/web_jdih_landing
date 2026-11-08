const pool = require("../config/database");

// GET ALL
const findAll = async ({
    search = "",
    page = 1,
    size = 10,
    status = "",
}) => {
    const offset = (page - 1) * size;
    const conditions = ["deleted_at IS NULL"];
    const values = [];
    let idx = 1;

    if (search && search.trim()) {
        conditions.push(`(
            judul ILIKE $${idx}
            OR kategori ILIKE $${idx}
            OR nomor ILIKE $${idx}
            OR bidang ILIKE $${idx}
            OR tipe_dokumen ILIKE $${idx}
            OR subjek ILIKE $${idx}
        )`);
        values.push(`%${search.trim()}%`);
        idx++;
    }

    if (status && status.trim()) {
        conditions.push(`status = $${idx}`);
        values.push(status.trim());
        idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const dataQuery = `
        SELECT
            id,
            judul,
            kategori,
            nomor,
            tahun,
            file_abstrak,
            file_dokumen,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subjek,
            status,
            pemrakarsa,
            penanggung_jawab,
            nomor_rancangan,
            urgensi,
            dasar_hukum,
            ringkasan,
            draft_id,
            dilihat,
            download,
            created_at,
            updated_at
        FROM dokumen_hukum
        ${whereClause}
        ORDER BY id DESC
        LIMIT $${idx}
        OFFSET $${idx + 1}
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM dokumen_hukum
        ${whereClause}
    `;

    const [dataResult, countResult] =
        await Promise.all([
            pool.query(dataQuery, [
                ...values,
                size,
                offset,
            ]),

            pool.query(countQuery, values),
        ]);

    return {
        data: dataResult.rows,
        total: Number(
            countResult.rows[0].total
        ),
    };
};

// GET BY ID
const findById = async (id) => {
    const query = `
        SELECT
            d.id,
            d.judul,
            d.kategori,
            d.nomor,
            d.tahun,
            d.file_abstrak,
            d.file_dokumen,
            d.bidang,
            d.tipe_dokumen,
            d.tempat_penetapan,
            d.tanggal_penetapan,
            d.tanggal_pengundangan,
            d.tanggal_berlaku,
            d.sumber,
            d.subjek,
            d.status,
            d.pemrakarsa,
            d.penanggung_jawab,
            d.nomor_rancangan,
            d.urgensi,
            d.dasar_hukum,
            d.ringkasan,
            d.draft_id,
            d.dokumen_terkait_id,
            d.catatan_status_relasi,
            d.dilihat,
            d.download,
            d.created_at,
            d.updated_at,
            rel.judul AS dokumen_terkait_judul,
            rel.nomor AS dokumen_terkait_nomor,
            rel.tahun AS dokumen_terkait_tahun,
            rel.kategori AS dokumen_terkait_kategori,
            rel.status AS dokumen_terkait_status
        FROM dokumen_hukum d
        LEFT JOIN dokumen_hukum rel ON d.dokumen_terkait_id = rel.id
        WHERE d.id = $1
          AND d.deleted_at IS NULL
        LIMIT 1
    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0] || null;
};

// CREATE
const create = async ({
    judul,
    kategori,
    nomor,
    tahun,
    file_abstrak = null,
    file_dokumen,
    bidang,
    tipe_dokumen = null,
    tempat_penetapan = null,
    tanggal_penetapan,
    tanggal_pengundangan,
    tanggal_berlaku,
    sumber = null,
    subject = null,
    status,
    dokumen_terkait_id = null,
    catatan_status_relasi = null,
}) => {
    const query = `
    INSERT INTO dokumen_hukum (
      judul,
      kategori,
      nomor,
      tahun,
      file_abstrak,
      file_dokumen,
      bidang,
      tipe_dokumen,
      tempat_penetapan,
      tanggal_penetapan,
      tanggal_pengundangan,
      tanggal_berlaku,
      sumber,
      subjek,
      status,
      dokumen_terkait_id,
      catatan_status_relasi
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14,
      $15,
      $16,
      $17
    )
    RETURNING *
  `;

    const result = await pool.query(query, [
        judul,
        kategori,
        nomor,
        Number(tahun),
        file_abstrak || null,
        file_dokumen,
        bidang,
        tipe_dokumen || null,
        tempat_penetapan || null,
        tanggal_penetapan,
        tanggal_pengundangan,
        tanggal_berlaku,
        sumber || null,
        subject || null,
        status,
        dokumen_terkait_id || null,
        catatan_status_relasi || null,
    ]);

    return result.rows[0];
};

// UPDATE
const update = async (
    id,
    {
        judul,
        kategori,
        nomor,
        tahun,
        file_abstrak,
        file_dokumen,
        bidang,
        tipe_dokumen,
        tempat_penetapan,
        tanggal_penetapan,
        tanggal_pengundangan,
        tanggal_berlaku,
        sumber,
        subject,
        status,
        dokumen_terkait_id,
        catatan_status_relasi,
    }
) => {
    const query = `
        UPDATE dokumen_hukum
        SET
            judul = $1,
            kategori = $2,
            nomor = $3,
            tahun = $4,

            file_abstrak =
                COALESCE($5, file_abstrak),

            file_dokumen =
                COALESCE($6, file_dokumen),

            bidang = $7,
            tipe_dokumen = $8,
            tempat_penetapan = $9,
            tanggal_penetapan = $10,
            tanggal_pengundangan = $11,
            tanggal_berlaku = $12,
            sumber = $13,
            subjek = $14,
            status = $15,
            dokumen_terkait_id = $16,
            catatan_status_relasi = $17,
            updated_at = CURRENT_TIMESTAMP

        WHERE id = $18
          AND deleted_at IS NULL

        RETURNING *
    `;

    const result = await pool.query(
        query,
        [
            judul,
            kategori,
            nomor,
            tahun,
            file_abstrak || null,
            file_dokumen || null,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subject,
            status,
            dokumen_terkait_id || null,
            catatan_status_relasi || null,
            id,
        ]
    );

    return result.rows[0] || null;
};

// SOFT DELETE
const softDelete = async (id) => {
    const query = `
        UPDATE dokumen_hukum
        SET
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING id
    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0] || null;
};

// INCREMENT VIEW
const incrementView = async (id) => {
    const query = `
        UPDATE dokumen_hukum
        SET dilihat = dilihat + 1
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING dilihat
    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0] || null;
};

// INCREMENT DOWNLOAD
const incrementDownload = async (id) => {
    const query = `
        UPDATE dokumen_hukum
        SET download = download + 1
        WHERE id = $1
          AND deleted_at IS NULL
        RETURNING download
    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0] || null;
};

const getSummary = async () => {
    const query = `
    SELECT
      COUNT(*) AS produk_hukum,

      COUNT(*) FILTER (
        WHERE kategori = 'Peraturan'
      ) AS peraturan,

      COUNT(*) FILTER (
        WHERE kategori = 'Perundang-Undangan'
      ) AS perundang_undangan,

      COUNT(*) FILTER (
        WHERE kategori = 'Keputusan'
      ) AS keputusan

    FROM dokumen_hukum
    WHERE deleted_at IS NULL
  `;

    const result = await pool.query(query);

    return result.rows[0];
};


const getList = async () => {
    const query = `
        SELECT
            id,
            judul,
            kategori,
            nomor,
            tahun,
            file_abstrak,
            file_dokumen,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subjek,
            status,
            pemrakarsa,
            penanggung_jawab,
            nomor_rancangan,
            urgensi,
            dasar_hukum,
            ringkasan,
            draft_id,
            dilihat,
            download,
            created_at,
            updated_at
        FROM dokumen_hukum
        WHERE deleted_at IS NULL
        ORDER BY id DESC
        LIMIT 6
    `;

    const result = await pool.query(query);

    return result.rows;
};

const findAllWeb = async ({
    search = "",
    page = 1,
    size = 10,
    kategori = "",
    tahun = "",
    bidang = "",
} = {}) => {
    page = Number(page);
    size = Number(size);

    if (!Number.isInteger(page) || page < 1) {
        page = 1;
    }

    if (!Number.isInteger(size) || size < 1) {
        size = 10;
    }

    const offset = (page - 1) * size;

    const values = [];
    const conditions = [
        "deleted_at IS NULL",
    ];

    if (search && search.trim() !== "") {
        values.push(`%${search.trim()}%`);

        conditions.push(`
            (
                judul ILIKE $${values.length}
                OR kategori ILIKE $${values.length}
                OR nomor ILIKE $${values.length}
                OR bidang ILIKE $${values.length}
                OR tipe_dokumen ILIKE $${values.length}
                OR subjek ILIKE $${values.length}
            )
        `);
    }

    if (kategori && kategori.trim() !== "") {
        values.push(kategori.trim());

        conditions.push(
            `kategori ILIKE $${values.length}`
        );
    }

    if (tahun !== "" && tahun !== null && tahun !== undefined) {
        values.push(Number(tahun));

        conditions.push(
            `tahun = $${values.length}`
        );
    }

    if (bidang && bidang.trim() !== "") {
        values.push(bidang.trim());

        conditions.push(
            `bidang ILIKE $${values.length}`
        );
    }

    const whereClause = conditions.join(" AND ");

    const dataValues = [...values];

    dataValues.push(size);
    const limitIndex = dataValues.length;

    dataValues.push(offset);
    const offsetIndex = dataValues.length;

    const dataQuery = `
        SELECT
            id,
            judul,
            kategori,
            nomor,
            tahun,
            file_abstrak,
            file_dokumen,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subjek,
            status,
            pemrakarsa,
            penanggung_jawab,
            nomor_rancangan,
            urgensi,
            dasar_hukum,
            ringkasan,
            draft_id,
            dilihat,
            download,
            created_at,
            updated_at
        FROM dokumen_hukum
        WHERE ${whereClause}
        ORDER BY id DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM dokumen_hukum
        WHERE ${whereClause}
    `;

    const [
        dataResult,
        countResult,
    ] = await Promise.all([
        pool.query(dataQuery, dataValues),
        pool.query(countQuery, values),
    ]);

    const total = Number(
        countResult.rows[0]?.total || 0
    );

    const totalPages = Math.ceil(total / size);

    return {
        data: dataResult.rows,
        pagination: {
            page,
            size,
            total,
            totalPages,
        },
    };
};

const findRelated = async (id) => {
    const query = `
        SELECT 
            id,
            judul,
            kategori,
            nomor,
            tahun,
            file_abstrak,
            file_dokumen,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_berlaku,
            tanggal_pengundangan,
            sumber,
            subjek,
            status,
            dilihat,
            download,
            created_at,
            updated_at
        FROM dokumen_hukum
        WHERE deleted_at IS NULL
          AND id != $1
        ORDER BY id DESC
        LIMIT 3
    `;

    const result = await pool.query(query, [id]);

    return result.rows;
};

const dynamisDownload = async (dokumenId) => {
    const query = `
    UPDATE dokumen_hukum
    SET download = COALESCE(download, 0) + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, download, dilihat
  `;

    const { rows } = await pool.query(query, [dokumenId]);

    return rows[0] || null;
};

const dinamisPreview = async (dokumenId) => {
    const query = `
    UPDATE dokumen_hukum
    SET dilihat = COALESCE(dilihat, 0) + 1,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, download, dilihat
  `;

    const { rows } = await pool.query(query, [dokumenId]);

    return rows[0] || null;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    softDelete,
    incrementView,
    incrementDownload,
    getSummary,
    getList,
    findAllWeb,
    findRelated,
    dynamisDownload,
    dinamisPreview
};