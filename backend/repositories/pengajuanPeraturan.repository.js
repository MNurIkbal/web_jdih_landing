const pool = require("../config/database");

let hasEnsuredColumns = false;
const ensureDraftColumns = async () => {
    if (hasEnsuredColumns) return;
    try {
        await pool.query(`
            ALTER TABLE draft_peraturan 
            ADD COLUMN IF NOT EXISTS bidang VARCHAR(255),
            ADD COLUMN IF NOT EXISTS tipe_dokumen VARCHAR(255),
            ADD COLUMN IF NOT EXISTS status_dokumen VARCHAR(100) DEFAULT 'Berlaku',
            ADD COLUMN IF NOT EXISTS tempat_penetapan VARCHAR(255),
            ADD COLUMN IF NOT EXISTS tanggal_penetapan DATE,
            ADD COLUMN IF NOT EXISTS tanggal_pengundangan DATE,
            ADD COLUMN IF NOT EXISTS tanggal_berlaku DATE,
            ADD COLUMN IF NOT EXISTS subjek VARCHAR(255),
            ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
            ADD COLUMN IF NOT EXISTS sumber TEXT,
            ADD COLUMN IF NOT EXISTS urgensi TEXT,
            ADD COLUMN IF NOT EXISTS dasar_hukum TEXT,
            ADD COLUMN IF NOT EXISTS catatan_verifikasi TEXT,
            ADD COLUMN IF NOT EXISTS status_penunjukan_pejabat VARCHAR(100),
            ADD COLUMN IF NOT EXISTS riwayat_penolakan_persetujuan JSONB;

            CREATE TABLE IF NOT EXISTS draft_peraturan_pembahasan (
                id SERIAL PRIMARY KEY,
                draft_id INT NOT NULL,
                judul_rapat VARCHAR(255) NOT NULL,
                tanggal_rapat DATE NOT NULL,
                lokasi VARCHAR(255),
                keterangan TEXT,
                file_notulensi VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            ALTER TABLE draft_peraturan_pembahasan 
            ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255);
        `);
        hasEnsuredColumns = true;
    } catch (e) {
        // Abaikan jika sudah ada atau tabel tidak mengizinkan
    }
};

