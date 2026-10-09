const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pastikan folder upload tersedia
const uploadDir = path.join(
    process.cwd(),
    "uploads",
    "sliders"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true,
    });
}

// Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        const filename =
            `slider-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        cb(null, filename);
    },
});

// Validasi extension + mimetype
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
    ];

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (
        allowedExtensions.includes(ext) &&
        allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format gambar harus JPG, JPEG, atau PNG"
            ),
            false
        );
    }
};

// Max 3 MB
const upload = multer({
    storage,

    limits: {
        fileSize: 3 * 1024 * 1024,
    },

    fileFilter,
});

module.exports = upload;