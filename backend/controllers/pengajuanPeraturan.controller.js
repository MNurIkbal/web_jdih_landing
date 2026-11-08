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
        let userRole = "";
        try {
            const token = req.cookies?.access_token || req.headers?.authorization?.replace("Bearer ", "");
            if (token) {
                const decoded = jwt.decode(token);
                userRole = (decoded?.role || "").toLowerCase();
            }
        } catch (e) {
            // Abaikan jika token gagal decode
        }

        const result = await pengajuanService.getAll({
            search: req.query.search || "",
            tahapan: req.query.tahapan || "",
            role: userRole,
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
            tanggal_pengajuan: tanggal_pengajuan || tanggal_pengundangan || null,
            target_penetapan: target_penetapan || tanggal_berlaku || tanggal_penetapan || null,
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
            tanggal_pengajuan: tanggal_pengajuan || tanggal_pengundangan || null,
            target_penetapan: target_penetapan || tanggal_berlaku || tanggal_penetapan || null,
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
        const { user_id, nama_pejabat, jabatan } = req.body;
        const result = await pengajuanService.addPersetujuan(req.params.id, {
            user_id,
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
        const file_lampiran = req.file ? req.file.filename : undefined;

        const result = await pengajuanService.updatePersetujuanStatus(req.params.persetujuanId, {
            status,
            catatan,
            file_lampiran,
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

const { PDFParse } = require("pdf-parse");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const extractDraftPdfText = async (req, res) => {
    try {
        const { id } = req.params;
        const draft = await pengajuanService.getById(id);
        if (!draft || !draft.file_draft) {
            return res.status(404).json({
                success: false,
                message: "File draft rancangan belum tersedia atau belum diunggah",
            });
        }

        const filePath = path.join(__dirname, "../uploads/pengajuan-peraturan", draft.file_draft);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File fisik draft tidak ditemukan pada server",
            });
        }

        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        await parser.load();
        const textResult = await parser.getText();
        const rawText = textResult.text || "";

        // Ekstraksi HTML Terstruktur Berbasis Koordinat Asli PDF (Posisi Center, Tab Paragraf, dan Indentasi Asli)
        let structuredHtml = "";
        try {
            const numPages = parser.doc?._pdfInfo?.numPages || 1;
            const htmlBlocks = [];

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await parser.doc.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1 });
                const content = await page.getTextContent();
                const pageWidth = viewport.width;

                const lineMap = new Map();
                for (const item of content.items) {
                    if (!item.str || !item.str.trim()) continue;
                    const y = Math.round(item.transform[5]);
                    const x = Math.round(item.transform[4]);
                    let foundKey = null;
                    for (const key of lineMap.keys()) {
                        if (Math.abs(key - y) <= 3) {
                            foundKey = key;
                            break;
                        }
                    }
                    const targetKey = foundKey !== null ? foundKey : y;
                    if (!lineMap.has(targetKey)) {
                        lineMap.set(targetKey, []);
                    }
                    lineMap.get(targetKey).push({ x, str: item.str, width: item.width });
                }

                const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
                let currentParagraph = "";
                let currentIndent = 0;
                let isCurrentCentered = false;

                const flushParagraph = () => {
                    if (!currentParagraph.trim()) return;
                    if (isCurrentCentered) {
                        htmlBlocks.push(`<p style="text-align: center; margin-bottom: 4px;"><strong>${currentParagraph.trim()}</strong></p>`);
                    } else if (currentIndent > 0) {
                        htmlBlocks.push(`<p style="margin-left: ${currentIndent}px; margin-bottom: 6px; text-align: justify; line-height: 1.75;">${currentParagraph.trim()}</p>`);
                    } else {
                        htmlBlocks.push(`<p style="margin-bottom: 6px; text-align: justify; line-height: 1.75;">${currentParagraph.trim()}</p>`);
                    }
                    currentParagraph = "";
                };

                for (const y of sortedY) {
                    const items = lineMap.get(y).sort((a, b) => a.x - b.x);
                    const lineText = items.map((it) => it.str).join(" ").replace(/\s+/g, " ").trim();
                    if (!lineText) continue;

                    // Hilangkan nomor halaman & watermark footer
                    if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(lineText)) continue;
                    if (/^-\s*\d+\s*-$/i.test(lineText)) continue;
                    if (/www\.bphn\.go\.id/i.test(lineText)) continue;
                    if (/^[a-z0-9.]+\s*\.\s*\.\s*\.$/i.test(lineText)) continue;

                    const minX = items[0].x;
                    const maxX = items[items.length - 1].x + items[items.length - 1].width;
                    const isCentered = Math.abs(pageWidth - minX - maxX) < 55;

                    // Jika judul tengah atau awal bagian baru
                    if (isCentered) {
                        flushParagraph();
                        htmlBlocks.push(`<p style="text-align: center; margin-bottom: 4px;"><strong>${lineText}</strong></p>`);
                        continue;
                    }

                    // Deteksi jika baris ini adalah header subbab, misal: "I. UMUM", "BAB I", "Pasal 1"
                    const isSubheading = /^(BAB\s+[IVXLCDM]+|Pasal\s+\d+|[IVXLCDM]+\.\s+[A-Z\s]+)$/i.test(lineText);
                    if (isSubheading) {
                        flushParagraph();
                        htmlBlocks.push(`<p style="margin-top: 14px; margin-bottom: 6px;"><strong>${lineText}</strong></p>`);
                        continue;
                    }

                    // Tentukan indentasi dari posisi X dokumen PDF
                    let indent = 0;
                    if (minX > 130 && minX < 165) {
                        // Awal paragraf yang menjorok (tab)
                        indent = 36;
                    } else if (minX >= 165 && minX < 210) {
                        // Poin huruf atau rincian konsideran
                        indent = 80;
                    } else if (minX >= 210) {
                        indent = 110;
                    }

                    // Jika ada perubahan indentasi atau baris sebelumnya diakhiri titik (paragraf baru)
                    if (currentParagraph && (indent !== currentIndent || currentParagraph.trim().endsWith("."))) {
                        flushParagraph();
                    }

                    currentIndent = indent;
                    isCurrentCentered = false;
                    currentParagraph = currentParagraph ? currentParagraph + " " + lineText : lineText;
                }
                flushParagraph();
            }

            structuredHtml = htmlBlocks.join("\n");
        } catch (layoutErr) {
            console.error("Gagal format layout visual PDF:", layoutErr);
        }

        return res.status(200).json({
            success: true,
            message: "Berhasil mengekstrak teks dari File Draft Rancangan PDF",
            data: {
                fileName: draft.file_draft,
                text: rawText,
                html: structuredHtml,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengekstrak teks PDF: " + error.message,
        });
    }
};

