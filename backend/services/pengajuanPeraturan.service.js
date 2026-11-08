const pengajuanRepo = require("../repositories/pengajuanPeraturan.repository");

const getOptions = async (params) => {
    return await pengajuanRepo.getOptions(params);
};

const getAll = async (params) => {
    return await pengajuanRepo.findAll(params);
};

const getById = async (id) => {
    const data = await pengajuanRepo.findById(id);
    if (!data) throw new Error("Pengajuan peraturan tidak ditemukan");
    return data;
};

const create = async (data) => {
    if (!data.judul) throw new Error("Judul rancangan peraturan wajib diisi");
    return await pengajuanRepo.createDraft(data);
};

const update = async (id, data) => {
    if (!id) throw new Error("ID pengajuan wajib diisi");
    const existing = await pengajuanRepo.findById(id);
    if (!existing) throw new Error("Pengajuan peraturan tidak ditemukan");
    return await pengajuanRepo.updateDraft(id, data);
};

const updateTahap = async (id, tahapan, status, catatan_verifikasi, status_penunjukan_pejabat) => {
    return await pengajuanRepo.updateTahapan(id, tahapan, status, catatan_verifikasi, status_penunjukan_pejabat);
};

const addPembahasan = async (draftId, data) => {
    if (!data.judul_rapat) throw new Error("Judul rapat wajib diisi");
    return await pengajuanRepo.addPembahasan(draftId, data);
};

const deletePembahasan = async (id) => {
    return await pengajuanRepo.removePembahasan(id);
};

const submitHarmonisasi = async (draftId, data) => {
    return await pengajuanRepo.updateHarmonisasi(draftId, data);
};

const addPersetujuan = async (draftId, data) => {
    if (!data.nama_pejabat) {
        throw new Error("Nama pejabat wajib diisi");
    }
    return await pengajuanRepo.addPersetujuanPejabat(draftId, data);
};

const updatePersetujuanStatus = async (persetujuanId, data) => {
    return await pengajuanRepo.updatePersetujuanStatus(persetujuanId, data);
};

const deletePersetujuan = async (id) => {
    return await pengajuanRepo.removePersetujuan(id);
};

const tetapkanDanPublikasikan = async (draftId, data) => {
    if (!data.nomor_penetapan) {
        throw new Error("Nomor penetapan resmi wajib diisi");
    }
    return await pengajuanRepo.penetapanDanPublikasi(draftId, data);
};

const remove = async (id) => {
    return await pengajuanRepo.softDeleteDraft(id);
};

module.exports = {
    getOptions,
    getAll,
    getById,
    create,
    update,
    updateTahap,
    addPembahasan,
    deletePembahasan,
    submitHarmonisasi,
    addPersetujuan,
    updatePersetujuanStatus,
    deletePersetujuan,
    tetapkanDanPublikasikan,
    remove,
};

