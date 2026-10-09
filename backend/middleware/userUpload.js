const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ============================================================
// DIRECTORY
// ============================================================

const uploadPath =
    path.join(
        process.cwd(),
        "uploads",
        "users"
    );


// Buat folder jika belum ada
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(
        uploadPath,
        {
            recursive: true,
        }
    );
}


// ============================================================
// STORAGE
// ============================================================

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                uploadPath
            );
        },

        filename: (
            req,
            file,
            cb
        ) => {

            const ext =
                path.extname(
                    file.originalname
                );

            const filename =
                `user-${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${ext}`;

            cb(
                null,
                filename
            );
        },
    });


// ============================================================
// FILTER
// ============================================================

const fileFilter =
    (
        req,
        file,
        cb
    ) => {

        const allowed =
            [
                "image/jpeg",
                "image/png",
                "image/webp",
            ];

        if (
            allowed.includes(
                file.mimetype
            )
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Format foto harus JPG, PNG, atau WEBP"
                )
            );
        }
    };


// ============================================================
// UPLOAD
// ============================================================

const userUpload =
    multer({
        storage,
        fileFilter,
        limits: {
            fileSize:
                2 * 1024 * 1024,
        },
    });


module.exports = userUpload;