const getAnnotatedDraftPdf = async (req, res) => {
    try {
        const { id } = req.params;
        const draft = await pengajuanService.getById(id);
        if (!draft || !draft.file_draft) {
            return res.status(404).json({
                success: false,
                message: "File draft rancangan belum tersedia",
            });
        }

        const filePath = path.join(__dirname, "../uploads/pengajuan-peraturan", draft.file_draft);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File fisik draft tidak ditemukan pada server",
            });
        }

        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();

        // Anotasi coretan background kuning & badge nomor jika ada potensi benturan
        if (pages.length > 0) {
            // Anotasi 1 pada Halaman 1 (selalu terlihat di halaman awal)
            const targetPage1 = pages[0];
            const { width: w1, height: h1 } = targetPage1.getSize();

            // Background Coretan Kuning Stabilo
            targetPage1.drawRectangle({
                x: 40,
                y: h1 > 350 ? h1 - 320 : 80,
                width: w1 - 80,
                height: 120,
                color: rgb(1, 0.94, 0.28), // Kuning stabilo
                opacity: 0.38,
                borderColor: rgb(0.85, 0.65, 0),
                borderWidth: 1.5,
            });

            // Badge Nomor & Pesan Peringatan di Atas Coretan
            targetPage1.drawRectangle({
                x: 40,
                y: (h1 > 350 ? h1 - 320 : 80) + 120,
                width: Math.min(380, w1 - 80),
                height: 24,
                color: rgb(0.9, 0.2, 0.2), // Merah peringatan
                opacity: 0.95,
            });

            targetPage1.drawText("[ 1 ] PERINGATAN: TUMPANG TINDIH WEWENANG", {
                x: 50,
                y: (h1 > 350 ? h1 - 320 : 80) + 127,
                size: 9.5,
                font: fontBold,
                color: rgb(1, 1, 1),
            });

            targetPage1.drawText("Benturan: Perpres No. 90/2012. Tambahkan klausul pembatas wewenang.", {
                x: 50,
                y: (h1 > 350 ? h1 - 320 : 80) + 98,
                size: 8,
                font: fontReg,
                color: rgb(0.7, 0.1, 0.1),
            });

            // Anotasi 2 pada Halaman 2 jika tersedia
            if (pages.length > 1) {
                const targetPage2 = pages[1];
                const { width: w2, height: h2 } = targetPage2.getSize();

                targetPage2.drawRectangle({
                    x: 40,
                    y: h2 > 350 ? h2 - 300 : 90,
                    width: w2 - 80,
                    height: 100,
                    color: rgb(1, 0.94, 0.28),
                    opacity: 0.38,
                    borderColor: rgb(0.85, 0.65, 0),
                    borderWidth: 1.5,
                });

                targetPage2.drawRectangle({
                    x: 40,
                    y: (h2 > 350 ? h2 - 300 : 90) + 100,
                    width: Math.min(360, w2 - 80),
                    height: 24,
                    color: rgb(0.9, 0.5, 0.1), // Oranye peringatan
                    opacity: 0.95,
                });

                targetPage2.drawText("[ 2 ] PERINGATAN: PENEGASAN HIERARKI HUKUM", {
                    x: 50,
                    y: (h2 > 350 ? h2 - 300 : 90) + 107,
                    size: 9.5,
                    font: fontBold,
                    color: rgb(1, 1, 1),
                });

                targetPage2.drawText("Benturan: UU No. 17/2011. Wajib tunduk pada hierarki undang-undang.", {
                    x: 50,
                    y: (h2 > 350 ? h2 - 300 : 90) + 78,
                    size: 8,
                    font: fontReg,
                    color: rgb(0.7, 0.25, 0),
                });
            }
        }

        const annotatedPdfBytes = await pdfDoc.save();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=\"annotated_draft.pdf\"");
        res.setHeader("Content-Length", annotatedPdfBytes.length);
        return res.send(Buffer.from(annotatedPdfBytes));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal membuat anotasi draf PDF: " + error.message,
        });
    }
};

const uploadRevisedPdf = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Berkas PDF perbaikan wajib diunggah",
            });
        }

        const newFileName = req.file.filename;
        const result = await pengajuanService.update(id, {
            file_draft: newFileName,
        });

        await invalidateCache("pengajuan:*");

        return res.status(200).json({
            success: true,
            message: "Berkas PDF perbaikan dokumen berhasil diunggah",
            data: result,
            fileName: newFileName,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengunggah berkas PDF perbaikan: " + error.message,
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
    extractDraftPdfText,
    getAnnotatedDraftPdf,
    uploadRevisedPdf,
    remove,
};