const findAll = async ({ search = "", page = 1, size = 10, tahapan = "", role = "" }) => {
    await ensureDraftColumns();
    const offset = (page - 1) * size;
    let conditions = ["deleted_at IS NULL"];
    let values = [];
    let idx = 1;

    // Sembunyikan draft dengan status Ditetapkan dan Selesai (sudah terbit ke dokumen hukum)
    conditions.push(`status NOT IN ('Ditetapkan', 'Selesai')`);

    // Jika role adalah admin / verifikator, sembunyikan juga status: Draft, Ditolak, Revisi
    if (role === "admin") {
        conditions.push(`status NOT IN ('Draft', 'Ditolak', 'Revisi')`);
    }

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
    await ensureDraftColumns();
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
    await ensureDraftColumns();
    const {
        judul,
        kategori,
        bidang,
        tipe_dokumen,
        status_dokumen,
        tempat_penetapan,
        tanggal_penetapan,
        tanggal_pengundangan,
        tanggal_berlaku,
        subject,
        sumber,
        urgensi,
        dasar_hukum,
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
            judul, kategori, bidang, tipe_dokumen, status_dokumen, tempat_penetapan,
            tanggal_penetapan, tanggal_pengundangan, tanggal_berlaku,
            subject, subjek, sumber, urgensi, dasar_hukum, nomor_rancangan, tahun,
            pemrakarsa, penanggung_jawab, tahapan, status,
            tanggal_pengajuan, target_penetapan, ringkasan,
            catatan_revisi, file_draft, file_naskah_akademik,
            dilihat, download, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9,
            $10, $10, $11, $12, $13, $14, $15,
            $16, $17, 'Pengajuan', 'Draft',
            $18, $19, $20,
            $21, $22, $23,
            0, 0, NOW(), NOW()
        ) RETURNING *;
    `;

    const values = [
        judul,
        kategori || "Rancangan Peraturan",
        bidang || null,
        tipe_dokumen || null,
        status_dokumen || "Berlaku",
        tempat_penetapan || null,
        tanggal_penetapan || null,
        tanggal_pengundangan || null,
        tanggal_berlaku || null,
        subject || null,
        sumber || null,
        urgensi || null,
        dasar_hukum || null,
        nomor_rancangan || null,
        tahun ? parseInt(tahun, 10) : new Date().getFullYear(),
        pemrakarsa || null,
        penanggung_jawab || null,
        tanggal_pengajuan || tanggal_pengundangan || new Date(),
        target_penetapan || tanggal_berlaku || tanggal_penetapan || null,
        ringkasan || null,
        catatan_revisi || null,
        file_draft || null,
        file_naskah_akademik || null,
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
};

const updateDraft = async (id, data) => {
    await ensureDraftColumns();
    const {
        judul,
        kategori,
        bidang,
        tipe_dokumen,
        status_dokumen,
        tempat_penetapan,
        tanggal_penetapan,
        tanggal_pengundangan,
        tanggal_berlaku,
        subject,
        sumber,
        urgensi,
        dasar_hukum,
        nomor_rancangan,
        tahun,
        pemrakarsa,
        penanggung_jawab,
        tanggal_pengajuan,
        target_penetapan,
        ringkasan,
        status,
        tahapan,
        file_draft,
        file_naskah_akademik,
    } = data;

    const query = `
        UPDATE draft_peraturan
        SET
            judul = COALESCE($2, judul),
            kategori = COALESCE($3, kategori),
            bidang = COALESCE($4, bidang),
            tipe_dokumen = COALESCE($5, tipe_dokumen),
            status_dokumen = COALESCE($6, status_dokumen),
            tempat_penetapan = COALESCE($7, tempat_penetapan),
            tanggal_penetapan = COALESCE($8, tanggal_penetapan),
            tanggal_pengundangan = COALESCE($9, tanggal_pengundangan),
            tanggal_berlaku = COALESCE($10, tanggal_berlaku),
            subject = COALESCE($11, subject),
            subjek = COALESCE($11, subjek),
            sumber = COALESCE($12, sumber),
            urgensi = COALESCE($13, urgensi),
            dasar_hukum = COALESCE($14, dasar_hukum),
            nomor_rancangan = COALESCE($15, nomor_rancangan),
            tahun = COALESCE($16, tahun),
            pemrakarsa = COALESCE($17, pemrakarsa),
            penanggung_jawab = COALESCE($18, penanggung_jawab),
            tanggal_pengajuan = COALESCE($19, tanggal_pengajuan),
            target_penetapan = COALESCE($20, target_penetapan),
            ringkasan = COALESCE($21, ringkasan),
            status = COALESCE($22, status),
            tahapan = COALESCE($23, tahapan),
            file_draft = COALESCE($24, file_draft),
            file_naskah_akademik = COALESCE($25, file_naskah_akademik),
            updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *;
    `;

    const values = [
        id,
        judul || null,
        kategori || null,
        bidang || null,
        tipe_dokumen || null,
        status_dokumen || null,
        tempat_penetapan || null,
        tanggal_penetapan || null,
        tanggal_pengundangan || null,
        tanggal_berlaku || null,
        subject || null,
        sumber || null,
        urgensi || null,
        dasar_hukum || null,
        nomor_rancangan || null,
        tahun ? parseInt(tahun, 10) : null,
        pemrakarsa || null,
        penanggung_jawab || null,
        tanggal_pengajuan || tanggal_pengundangan || null,
        target_penetapan || tanggal_berlaku || tanggal_penetapan || null,
        ringkasan || null,
        status || null,
        tahapan || null,
        file_draft || null,
        file_naskah_akademik || null,
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
};

const updateTahapan = async (id, tahapan, status, catatan_verifikasi = null, status_penunjukan_pejabat = undefined) => {
    await ensureDraftColumns();

    // Jika beralih maju dari Harmonisasi ke Tahap Persetujuan (misalnya setelah perbaikan revisi selesai),
    // reset/bersihkan data checklist persetujuan sebelumnya agar memulai persetujuan baru dari awal yang bersih (status Menunggu, catatan/file lampiran kosong).
    if (tahapan === "Persetujuan" && status_penunjukan_pejabat === undefined) {
        await pool.query(
            `DELETE FROM draft_peraturan_persetujuan WHERE draft_id = $1`,
            [id]
        );
        // Reset status penunjukan pejabat ke 'Draft' dan status harmonisasi menjadi 'Harmonisasi Selesai'
        status_penunjukan_pejabat = 'Draft';
    }

    const query = `
        UPDATE draft_peraturan
        SET tahapan = COALESCE($2, tahapan),
            status = COALESCE($3, status),
            catatan_verifikasi = COALESCE($4, catatan_verifikasi),
            status_penunjukan_pejabat = COALESCE($5, status_penunjukan_pejabat),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const res = await pool.query(query, [
        id,
        tahapan || null,
        status || null,
        catatan_verifikasi,
        status_penunjukan_pejabat !== undefined ? status_penunjukan_pejabat : null,
    ]);
    return res.rows[0];
};

