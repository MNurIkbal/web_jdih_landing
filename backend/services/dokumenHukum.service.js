const dokumenHukumRepository =
    require("../repositories/dokumenHukum.repository");

const getAll = async ({
    search = "",
    page = 1,
    size = 10,
} = {}) => {
    page = Number(page);
    size = Number(size);

    if (
        !Number.isInteger(page) ||
        page < 1
    ) {
        page = 1;
    }

    if (
        !Number.isInteger(size) ||
        size < 1
    ) {
        size = 10;
    }

    if (size > 100) {
        size = 100;
    }

    const result =
        await dokumenHukumRepository.findAll({
            search,
            page,
            size,
        });

    const totalPages =
        Math.ceil(
            result.total / size
        );

    const backendUrl =
        process.env.APP_BACKEND_URL ||
        "https://jdih-be.asiasistem.com";

    const fileBaseUrl =
        `${backendUrl.replace(
            /\/$/,
            ""
        )}/uploads/dokumen-hukum`;

    const data =
        result.data.map((item) => ({
            ...item,

            file_abstrak:
                item.file_abstrak
                    ? `${fileBaseUrl}/${item.file_abstrak}`
                    : null,

            file_dokumen:
                item.file_dokumen
                    ? `${fileBaseUrl}/${item.file_dokumen}`
                    : null,
        }));

    return {
        data,

        pagination: {
            page,
            size,
            total: result.total,
            totalPages,
        },
    };
};

const getById = async (id) => {
    const result =
        await dokumenHukumRepository.findById(
            id
        );

    if (!result) {
        throw new Error(
            "Dokumen hukum tidak ditemukan"
        );
    }

    const backendUrl =
        process.env.APP_BACKEND_URL ||
        "https://jdih-be.asiasistem.com";

    const fileBaseUrl =
        `${backendUrl.replace(
            /\/$/,
            ""
        )}/uploads/dokumen-hukum`;

    return {
        ...result,

        file_abstrak:
            result.file_abstrak
                ? `${fileBaseUrl}/${result.file_abstrak}`
                : null,

        file_dokumen:
            result.file_dokumen
                ? `${fileBaseUrl}/${result.file_dokumen}`
                : null,
    };
};

const create = async ({
    judul,
    kategori,
    nomor,
    tahun,
    file_abstrak = null,
    file_dokumen = null,
    bidang = null,
    tipe_dokumen = null,
    tempat_penetapan = null,
    tanggal_penetapan = null,
    tanggal_pengundangan = null,
    tanggal_berlaku = null,
    sumber = null,
    subject = null,
    status,
}) => {
    if (!judul?.trim()) {
        throw new Error("Judul wajib diisi");
    }

    if (!kategori?.trim()) {
        throw new Error("Kategori wajib diisi");
    }

    if (!nomor?.trim()) {
        throw new Error("Nomor wajib diisi");
    }

    if (
        tahun === undefined ||
        tahun === null ||
        String(tahun).trim() === ""
    ) {
        throw new Error("Tahun wajib diisi");
    }

    if (!bidang?.trim()) {
        throw new Error("Bidang wajib diisi");
    }

    if (!tanggal_penetapan?.trim()) {
        throw new Error("Tanggal penetapan wajib diisi");
    }

    if (!tanggal_pengundangan?.trim()) {
        throw new Error("Tanggal pengundangan wajib diisi");
    }

    if (!tanggal_berlaku?.trim()) {
        throw new Error("Tanggal berlaku wajib diisi");
    }

    if (!file_dokumen) {
        throw new Error("File dokumen wajib diisi");
    }

    if (status === undefined || status === null || status === "") {
        throw new Error("Status wajib dipilih");
    }

    const tahunNumber = Number(tahun);

    if (!Number.isInteger(tahunNumber)) {
        throw new Error("Tahun harus berupa angka");
    }

    return await dokumenHukumRepository.create({
        judul: judul.trim(),
        kategori: kategori.trim(),
        nomor: nomor.trim(),
        tahun: tahunNumber,
        file_abstrak: file_abstrak || null,
        file_dokumen,
        bidang: bidang.trim(),
        tipe_dokumen: tipe_dokumen?.trim() || null,
        tempat_penetapan: tempat_penetapan?.trim() || null,
        tanggal_penetapan: tanggal_penetapan.trim(),
        tanggal_pengundangan: tanggal_pengundangan.trim(),
        tanggal_berlaku: tanggal_berlaku.trim(),
        sumber: sumber?.trim() || null,
        subject: subject?.trim() || null,
        status,
    });
};

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
    }
) => {
    const existing =
        await dokumenHukumRepository.findById(
            id
        );

    if (!existing) {
        throw new Error(
            "Dokumen hukum tidak ditemukan"
        );
    }

    if (
        !judul ||
        !judul.trim()
    ) {
        throw new Error(
            "Judul wajib diisi"
        );
    }

    if (
        !kategori ||
        !kategori.trim()
    ) {
        throw new Error(
            "Kategori wajib diisi"
        );
    }

    if (
        !nomor ||
        !nomor.trim()
    ) {
        throw new Error(
            "Nomor wajib diisi"
        );
    }

    if (
        tahun === undefined ||
        tahun === null ||
        tahun === ""
    ) {
        throw new Error(
            "Tahun wajib diisi"
        );
    }

    return await dokumenHukumRepository.update(
        id,
        {
            judul: judul.trim(),
            kategori: kategori.trim(),
            nomor: nomor.trim(),
            tahun: Number(tahun),

            file_abstrak:
                file_abstrak || null,

            file_dokumen:
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
        }
    );
};

