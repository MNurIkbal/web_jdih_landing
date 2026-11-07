const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const pengajuanService = require("../services/pengajuanPeraturan.service");
const { invalidateCache } = require("../config/redis");
const { applyWatermark } = require("../utils/pdfWatermark");

const getOptions = async (req, res) => {
    try {
        const { type, query } = req.query;
        const result = await pengajuanService.getOptions({ type, query });
        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getAll = async (req, res) => {
    try {
        const result = await pengajuanService.getAll({
            search: req.query.search || "",
            tahapan: req.query.tahapan || "",
            page: parseInt(req.query.page, 10) || 1,
            size: parseInt(req.query.size, 10) || 10,
        });
        return res.status(200).json({
            success: true,
            message: "Data pengajuan peraturan berhasil diambil",
            ...result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getById = async (req, res) => {
    try {
        let result = await pengajuanService.getById(req.params.id);
        
        // Cek jika yang membuka adalah admin/verifikator dan status masih Submit Dokumen atau Pengajuan Ulang
        try {
            const token = req.cookies?.access_token || req.headers?.authorization?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.decode(token);
                const role = (decoded?.role || "").toLowerCase();
                if (role === "admin" || role === "superadmin") {
                    if (result.status === "Submit Dokumen" || result.status === "Pengajuan Ulang") {
                        const updated = await pengajuanService.updateTahap(result.id, result.tahapan, "Review", result.catatan_verifikasi);
                        await invalidateCache("pengajuan:*");
                        result = { ...result, status: "Review" };
                    }
                }
            }
        } catch (e) {
            // Abaikan jika token gagal decode
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Tahap 1: Pengajuan Baru
const create = async (req, res) => {
    try {
        const {
            judul,
            kategori,
            bidang,
            tipe_dokumen,
            status_dokumen,
            tempat_penetapan,
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
        } = req.body;

        const fileDraft = req.files?.file_draft?.[0]?.filename || req.files?.file_dokumen?.[0]?.filename || null;
        const fileNaskahAkademik = req.files?.file_naskah_akademik?.[0]?.filename || req.files?.file_abstrak?.[0]?.filename || null;

        const result = await pengajuanService.create({
            judul,
            kategori,
            bidang,
            tipe_dokumen,
            status_dokumen,
            tempat_penetapan,
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
            file_draft: fileDraft,
            file_naskah_akademik: fileNaskahAkademik,
        });

        // Invalidate Redis cache setelah create
        await invalidateCache("pengajuan:*");

        return res.status(201).json({
            success: true,
            message: "Pengajuan peraturan berhasil dibuat",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Data Pengajuan Peraturan
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            judul,
            kategori,
            bidang,
            tipe_dokumen,
            status_dokumen,
            tempat_penetapan,
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
        } = req.body;

        const fileDraft = req.files?.file_draft?.[0]?.filename || req.files?.file_dokumen?.[0]?.filename || null;
        const fileNaskahAkademik = req.files?.file_naskah_akademik?.[0]?.filename || req.files?.file_abstrak?.[0]?.filename || null;

        const result = await pengajuanService.update(id, {
            judul,
            kategori,
            bidang,
            tipe_dokumen,
            status_dokumen,
            tempat_penetapan,
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
            file_draft: fileDraft,
            file_naskah_akademik: fileNaskahAkademik,
        });

        // Invalidate Redis cache
        await invalidateCache("pengajuan:*");

        return res.status(200).json({
            success: true,
            message: "Pengajuan peraturan berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Tahapan umum & Verifikasi
const updateTahapan = async (req, res) => {
    try {
        const { tahapan, status, catatan_verifikasi } = req.body;
        const result = await pengajuanService.updateTahap(req.params.id, tahapan, status, catatan_verifikasi);
        return res.status(200).json({
            success: true,
            message: "Tahapan pengajuan berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Tahap 2: Tambah Rapat Pembahasan
const addPembahasan = async (req, res) => {
    try {
        const { judul_rapat, tanggal_rapat, lokasi, keterangan } = req.body;
        const fileNotulensi = req.file?.filename || null;

        if (!judul_rapat || !judul_rapat.trim()) {
            return res.status(400).json({ success: false, message: "Judul rapat wajib diisi" });
        }
        if (!tanggal_rapat) {
            return res.status(400).json({ success: false, message: "Tanggal rapat wajib diisi" });
        }
        if (!fileNotulensi) {
            return res.status(400).json({ success: false, message: "File PDF hasil rapat wajib diunggah" });
        }

        const result = await pengajuanService.addPembahasan(req.params.id, {
            judul_rapat: judul_rapat.trim(),
            tanggal_rapat,
            lokasi: lokasi ? lokasi.trim() : null,
            file_notulensi: fileNotulensi,
            keterangan: keterangan ? keterangan.trim() : null,
        });

        return res.status(201).json({
            success: true,
            message: "Hasil rapat pembahasan berhasil diunggah",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deletePembahasan = async (req, res) => {
    try {
        const result = await pengajuanService.deletePembahasan(req.params.pembahasanId);
        return res.status(200).json({
            success: true,
            message: "Data pembahasan berhasil dihapus",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Tahap 3: Harmonisasi
const submitHarmonisasi = async (req, res) => {
    try {
        const { status_harmonisasi, catatan_harmonisasi } = req.body;
        const fileHarmonisasi = req.file?.filename || null;

        const result = await pengajuanService.submitHarmonisasi(req.params.id, {
            status_harmonisasi,
            catatan_harmonisasi,
            file_harmonisasi: fileHarmonisasi,
        });

        return res.status(200).json({
            success: true,
            message: "Proses harmonisasi berhasil disimpan",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Tahap 4: Persetujuan
const addPersetujuan = async (req, res) => {
    try {
        const { nama_pejabat, jabatan } = req.body;
        const result = await pengajuanService.addPersetujuan(req.params.id, {
            nama_pejabat,
            jabatan,
        });

        return res.status(201).json({
            success: true,
            message: "Daftar pejabat persetujuan berhasil ditambahkan",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const updatePersetujuanStatus = async (req, res) => {
    try {
        const { status, catatan } = req.body;
        const result = await pengajuanService.updatePersetujuanStatus(req.params.persetujuanId, {
            status,
            catatan,
        });

        return res.status(200).json({
            success: true,
            message: "Status persetujuan berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const deletePersetujuan = async (req, res) => {
    try {
        const result = await pengajuanService.deletePersetujuan(req.params.persetujuanId);
        return res.status(200).json({
            success: true,
            message: "Pejabat persetujuan berhasil dihapus",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Tahap 5: Penetapan & Publikasi
const tetapkanDanPublikasikan = async (req, res) => {
    try {
        const {
            nomor_penetapan,
            tanggal_penetapan,
            tempat_penetapan,
            bidang,
            tipe_dokumen,
        } = req.body;

        const fileDokumenFinal = req.file?.filename || null;

        const result = await pengajuanService.tetapkanDanPublikasikan(req.params.id, {
            nomor_penetapan,
            tanggal_penetapan,
            tempat_penetapan,
            bidang,
            tipe_dokumen,
            file_dokumen_final: fileDokumenFinal,
        });

        return res.status(200).json({
            success: true,
            message: "Peraturan berhasil ditetapkan dan dipublikasikan ke Dokumen Hukum!",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const remove = async (req, res) => {
    try {
        const result = await pengajuanService.remove(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Pengajuan peraturan berhasil dihapus",
            data: result,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Download File Pengajuan dengan Watermark JDIH BIN
const downloadFilePengajuan = async (req, res) => {
    try {
        const { id, type } = req.params; // type: draft | akademik | notulensi | final
        const draft = await pengajuanService.getById(id);
        if (!draft) {
            return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });
        }

        let fileName = "";
        let originalTitle = draft.judul || "dokumen";
        if (type === "draft") fileName = draft.file_draft;
        else if (type === "akademik") fileName = draft.file_naskah_akademik;
        else if (type === "final") fileName = draft.file_dokumen_final;
        else fileName = draft.file_draft;

        if (!fileName) {
            return res.status(404).json({ success: false, message: "File belum tersedia" });
        }

        const filePath = path.join(__dirname, "../uploads/pengajuan-peraturan", fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "File fisik tidak ditemukan pada server" });
        }

        // Ambil info nama user login dari JWT token atau query parameter
        let userName = "Pengguna JDIH BIN";
        try {
            const token = req.cookies?.auth_token || req.headers?.authorization?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "jdih-secret-key-12345");
                if (decoded && decoded.nama) userName = decoded.nama;
            }
        } catch (e) {}

        if (req.query.user) {
            userName = decodeURIComponent(req.query.user);
        }

        // Terapkan Watermark JDIH BIN besar miring + timestamp nama
        const watermarkedPdf = await applyWatermark(filePath, {
            userName,
            downloadDate: new Date(),
        });

        const safeFilename = encodeURIComponent(`${originalTitle}_${type}.pdf`);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`);
        res.setHeader("Content-Length", watermarkedPdf.length);

        return res.send(watermarkedPdf);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal mendownload dokumen ber-watermark: " + error.message,
        });
    }
};

module.exports = {
    getOptions,
    getAll,
    getById,
    create,
    update,
    updateTahapan,
    addPembahasan,
    deletePembahasan,
    submitHarmonisasi,
    addPersetujuan,
    updatePersetujuanStatus,
    deletePersetujuan,
    tetapkanDanPublikasikan,
    downloadFilePengajuan,
    remove,
};

