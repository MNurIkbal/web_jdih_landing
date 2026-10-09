const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadPath = path.join(
    process.cwd(),
    "uploads",
    "dokumen-hukum"
);

// Pastikan folder tersedia
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
        recursive: true,
    });
}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        const ext = path.extname(
            file.originalname
        ).toLowerCase();

        const filename =
            `dokumen-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${ext}`;

        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {

    const fieldName = file.fieldname.trim();

    const allowedFields = [
        "file_abstrak",
        "file_dokumen",
    ];

    if (!allowedFields.includes(fieldName)) {
        return cb(
            new multer.MulterError(
                "LIMIT_UNEXPECTED_FILE",
                file.fieldname
            )
        );
    }

    if (
        file.mimetype !==
        "application/pdf"
    ) {
        return cb(
            new Error(
                "File harus berformat PDF"
            )
        );
    }

    cb(null, true);
};

const dokumenHukumUpload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 30 * 1024 * 1024,
        files: 2,
    },
});

module.exports = dokumenHukumUpload;