const remove = async (id) => {
    const existing =
        await dokumenHukumRepository.findById(
            id
        );

    if (!existing) {
        throw new Error(
            "Dokumen hukum tidak ditemukan"
        );
    }

    await dokumenHukumRepository.softDelete(
        id
    );

    return {
        message:
            "Dokumen hukum berhasil dihapus",
    };
};

const incrementView = async (id) => {
    const result =
        await dokumenHukumRepository.incrementView(
            id
        );

    if (!result) {
        throw new Error(
            "Dokumen hukum tidak ditemukan"
        );
    }

    return result;
};

const incrementDownload = async (id) => {
    const result =
        await dokumenHukumRepository.incrementDownload(
            id
        );

    if (!result) {
        throw new Error(
            "Dokumen hukum tidak ditemukan"
        );
    }

    return result;
};

const getSummary = async () => {
    const data = await dokumenHukumRepository.getSummary();

    return {
        produk_hukum: Number(data.produk_hukum),
        peraturan: Number(data.peraturan),
        perundang_undangan: Number(data.perundang_undangan),
        keputusan: Number(data.keputusan),
    };
};

const getList = async () => {
    const data = await dokumenHukumRepository.getList();

    return {
        data,
        total: data.length,
    };
};

const getAllWeb = async ({
    search = "",
    page = 1,
    size = 10,
    kategori = "",
    tahun = "",
    bidang = "",
} = {}) => {
    const result = await dokumenHukumRepository.findAllWeb({
        search,
        page,
        size,
        kategori,
        tahun,
        bidang,
    });

    return result;
};

const findRelated = async (id) => {
    return await dokumenHukumRepository.findRelated(id);
};

const serviceDownload = async (dokumenId) => {
    if (!dokumenId) {
        throw new Error("ID dokumen tidak ditemukan");
    }

    const result =
        await dokumenHukumRepository.dynamisDownload(
            dokumenId
        );

    if (!result) {
        throw new Error("Dokumen hukum tidak ditemukan");
    }

    return result;
};

const servicePreview = async (dokumenId) => {
    if (!dokumenId) {
        throw new Error("ID dokumen tidak ditemukan");
    }

    const result =
        await dokumenHukumRepository.dinamisPreview(
            dokumenId
        );

    if (!result) {
        throw new Error("Dokumen hukum tidak ditemukan");
    }

    return result;
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
    findRelated,
    serviceDownload,
    servicePreview
};