const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

/**
 * Apply watermark to a PDF buffer or file
 * @param {Buffer|string} inputPdf - Path to PDF file or PDF Buffer
 * @param {Object} options - Options
 * @param {string} [options.userName] - Nama yang download jika login (kosong jika tidak login)
 * @param {Date} [options.downloadDate] - Waktu download
 * @returns {Promise<Buffer>} - Modified PDF as Buffer
 */
async function applyWatermark(inputPdf, options = {}) {
    let pdfBytes;
    if (typeof inputPdf === "string") {
        pdfBytes = fs.readFileSync(inputPdf);
    } else {
        pdfBytes = inputPdf;
    }

    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const now = options.downloadDate || new Date();

    // Format Tanggal: "20 Januari 2026"
    const day = now.getDate();
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    // Format Jam: "09:55 WIB"
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeFormatted = `${hours}:${minutes} WIB`;

    const dateFormatted = `${day} ${month} ${year} ${timeFormatted}`;

    // Teks pengunduh: Jika login -> "Nama | Tanggal Jam", jika tidak login -> "Tanggal Jam"
    const rawUser = options.userName ? String(options.userName).trim() : "";
    let footerText = "";
    if (rawUser && rawUser !== "Pengguna JDIH BIN") {
        footerText = `${rawUser} | ${dateFormatted}`;
    } else {
        footerText = `${dateFormatted}`;
    }

    for (const page of pages) {
        const { width, height } = page.getSize();

        // 1. Watermark Tulisan JDIH BIN: Huruf Besar, Tulisan Miring (45 deg) di Tengah Besar
        const centerText = "JDIH BIN";
        const centerFontSize = Math.min(width, height) * 0.13; // Ukuran besar proporsional
        const textWidth = boldFont.widthOfTextAtSize(centerText, centerFontSize);
        const textHeight = boldFont.heightAtSize(centerFontSize);

        const angleInRadians = (45 * Math.PI) / 180;
        const centerX = width / 2;
        const centerY = height / 2;

        const xPos = centerX - (textWidth / 2) * Math.cos(angleInRadians) + (textHeight / 2) * Math.sin(angleInRadians);
        const yPos = centerY - (textWidth / 2) * Math.sin(angleInRadians) - (textHeight / 2) * Math.cos(angleInRadians);

        page.drawText(centerText, {
            x: xPos,
            y: yPos,
            size: centerFontSize,
            font: boldFont,
            color: rgb(0.35, 0.35, 0.35),
            opacity: 0.18,
            rotate: degrees(45),
        });

        // 2. Info Nama & Tanggal Jam Download: Posisi di POJOK KIRI BAWAH setiap halaman
        const footerFontSize = 9;
        const marginX = 25; // 25pt dari kiri
        const marginY = 18; // 18pt dari bawah

        page.drawText(footerText, {
            x: marginX,
            y: marginY,
            size: footerFontSize,
            font: regularFont,
            color: rgb(0.2, 0.2, 0.2),
            opacity: 0.75,
        });
    }

    const modifiedBytes = await pdfDoc.save();
    return Buffer.from(modifiedBytes);
}

module.exports = {
    applyWatermark,
};
