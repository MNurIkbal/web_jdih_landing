const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(process.cwd(), "uploads", "pengajuan-peraturan");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const prefix = file.fieldname || "doc";
        const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedExts = [".pdf", ".doc", ".docx", ".rtf", ".odt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("File dokumen harus berformat PDF atau DOC/DOCX"), false);
    }
};

const pengajuanPeraturanUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

module.exports = pengajuanPeraturanUpload;

