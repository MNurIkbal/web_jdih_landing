const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const pdfToMarkdown = async (filePath) => {
  if (!filePath) {
    throw new Error("File PDF tidak ditemukan");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File PDF tidak ditemukan: ${filePath}`);
  }

  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  let text = result.text || "";

  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const markdown = [];

  for (const line of lines) {
    if (/^BAB\s+[IVXLCDM\d]+/i.test(line)) {
      markdown.push(`## ${line}`);
      continue;
    }

    if (/^Pasal\s+\d+/i.test(line)) {
      markdown.push(`### ${line}`);
      continue;
    }

    if (/^\(\d+\)/.test(line)) {
      markdown.push(line);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      markdown.push(line);
      continue;
    }

    if (/^[a-z]\.\s+/i.test(line)) {
      markdown.push(`- ${line}`);
      continue;
    }

    if (line.toUpperCase() === "ABSTRAK") {
      markdown.push(`# ${line}`);
      continue;
    }

    markdown.push(line);
  }

  await parser.destroy();

  return markdown.join("\n\n");
};

module.exports = pdfToMarkdown;