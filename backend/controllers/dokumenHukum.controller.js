const dokumenHukumService =
    require("../services/dokumenHukum.service");

const getAll = async (req, res) => {
    try {
        const result =
            await dokumenHukumService.getAll({
                search:
                    req.query.search || "",
                page:
                    req.query.page || 1,
                size:
                    req.query.size || 10,
            });

        return res.status(200).json({
            success: true,
            message:
                "Data dokumen hukum berhasil diambil",
            ...result,
        });

    } catch (error) {


        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getById = async (req, res) => {
    try {
        const result =
            await dokumenHukumService.getById(
                req.params.id
            );

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

// const create = async (req, res) => {
//     try {

//         const {
//             judul,
//             kategori,
//             nomor,
//             tahun,
//             bidang,
//             tipe_dokumen,
//             tempat_penetapan,
//             tanggal_penetapan,
//             tanggal_pengundangan,
//             tanggal_berlaku,
//             sumber,
//             subject,
//             status,
//         } = req.body;

//         const fileAbstrak =
//             req.files?.file_abstrak?.[0]?.filename || null;

//         const fileDokumen =
//             req.files?.file_dokumen?.[0]?.filename || null;



//         if (!judul) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Judul wajib diisi",
//             });
//         }

//         const result =
//             await dokumenHukumService.create({
//                 judul,
//                 kategori,
//                 nomor,
//                 tahun,
//                 file_abstrak: fileAbstrak,
//                 file_dokumen: fileDokumen,
//                 bidang,
//                 tipe_dokumen,
//                 tempat_penetapan,
//                 tanggal_penetapan,
//                 tanggal_pengundangan,
//                 tanggal_berlaku,
//                 sumber,
//                 subject,
//                 status,
//             });

//         return res.status(201).json({
//             success: true,
//             message: "Dokumen hukum berhasil dibuat",
//             data: result,
//         });

//     } catch (error) {


//         return res.status(400).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };
const create = async (req, res) => {
    try {
        const {
            judul,
            kategori,
            nomor,
            tahun,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subject,
            status,
        } = req.body;

        const fileAbstrak =
            req.files?.file_abstrak?.[0]?.filename ?? null;

        const fileDokumen =
            req.files?.file_dokumen?.[0]?.filename ?? null;

        if (!judul?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Judul wajib diisi",
            });
        }

        if (!kategori?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Kategori wajib dipilih",
            });
        }

        if (!nomor?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Nomor wajib diisi",
            });
        }

        if (!tahun?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tahun wajib diisi",
            });
        }

        if (!bidang?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Bidang wajib dipilih",
            });
        }

        if (!tanggal_penetapan?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tanggal penetapan wajib diisi",
            });
        }

        if (!tanggal_pengundangan?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tanggal pengundangan wajib diisi",
            });
        }

        if (!tanggal_berlaku?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tanggal berlaku wajib diisi",
            });
        }

        if (!status?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Status wajib dipilih",
            });
        }

        if (!fileDokumen) {
            return res.status(400).json({
                success: false,
                message: "File dokumen wajib diisi",
            });
        }

        const result = await dokumenHukumService.create({
            judul: judul.trim(),
            kategori: kategori.trim(),
            nomor: nomor.trim(),
            tahun: tahun.trim(),
            bidang: bidang.trim(),
            tipe_dokumen: tipe_dokumen?.trim() || null,
            tempat_penetapan: tempat_penetapan?.trim() || null,
            sumber: sumber?.trim() || null,
            subject: subject?.trim() || null,

            file_abstrak: fileAbstrak,
            file_dokumen: fileDokumen,

            tanggal_penetapan: tanggal_penetapan.trim(),
            tanggal_pengundangan: tanggal_pengundangan.trim(),
            tanggal_berlaku: tanggal_berlaku.trim(),
            status: status.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Dokumen hukum berhasil dibuat",
            data: result,
        });
    } catch (error) {
        console.error("Create dokumen hukum error:", error);

        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Gagal membuat dokumen hukum",
        });
    }
};
const update = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            judul,
            kategori,
            nomor,
            tahun,
            bidang,
            tipe_dokumen,
            tempat_penetapan,
            tanggal_penetapan,
            tanggal_pengundangan,
            tanggal_berlaku,
            sumber,
            subject,
            status,
        } = req.body || {};

        const file_abstrak =
            req.files?.file_abstrak?.[0]
                ?.filename || null;

        const file_dokumen =
            req.files?.file_dokumen?.[0]
                ?.filename || null;

        const result =
            await dokumenHukumService.update(
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
                    status
                }
            );

        return res.status(200).json({
            success: true,
            message:
                "Dokumen hukum berhasil diperbarui",
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
        const result =
            await dokumenHukumService.remove(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const incrementView = async (req, res) => {
    try {
        const result =
            await dokumenHukumService.incrementView(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const incrementDownload = async (
    req,
    res
) => {
    try {
        const result =
            await dokumenHukumService.incrementDownload(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getSummary = async (req, res) => {
    try {
        const data = await dokumenHukumService.getSummary();

        return res.status(200).json({
            success: true,
            message: "Summary dokumen hukum berhasil diambil",
            data,
        });
    } catch (error) {


        return res.status(500).json({
            success: false,
            message: "Gagal mengambil summary dokumen hukum",
            error: error.message,
        });
    }
};


const getList = async (req, res) => {
    try {
        const result = await dokumenHukumService.getList();

        return res.status(200).json({
            success: true,
            message: "Data peraturan berhasil diambil",
            data: result.data,
            total: result.total,
        });
    } catch (error) {


        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data peraturan",
            error: error.message,
        });
    }
};

const getAllWeb = async (req, res) => {
    try {
        const {
            search = "",
            page = 1,
            size = 10,
            kategori = "",
            tahun = "",
            bidang = "",
        } = req.query;

        const result = await dokumenHukumService.getAllWeb({
            search,
            page,
            size,
            kategori,
            tahun,
            bidang,
        });

        return res.status(200).json({
            success: true,
            message: "Data dokumen hukum berhasil diambil",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil data dokumen hukum",
            error: error.message,
        });
    }
};

const getRelated = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await dokumenHukumService.findRelated(id);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil dokumen hukum",
        });
    }
};


const controlDownload = async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await dokumenHukumService.serviceDownload(id);

        return res.status(200).json({
            success: true,
            message: "Jumlah download berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        console.error("incrementDownload:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Gagal memperbarui jumlah download",
        });
    }
};

const controlPreview = async (req, res) => {
    try {
        const { id } = req.params;

        const result =
            await dokumenHukumService.servicePreview(id);

        return res.status(200).json({
            success: true,
            message: "Jumlah preview berhasil diperbarui",
            data: result,
        });
    } catch (error) {
        console.error("incrementPreview:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Gagal memperbarui jumlah preview",
        });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    incrementView,
    incrementDownload,
    getSummary,
    getList,
    getAllWeb,
    getRelated,
    controlDownload,
    controlPreview
};