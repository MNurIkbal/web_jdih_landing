const pengajuanService = require("../services/pengajuanPeraturan.service");

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
        const result = await pengajuanService.getById(req.params.id);
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
            nomor_rancangan,
            tahun,
            pemrakarsa,
            penanggung_jawab,
            tanggal_pengajuan,
            target_penetapan,
            ringkasan,
            catatan_revisi,
        } = req.body;

        const fileDraft = req.files?.file_draft?.[0]?.filename || null;
        const fileNaskahAkademik = req.files?.file_naskah_akademik?.[0]?.filename || null;

        const result = await pengajuanService.create({
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
            file_draft: fileDraft,
            file_naskah_akademik: fileNaskahAkademik,
        });

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

// Update Tahapan umum
const updateTahapan = async (req, res) => {
    try {
        const { tahapan, status } = req.body;
        const result = await pengajuanService.updateTahap(req.params.id, tahapan, status);
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
        const { judul_rapat, tanggal_rapat, keterangan } = req.body;
        const fileNotulensi = req.file?.filename || null;

        const result = await pengajuanService.addPembahasan(req.params.id, {
            judul_rapat,
            tanggal_rapat,
            file_notulensi: fileNotulensi,
            keterangan,
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

module.exports = {
    getAll,
    getById,
    create,
    updateTahapan,
    addPembahasan,
    deletePembahasan,
    submitHarmonisasi,
    addPersetujuan,
    updatePersetujuanStatus,
    deletePersetujuan,
    tetapkanDanPublikasikan,
    remove,
};

