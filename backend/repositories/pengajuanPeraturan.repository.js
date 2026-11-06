const pool = require("../config/database");

const findAll = async ({ search = "", page = 1, size = 10, tahapan = "" }) => {
    const offset = (page - 1) * size;
    let conditions = ["deleted_at IS NULL"];
    let values = [];
    let idx = 1;

    if (search) {
        conditions.push(`(judul ILIKE $${idx} OR nomor_rancangan ILIKE $${idx} OR pemrakarsa ILIKE $${idx})`);
        values.push(`%${search}%`);
        idx++;
    }

    if (tahapan) {
        conditions.push(`tahapan = $${idx}`);
        values.push(tahapan);
        idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) FROM draft_peraturan ${whereClause}`;
    const countRes = await pool.query(countQuery, values);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    const dataQuery = `
        SELECT *
        FROM draft_peraturan
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const dataRes = await pool.query(dataQuery, [...values, size, offset]);

    return {
        data: dataRes.rows,
        totalItems,
        totalPages: Math.ceil(totalItems / size),
        currentPage: Number(page),
    };
};

const findById = async (id) => {
    const draftQuery = `SELECT * FROM draft_peraturan WHERE id = $1 AND deleted_at IS NULL`;
    const draftRes = await pool.query(draftQuery, [id]);
    if (!draftRes.rows[0]) return null;
    const draft = draftRes.rows[0];

    const pembahasanQuery = `SELECT * FROM draft_peraturan_pembahasan WHERE draft_id = $1 ORDER BY created_at ASC`;
    const pembahasanRes = await pool.query(pembahasanQuery, [id]);

    const persetujuanQuery = `SELECT * FROM draft_peraturan_persetujuan WHERE draft_id = $1 ORDER BY id ASC`;
    const persetujuanRes = await pool.query(persetujuanQuery, [id]);

    return {
        ...draft,
        pembahasan_list: pembahasanRes.rows,
        persetujuan_list: persetujuanRes.rows,
    };
};

