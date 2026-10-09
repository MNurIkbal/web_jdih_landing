const fs = require("fs");
const pdfParse = require("pdf-parse");

const pdfToText = async (filePath) => {
    const buffer = fs.readFileSync(filePath);

    const result = await pdfParse(buffer);

    return result.text.trim();
};

module.exports = pdfToText; 