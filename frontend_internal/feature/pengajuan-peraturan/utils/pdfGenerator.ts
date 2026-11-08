import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PdfGenerateOptions {
  judul: string;
  nomor?: string;
  tahun?: number | string;
  kategori?: string;
  menimbang?: string;
  mengingat?: string;
  menetapkan?: string;
  batangTubuh?: string;
}

export async function generatePeraturanPdfBlob({
  judul,
  nomor,
  tahun,
  kategori = "PERATURAN BADAN INTELIJEN NEGARA",
  menimbang,
  mengingat,
  menetapkan,
  batangTubuh,
}: PdfGenerateOptions): Promise<{ blob: Blob; url: string }> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 60;
  const MARGIN_RIGHT = 60;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - 65;

  const checkNewPage = (neededSpace: number = 40) => {
    if (y - neededSpace < 60) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - 65;
    }
  };

  const wrapText = (text: string, font: any, size: number, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawCentered = (text: string, font: any, size: number) => {
    const lines = wrapText(text, font, size, CONTENT_WIDTH);
    for (const line of lines) {
      checkNewPage(size + 6);
      const textWidth = font.widthOfTextAtSize(line, size);
      const x = (PAGE_WIDTH - textWidth) / 2;
      page.drawText(line, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
      y -= size + 5;
    }
  };

  const drawParagraph = (
    label: string,
    body: string,
    fontLabel: any = fontBold,
    fontBody: any = fontRegular,
    size: number = 10.5
  ) => {
    checkNewPage(35);
    const labelWidth = fontLabel.widthOfTextAtSize(label, size);
    page.drawText(label, { x: MARGIN_LEFT, y, size, font: fontLabel, color: rgb(0.1, 0.1, 0.1) });

    const bodyX = MARGIN_LEFT + Math.max(labelWidth + 8, 85);
    const bodyWidth = PAGE_WIDTH - MARGIN_RIGHT - bodyX;

    const lines = wrapText(body, fontBody, size, bodyWidth);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) checkNewPage(size + 5);
      page.drawText(lines[i], { x: bodyX, y, size, font: fontBody, color: rgb(0.15, 0.15, 0.15) });
      y -= size + 4.5;
    }
    y -= 5;
  };

  // Header / Judul
  drawCentered("REPUBLIK INDONESIA", fontBold, 12);
  drawCentered((kategori || "PERATURAN").toUpperCase(), fontBold, 13);
  drawCentered(`NOMOR ${nomor || "..."} TAHUN ${tahun || new Date().getFullYear()}`, fontBold, 11);
  drawCentered("TENTANG", fontBold, 10);
  drawCentered(judul.toUpperCase(), fontBold, 11);

  y -= 10;
  drawCentered("DENGAN RAHMAT TUHAN YANG MAHA ESA", fontBold, 10);
  drawCentered("KEPALA BADAN INTELIJEN NEGARA,", fontBold, 10);
  y -= 12;

  // Menimbang
  const defaultMenimbang =
    menimbang ||
    `a. bahwa untuk menjamin kepastian hukum dan tata kelola regulasi yang selaras dengan peraturan perundang-undangan nasional;\nb. bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, perlu menetapkan ${judul};`;
  drawParagraph("Menimbang :", defaultMenimbang);

  // Mengingat
  const defaultMengingat =
    mengingat ||
    `1. Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara;\n2. Peraturan Presiden Nomor 90 Tahun 2012 tentang Badan Intelijen Negara;`;
  drawParagraph("Mengingat :", defaultMengingat);

  // Memutuskan / Menetapkan
  drawCentered("MEMUTUSKAN:", fontBold, 10.5);
  y -= 4;
  const defaultMenetapkan = menetapkan || judul.toUpperCase();
  drawParagraph("Menetapkan :", defaultMenetapkan);
  y -= 10;

  // Batang Tubuh (BAB & Pasal)
  const defaultBatangTubuh =
    batangTubuh ||
    `BAB I\nKETENTUAN UMUM\n\nPasal 1\nDalam Peraturan ini yang dimaksud dengan:\n1. Intelijen Negara adalah penyelenggara intelijen yang merupakan bagian integral dari sistem keamanan nasional.\n2. Badan Intelijen Negara yang selanjutnya disingkat BIN adalah lini terdepan intelijen nasional.\n\nBAB II\nRUANG LINGKUP DAN PELAKSANAAN\n\nPasal 2\n(1) Pelaksanaan kegiatan berpedoman pada prinsip legalitas, profesionalitas, dan akuntabilitas.\n(2) Ketentuan teknis diselenggarakan dengan memperhatikan keselarasan terhadap peraturan perundang-undangan yang lebih tinggi.\n\nBAB III\nKETENTUAN PENUTUP\n\nPasal 3\nPeraturan ini tidak mengurangi kewenangan koordinasi intelijen nasional sebagaimana ditetapkan dalam peraturan yang berlaku.\n\nPasal 4\nPeraturan ini mulai berlaku pada tanggal diundangkan.`;

  const paragraphs = defaultBatangTubuh.split("\n");
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) {
      y -= 6;
      continue;
    }

    if (trimmed.startsWith("BAB ") || trimmed.startsWith("Pasal ")) {
      checkNewPage(30);
      drawCentered(trimmed, fontBold, 10.5);
    } else if (trimmed === "KETENTUAN UMUM" || trimmed === "RUANG LINGKUP DAN PELAKSANAAN" || trimmed === "KETENTUAN PENUTUP" || trimmed === "PENUTUP") {
      drawCentered(trimmed, fontBold, 10);
      y -= 4;
    } else {
      checkNewPage(25);
      const lines = wrapText(trimmed, fontRegular, 10, CONTENT_WIDTH);
      for (const line of lines) {
        checkNewPage(14);
        page.drawText(line, { x: MARGIN_LEFT, y, size: 10, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
    }
  }

  // Tanda Tangan
  checkNewPage(90);
  y -= 15;
  const ttdX = PAGE_WIDTH - MARGIN_RIGHT - 180;
  page.drawText(`Ditetapkan di Jakarta`, { x: ttdX, y, size: 9.5, font: fontRegular });
  y -= 12;
  page.drawText(`pada tanggal ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, { x: ttdX, y, size: 9.5, font: fontRegular });
  y -= 15;
  page.drawText(`KEPALA BADAN INTELIJEN NEGARA,`, { x: ttdX, y, size: 9.5, font: fontBold });
  y -= 45;
  page.drawText(`[Tanda Tangan Elektronik]`, { x: ttdX, y, size: 9, font: fontItalic, color: rgb(0.5, 0.5, 0.5) });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}