// Tahap 2: Pembahasan
const addPembahasan = async (draftId, data) => {
    await ensureDraftColumns();
    const { judul_rapat, tanggal_rapat, lokasi, file_notulensi, keterangan } = data;
    const query = `
        INSERT INTO draft_peraturan_pembahasan (
            draft_id, judul_rapat, tanggal_rapat, lokasi, file_notulensi, keterangan, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [
        draftId,
        judul_rapat,
        tanggal_rapat || new Date(),
        lokasi || null,
        file_notulensi || null,
        keterangan || null,
    ]);

    // Update status tahapan jika masih Pengajuan atau Proses
    await pool.query(`UPDATE draft_peraturan SET tahapan = 'Pembahasan', status = 'Pembahasan', updated_at = NOW() WHERE id = $1`, [draftId]);

    return res.rows[0];
};

const removePembahasan = async (id) => {
    const query = `DELETE FROM draft_peraturan_pembahasan WHERE id = $1 RETURNING *`;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

// Tahap 3: Harmonisasi
const updateHarmonisasi = async (draftId, data) => {
    const {
        status_harmonisasi,
        catatan_harmonisasi,
        file_harmonisasi,
        chat_history,
        conflict_findings,
        warning_alert,
    } = data;
    const query = `
        UPDATE draft_peraturan
        SET tahapan = 'Harmonisasi',
            status = 'Harmonisasi',
            status_harmonisasi = $2,
            catatan_harmonisasi = $3,
            file_harmonisasi = COALESCE($4, file_harmonisasi),
            harmonisasi_chat_history = COALESCE($5::jsonb, harmonisasi_chat_history),
            harmonisasi_conflict_findings = $6::jsonb,
            harmonisasi_warning_alert = $7,
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
        chat_history ? JSON.stringify(chat_history) : null,
        conflict_findings !== undefined ? JSON.stringify(conflict_findings) : null,
        warning_alert !== undefined ? warning_alert : null,
    ]);
    return res.rows[0];
};

// Tahap 4: Persetujuan
const addPersetujuanPejabat = async (draftId, data) => {
    const { user_id, nama_pejabat, jabatan } = data;
    const query = `
        INSERT INTO draft_peraturan_persetujuan (
            draft_id, user_id, nama_pejabat, jabatan, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'Menunggu', NOW(), NOW())
        RETURNING *;
    `;
    const res = await pool.query(query, [draftId, user_id || null, nama_pejabat, jabatan || "Admin"]);
    await pool.query(`UPDATE draft_peraturan SET tahapan = 'Persetujuan', status = 'Persetujuan', updated_at = NOW() WHERE id = $1`, [draftId]);
    return res.rows[0];
};

