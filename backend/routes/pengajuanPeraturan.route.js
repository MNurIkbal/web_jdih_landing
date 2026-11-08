const express = require("express");
const router = express.Router();
const pengajuanController = require("../controllers/pengajuanPeraturan.controller");
const upload = require("../middleware/pengajuanPeraturanUpload");
const { requireRole } = require("../middleware/rbacMiddleware");

router.get("/options", pengajuanController.getOptions);
router.get("/", pengajuanController.getAll);
router.get("/:id", pengajuanController.getById);
router.get("/:id/download-file/:type", pengajuanController.downloadFilePengajuan);

// Tahap 1: Pengajuan Baru (Khusus role pengguna saja)
router.post(
    "/",
    requireRole("pengguna"),
    upload.fields([
        { name: "file_draft", maxCount: 1 },
        { name: "file_dokumen", maxCount: 1 },
        { name: "file_naskah_akademik", maxCount: 1 },
        { name: "file_abstrak", maxCount: 1 },
    ]),
    pengajuanController.create
);

// Update Pengajuan Peraturan (Khusus role pengguna saja)
router.put(
    "/:id",
    requireRole("pengguna"),
    upload.fields([
        { name: "file_draft", maxCount: 1 },
        { name: "file_dokumen", maxCount: 1 },
        { name: "file_naskah_akademik", maxCount: 1 },
        { name: "file_abstrak", maxCount: 1 },
    ]),
    pengajuanController.update
);

// Update tahapan langsung jika dibutuhkan
router.put("/:id/tahapan", pengajuanController.updateTahapan);

// Tahap 2: Pembahasan (upload hasil rapat - Dibatasi hanya untuk pengguna/pemohon)
router.post(
    "/:id/pembahasan",
    requireRole("pengguna"),
    upload.single("file_notulensi"),
    pengajuanController.addPembahasan
);
router.delete("/pembahasan/:pembahasanId", requireRole("pengguna"), pengajuanController.deletePembahasan);

// Tahap 3: Harmonisasi (Khusus pengguna/pemohon)
router.post(
    "/:id/harmonisasi",
    requireRole("pengguna"),
    upload.single("file_harmonisasi"),
    pengajuanController.submitHarmonisasi
);

// Tahap 4: Persetujuan (multi-person approval checklist)
router.post("/:id/persetujuan", pengajuanController.addPersetujuan);
router.put("/persetujuan/:persetujuanId", pengajuanController.updatePersetujuanStatus);
router.delete("/persetujuan/:persetujuanId", pengajuanController.deletePersetujuan);

// Tahap 5: Penetapan & Publikasi ke dokumen_hukum internal
router.post(
    "/:id/penetapan",
    upload.single("file_dokumen_final"),
    pengajuanController.tetapkanDanPublikasikan
);

// Soft delete (Khusus role pengguna saja)
router.delete("/:id", requireRole("pengguna"), pengajuanController.remove);

module.exports = router;