const createDraft = async (data) => {
    const {
        judul,
        kategori,
        nomor_rancangan,
        tahun,
        pemrakarsa,
        penanggung_jawab,
        tanggal_pengajuan,
        target_penetapan,
        ringkasan,
        catatan_revisi,
        file_draft,
        file_naskah_akademik,
    } = data;

    const query = `
        INSERT INTO draft_peraturan (
            judul, kategori, nomor_rancangan, tahun,
            pemrakarsa, penanggung_jawab, tahapan, status,
            tanggal_pengajuan, target_penetapan, ringkasan,
            catatan_revisi, file_draft, file_naskah_akademik,
            dilihat, download, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4,
            $5, $6, 'Pengajuan', 'Proses',
            $7, $8, $9,
            $10, $11, $12,
            0, 0, NOW(), NOW()
        ) RETURNING *;
    `;

    const values = [
        judul,
        kategori || "Rancangan Peraturan",
        nomor_rancangan || null,
        tahun ? parseInt(tahun, 10) : new Date().getFullYear(),
        pemrakarsa || null,
        penanggung_jawab || null,
        tanggal_pengajuan || new Date(),
        target_penetapan || null,
        ringkasan || null,
        catatan_revisi || null,
        file_draft || null,
        file_naskah_akademik || null,
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
};

const updateTahapan = async (id, tahapan, status) => {
    const query = `
        UPDATE draft_peraturan
        SET tahapan = $2,
            status = COALESCE($3, status),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const res = await pool.query(query, [id, tahapan, status]);
    return res.rows[0];
};

// Tahap 2: Pembahasan
const addPembahasan = async (draftId, data) => {
    const { judul_rapat, tanggal_rapat, file_notulensi, keterangan } = data;
    const query = `
        INSERT INTO draft_peraturan_pembahasan (
            draft_id, judul_rapat, tanggal_rapat, file_notulensi, keterangan, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [
        draftId,
        judul_rapat,
        tanggal_rapat || new Date(),
        file_notulensi || null,
        keterangan || null,
    ]);

    // Update status tahapan jika masih Pengajuan
    await pool.query(`UPDATE draft_peraturan SET tahapan = 'Pembahasan', updated_at = NOW() WHERE id = $1`, [draftId]);

    return res.rows[0];
};

const removePembahasan = async (id) => {
    const query = `DELETE FROM draft_peraturan_pembahasan WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

// Tahap 3: Harmonisasi
const updateHarmonisasi = async (draftId, data) => {
    const { status_harmonisasi, catatan_harmonisasi, file_harmonisasi } = data;
    const query = `
        UPDATE draft_peraturan
        SET tahapan = 'Harmonisasi',
            status_harmonisasi = $2,
            catatan_harmonisasi = $3,
            file_harmonisasi = COALESCE($4, file_harmonisasi),
            tanggal_harmonisasi = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const res = await pool.query(query, [
        draftId,
        status_harmonisasi || "Harmonisasi Selesai",
        catatan_harmonisasi || null,
        file_harmonisasi || null,
    ]);
    return res.rows[0];
};

// Tahap 4: Persetujuan
const addPersetujuanPejabat = async (draftId, data) => {
    const { nama_pejabat, jabatan } = data;
    const query = `
        INSERT INTO draft_peraturan_persetujuan (
            draft_id, nama_pejabat, jabatan, status, created_at, updated_at
        ) VALUES ($1, $2, $3, 'Menunggu', NOW(), NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [draftId, nama_pejabat, jabatan]);
    await pool.query(`UPDATE draft_peraturan SET tahapan = 'Persetujuan', updated_at = NOW() WHERE id = $1`, [draftId]);
    return res.rows[0];
};

const updatePersetujuanStatus = async (persetujuanId, data) => {
    const { status, catatan } = data;
    const query = `
        UPDATE draft_peraturan_persetujuan
        SET status = $2,
            catatan = $3,
            tanggal_persetujuan = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const res = await pool.query(query, [persetujuanId, status, catatan || null]);
    return res.rows[0];
};

const removePersetujuan = async (id) => {
    const query = `DELETE FROM draft_peraturan_persetujuan WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

// Tahap 5: Penetapan & Publikasi ke Dokumen Hukum
const penetapanDanPublikasi = async (draftId, data) => {
    const {
        nomor_penetapan,
        tanggal_penetapan,
        tempat_penetapan,
        file_dokumen_final,
        bidang,
        tipe_dokumen,
    } = data;

    // Ambil data draft
    const draftRes = await pool.query(`SELECT * FROM draft_peraturan WHERE id = $1`, [draftId]);
    const draft = draftRes.rows[0];
    if (!draft) throw new Error("Draft peraturan tidak ditemukan");

    const finalDoc = file_dokumen_final || draft.file_draft;

    // Masukkan ke dokumen_hukum agar langsung terpublikasi di Dokumen Hukum Internal
    const docQuery = `
        INSERT INTO dokumen_hukum (
            judul, kategori, nomor, tahun, bidang, tipe_dokumen,
            tempat_penetapan, tanggal_penetapan, tanggal_pengundangan, tanggal_berlaku,
            file_dokumen, file_abstrak, status, dilihat, download,
            created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $8, $8,
            $9, $10, 'Berlaku', 0, 0,
            NOW(), NOW()
        ) RETURNING id;
    `;

    const docValues = [
        draft.judul,
        draft.kategori || "Peraturan",
        nomor_penetapan || draft.nomor_rancangan || "1",
        draft.tahun || new Date().getFullYear(),
        bidang || "Hukum",
        tipe_dokumen || "Peraturan",
        tempat_penetapan || "Jakarta",
        tanggal_penetapan || new Date(),
        finalDoc,
        draft.file_naskah_akademik || null,
    ];

    const insertedDoc = await pool.query(docQuery, docValues);
    const newDocId = insertedDoc.rows[0].id;

    // Update draft_peraturan status menjadi Penetapan dan status Selesai/Ditetapkan
    const updateDraftQuery = `
        UPDATE draft_peraturan
        SET tahapan = 'Penetapan',
            status = 'Ditetapkan',
            nomor_penetapan = $2,
            tanggal_penetapan = $3,
            file_dokumen_final = $4,
            id_dokumen_hukum_terbit = $5,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;

    const updateRes = await pool.query(updateDraftQuery, [
        draftId,
        nomor_penetapan,
        tanggal_penetapan || new Date(),
        finalDoc,
        newDocId,
    ]);

    return {
        draft: updateRes.rows[0],
        id_dokumen_hukum: newDocId,
    };
};

const softDeleteDraft = async (id) => {
    const query = `UPDATE draft_peraturan SET deleted_at = NOW() WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

module.exports = {
    findAll,
    findById,
    createDraft,
    updateTahapan,
    addPembahasan,
    removePembahasan,
    updateHarmonisasi,
    addPersetujuanPejabat,
    updatePersetujuanStatus,
    removePersetujuan,
    penetapanDanPublikasi,
    softDeleteDraft,
};