const updatePersetujuanStatus = async (persetujuanId, data) => {
    const { status, catatan, file_lampiran } = data;
    const query = `
        UPDATE draft_peraturan_persetujuan
        SET status = $2,
            catatan = $3,
            file_lampiran = COALESCE($4, file_lampiran),
            tanggal_persetujuan = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;
    const res = await pool.query(query, [persetujuanId, status, catatan || null, file_lampiran || null]);
    const updatedItem = res.rows[0];

    // JIKA STATUS DITOLAK: Kembalikan draft peraturan ke Tahap Harmonisasi
    // Simpan snapshot data penolakan (pejabat, catatan, file_lampiran) ke kolom riwayat_penolakan_persetujuan
    if (status === "Ditolak" && updatedItem && updatedItem.draft_id) {
        const snapshotPenolakan = {
            id: updatedItem.id,
            nama_pejabat: updatedItem.nama_pejabat || 'Pejabat',
            jabatan: updatedItem.jabatan || 'Pejabat Penyetuju',
            status: 'Ditolak',
            catatan: catatan || null,
            file_lampiran: updatedItem.file_lampiran || file_lampiran || null,
            tanggal_persetujuan: new Date().toISOString(),
        };

        await pool.query(
            `UPDATE draft_peraturan 
             SET tahapan = 'Harmonisasi', 
                 status = 'Perlu Perbaikan Harmonisasi',
                 status_harmonisasi = 'Perlu Perbaikan Harmonisasi',
                 status_penunjukan_pejabat = 'Draft',
                 riwayat_penolakan_persetujuan = $2::jsonb,
                 catatan_harmonisasi = CONCAT(COALESCE(catatan_harmonisasi, ''), E'\n\n[Ditolak pada Tahap Persetujuan oleh ', $3::text, ' (', $4::text, ')]: ', $5::text),
                 updated_at = NOW() 
             WHERE id = $1`,
            [
                updatedItem.draft_id,
                JSON.stringify(snapshotPenolakan),
                updatedItem.nama_pejabat || 'Pejabat',
                updatedItem.jabatan || 'Pejabat Penyetuju',
                catatan || 'Dokumen draf peraturan ditolak dan dikembalikan untuk dilakukan harmonisasi ulang.'
            ]
        );
    }

    return updatedItem;
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
            pemrakarsa, penanggung_jawab, nomor_rancangan, urgensi, dasar_hukum,
            ringkasan, sumber, subjek, draft_id,
            created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, 'Berlaku', 0, 0,
            $13, $14, $15, $16, $17,
            $18, $19, $20, $21,
            NOW(), NOW()
        ) RETURNING id;
    `;

    const docValues = [
        draft.judul,
        draft.kategori || "Peraturan",
        nomor_penetapan || draft.nomor_rancangan || "1",
        draft.tahun || new Date().getFullYear(),
        bidang || draft.bidang || "Hukum",
        tipe_dokumen || draft.tipe_dokumen || "Peraturan",
        tempat_penetapan || draft.tempat_penetapan || "Jakarta",
        tanggal_penetapan || draft.tanggal_penetapan || new Date(),
        draft.tanggal_pengundangan || tanggal_penetapan || new Date(),
        draft.tanggal_berlaku || tanggal_penetapan || new Date(),
        finalDoc,
        draft.file_naskah_akademik || null,
        draft.pemrakarsa || null,
        draft.penanggung_jawab || null,
        draft.nomor_rancangan || null,
        draft.urgensi || null,
        draft.dasar_hukum || null,
        draft.ringkasan || null,
        draft.sumber || null,
        draft.subjek || draft.subject || null,
        draftId,
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

const getOptions = async ({ type = "", query = "" } = {}) => {
    // Default fallback lists from GlobalConstanta
    const defaults = {
        kategori: [
            "Peraturan",
            "Keputusan",
            "Instruksi",
            "Perundang-Undangan",
            "Monografi Hukum",
            "Artikel / Majalah Hukum",
            "Putusan / Yurisprudensi",
            "Rancangan Peraturan",
            "Surat Edaran",
        ],
        tipe_dokumen: [
            "Undang-Undang",
            "Peraturan Pemerintah",
            "Peraturan Presiden",
            "Peraturan Kepala BIN",
            "Keputusan Kepala BIN",
            "Instruksi Kepala BIN",
            "Surat Edaran Kepala BIN",
            "Peraturan Lembaga",
            "Standar Operasional Prosedur",
        ],
        bidang: [
            "Hukum Tata Negara",
            "Hukum Administrasi Negara",
            "Hukum Pidana",
            "Hukum Acara Pidana",
            "Hukum Perdata",
            "Hukum Internasional",
            "Hukum Siber & Sandi",
            "Intelijen Strategis",
            "Keamanan Nasional",
            "Hukum Umum",
        ],
        subject: [
            "Penyelenggaraan Intelijen Negara",
            "Intelijen Negara",
            "Keamanan Informasi & Sandi",
            "Tata Kelola Organisasi & SDM",
            "Operasi Intelijen & Kontra Intelijen",
            "Pengawasan & Akuntabilitas",
            "Kerjasama Antar Lembaga",
            "Sistem Informasi & Teknologi Intelijen",
            "Peraturan Internal & Disiplin Pegawai",
        ],
        status: [
            "Berlaku",
            "Tidak Berlaku",
            "Dicabut",
            "Diubah",
        ],
        tahun: Array.from({ length: 2080 - 1970 + 1 }, (_, i) => String(2080 - i)),
    };

    const searchStr = (query || "").toLowerCase().trim();

    // Helper to query distinct values from database
    const fetchDbDistinct = async (column) => {
        try {
            const sql = `
                SELECT DISTINCT TRIM(${column}) as val 
                FROM dokumen_hukum 
                WHERE ${column} IS NOT NULL AND TRIM(${column}) <> '' AND deleted_at IS NULL
                ORDER BY val ASC
            `;
            const res = await pool.query(sql);
            return res.rows.map((r) => r.val);
        } catch (e) {
            return [];
        }
    };

    const buildList = async (colName, defaultList) => {
        const fromDb = await fetchDbDistinct(colName);
        const combined = Array.from(new Set([...fromDb, ...defaultList]));
        const filtered = searchStr
            ? combined.filter((item) => item.toLowerCase().includes(searchStr))
            : combined;
        return filtered.map((item) => ({
            value: item,
            label: item,
        }));
    };

    if (type) {
        const t = type.toLowerCase().trim();
        if (t === "admin" || t === "users" || t === "pejabat") {
            try {
                let userQuery = `
                    SELECT id, nama, role 
                    FROM users 
                    WHERE deleted_at IS NULL 
                      AND LOWER(role) = 'admin'
                `;
                const queryParams = [];
                if (searchStr) {
                    userQuery += ` AND LOWER(nama) LIKE $1`;
                    queryParams.push(`%${searchStr}%`);
                }
                userQuery += ` ORDER BY nama ASC`;
                const usersRes = await pool.query(userQuery, queryParams);
                return usersRes.rows.map((u) => ({
                    value: String(u.id),
                    label: u.nama,
                }));
            } catch (err) {
                return [];
            }
        }
        if (t === "kategori") return await buildList("kategori", defaults.kategori);
        if (t === "tipe_dokumen") return await buildList("tipe_dokumen", defaults.tipe_dokumen);
        if (t === "bidang") return await buildList("bidang", defaults.bidang);
        if (t === "subject" || t === "subjek") return await buildList("subjek", defaults.subject);
        if (t === "status") {
            const list = searchStr
                ? defaults.status.filter((s) => s.toLowerCase().includes(searchStr))
                : defaults.status;
            return list.map((s) => ({ value: s, label: s }));
        }
        if (t === "dokumen" || t === "dokumen_hukum" || t === "peraturan") {
            try {
                let docSql = `
                    SELECT id, nomor, tahun, judul, kategori, status
                    FROM dokumen_hukum
                    WHERE deleted_at IS NULL
                `;
                const queryParams = [];
                if (searchStr) {
                    docSql += ` AND (LOWER(judul) LIKE $1 OR LOWER(nomor) LIKE $1 OR CAST(tahun AS TEXT) LIKE $1)`;
                    queryParams.push(`%${searchStr}%`);
                }
                docSql += ` ORDER BY id DESC LIMIT 20`;
                const docRes = await pool.query(docSql, queryParams);
                return docRes.rows.map((d) => ({
                    value: String(d.id),
                    label: `${d.nomor ? `Nomor ${d.nomor} ` : ""}${d.tahun ? `Tahun ${d.tahun} ` : ""}- ${d.judul}`,
                    subLabel: `${d.kategori || "Peraturan"} (${d.status || "Berlaku"})`,
                }));
            } catch (err) {
                return [];
            }
        }
        if (t === "tahun") {
            const fromDbYears = await fetchDbDistinct("tahun");
            const combinedYears = Array.from(new Set([...fromDbYears.map(String), ...defaults.tahun]));
            combinedYears.sort((a, b) => Number(b) - Number(a));
            const filteredYears = searchStr
                ? combinedYears.filter((y) => y.includes(searchStr))
                : combinedYears;
            return filteredYears.map((y) => ({ value: y, label: y }));
        }
    }

    // Return all categories bundle
    const [kategori, tipe_dokumen, bidang, subject, adminUsersRes] = await Promise.all([
        buildList("kategori", defaults.kategori),
        buildList("tipe_dokumen", defaults.tipe_dokumen),
        buildList("bidang", defaults.bidang),
        buildList("subjek", defaults.subject),
        pool.query(`
            SELECT id, nama, role 
            FROM users 
            WHERE deleted_at IS NULL 
              AND LOWER(role) = 'admin'
            ORDER BY nama ASC
        `).catch(() => ({ rows: [] })),
    ]);

    const admin = (adminUsersRes.rows || []).map((u) => ({
        value: String(u.id),
        label: u.nama,
    }));

    const status = defaults.status.map((s) => ({ value: s, label: s }));
    const tahun = defaults.tahun.map((y) => ({ value: y, label: y }));

    return {
        kategori,
        tipe_dokumen,
        bidang,
        subject,
        status,
        tahun,
        admin,
    };
};

module.exports = {
    getOptions,
    findAll,
    findById,
    createDraft,
    updateDraft,
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

