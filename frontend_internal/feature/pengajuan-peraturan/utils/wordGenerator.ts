import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";
import { PengajuanPeraturan } from "../types/PengajuanPeraturan.type";

/**
 * Generate dan download dokumen Word (.docx) resmi sesuai template standar perundang-undangan:
 * - JUDUL DOKUMEN KAPITAL TEBAL DI TENGAH
 * - NOMOR & TAHUN
 * - TENTANG
 * - JUDUL REGULASI
 * - DENGAN RAHMAT TUHAN YANG MAHA ESA
 * - JABATAN PENETAP (PRESIDEN / KEPALA BADAN INTELIJEN NEGARA)
 * - Menimbang (huruf a, b, c...)
 * - Mengingat (angka 1, 2, 3...)
 * - MEMUTUSKAN / Menetapkan
 * - Batang Tubuh (BAB & PASAL-PASAL)
 * - Pengundangan, Tanggal Penetapan, & Lembaran Negara
 */
export async function generatePeraturanWord(draft: PengajuanPeraturan, draftContentText?: string) {
  const kategori = (draft.kategori || "UNDANG-UNDANG").toUpperCase();
  const nomor = draft.nomor_rancangan || draft.nomor_penetapan || "[NOMOR]";
  const tahun = draft.tahun || new Date().getFullYear();
  const judul = (draft.judul || "RANCANGAN PERATURAN").toUpperCase();
  const penetap = kategori.includes("UNDANG")
    ? "PRESIDEN REPUBLIK INDONESIA"
    : "KEPALA BADAN INTELIJEN NEGARA";

  const dasarHukum = draft.dasar_hukum
    ? draft.dasar_hukum
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "Pasal 4 ayat (1) dan Pasal 20 Undang-Undang Dasar Negara Republik Indonesia Tahun 1945;",
        "Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara (Lembaran Negara Republik Indonesia Tahun 2011 Nomor 105);",
      ];

  const urgensi = draft.urgensi || draft.ringkasan
    ? (draft.urgensi || draft.ringkasan || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "bahwa untuk menjamin kepastian hukum dan efektivitas koordinasi intelijen negara, perlu menetapkan pengaturan yang komprehensif;",
        "bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, perlu menetapkan peraturan ini;",
      ];

  const paragraphs: Paragraph[] = [
    // Judul Utama Dokumen
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: kategori,
          bold: true,
          size: 26, // 13pt
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `NOMOR ${nomor} TAHUN ${tahun}`,
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "TENTANG",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: judul,
          bold: true,
          size: 26,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "DENGAN RAHMAT TUHAN YANG MAHA ESA",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: penetap + ",",
          bold: true,
          size: 24,
          font: "Bookman Old Style",
        }),
      ],
    }),

    // Menimbang
    new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [
        new TextRun({
          text: "Menimbang : ",
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    ...urgensi.map((u, i) => {
      const letter = String.fromCharCode(97 + i); // a, b, c...
      return new Paragraph({
        indent: { left: 720 },
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `${letter}. `,
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
          new TextRun({
            text: u.startsWith("bahwa") ? u : `bahwa ${u}`,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      });
    }),

    // Mengingat
    new Paragraph({
      spacing: { before: 180, after: 60 },
      children: [
        new TextRun({
          text: "Mengingat : ",
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    ...dasarHukum.map((dh, i) => {
      return new Paragraph({
        indent: { left: 720 },
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: `${i + 1}. `,
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
          new TextRun({
            text: dh,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      });
    }),

    // MEMUTUSKAN
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: "MEMUTUSKAN:",
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "Menetapkan : ",
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
        new TextRun({
          text: `${kategori} TENTANG ${judul}.`,
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
  ];

  // Batang Tubuh / Isi Pasal Rancangan (jika ada text AI atau default BAB)
  if (draftContentText) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "BATANG TUBUH RANCANGAN PERATURAN:",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      })
    );

    const lines = draftContentText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const isHeader =
        trimmed.startsWith("BAB ") ||
        trimmed.startsWith("Pasal ") ||
        trimmed.startsWith("Bagian ");
      paragraphs.push(
        new Paragraph({
          alignment: trimmed.startsWith("BAB ") ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: trimmed,
              bold: isHeader,
              font: "Bookman Old Style",
              size: 24,
            }),
          ],
        })
      );
    }
  } else {
    // Default struktur template peraturan standar
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 60 },
        children: [
          new TextRun({
            text: "BAB I\nKETENTUAN UMUM",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "Pasal 1",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "Dalam Peraturan ini yang dimaksud dengan:",
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        indent: { left: 720 },
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: "1. Badan Intelijen Negara yang selanjutnya disingkat BIN adalah alat negara yang menyelenggarakan fungsi Intelijen di dalam dan luar negeri.\n",
            font: "Bookman Old Style",
            size: 24,
          }),
          new TextRun({
            text: "2. Kepala Badan Intelijen Negara yang selanjutnya disebut Kepala BIN adalah pimpinan tertinggi Badan Intelijen Negara.",
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: "BAB II\nRUANG LINGKUP & PENYELENGGARAAN",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "Pasal 2",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: `Penyelenggaraan peraturan ini dilaksanakan dengan berpedoman pada asas kepastian hukum, profesionalitas, akuntabilitas, serta tidak bertentangan dengan ketentuan peraturan perundang-undangan yang lebih tinggi.`,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 60 },
        children: [
          new TextRun({
            text: "BAB III\nKETENTUAN PENUTUP",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "Pasal 3",
            bold: true,
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: "Peraturan ini mulai berlaku pada tanggal diundangkan.",
            font: "Bookman Old Style",
            size: 24,
          }),
        ],
      })
    );
  }

  // Tanda Tangan / Penetapan Penutup
  paragraphs.push(
    new Paragraph({
      spacing: { before: 300, after: 80 },
      children: [
        new TextRun({
          text: "Agar setiap orang mengetahuinya, memerintahkan pengundangan Peraturan ini dengan penempatannya dalam Berita Negara / Lembaran Negara Republik Indonesia.",
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 240, after: 40 },
      children: [
        new TextRun({
          text: `Ditetapkan di ${draft.tempat_penetapan || "Jakarta"}`,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: `pada tanggal ${draft.tanggal_penetapan ? draft.tanggal_penetapan.split("T")[0] : new Date().toISOString().split("T")[0]}`,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: penetap + ",\n\n\nttd.\n\n\n",
          bold: true,
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: draft.penanggung_jawab || "[NAMA PEJABAT PENETAP]",
          bold: true,
          underline: { type: UnderlineType.SINGLE },
          font: "Bookman Old Style",
          size: 24,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${draft.judul || "Rancangan_Peraturan"}_Template_Resmi.docx`
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");

  saveAs(blob, safeFilename);
}

