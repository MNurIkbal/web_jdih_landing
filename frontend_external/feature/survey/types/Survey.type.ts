export interface SurveyPertanyaan {
  survey_pertanyaan_id: number;
  pertanyaan: string;
  status: boolean;
  urutan: number;
  tipe_survey?: "layanan" | "dokumen";
  created_at?: string;
  updated_at?: string;
}

export interface SurveyPertanyaanRequest {
  pertanyaan: string;
  status?: boolean;
  urutan?: number;
  tipe_survey?: "layanan" | "dokumen";
}

export interface SurveyJawabanSubmission {
  survey_pertanyaan_id: number;
  jawaban: "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | "Kurang Sekali";
  dokumen_hukum_id?: number | null;
}

export interface SurveyStatistik {
  tipe_survey?: "layanan" | "dokumen";
  totalResponden: number;
  rataRataSkor: number;
  persentaseKepuasan: number;
  distribusiJawaban: {
    "Sangat Baik": number;
    "Baik": number;
    "Cukup": number;
    "Kurang": number;
    "Kurang Sekali": number;
  };
  perPertanyaan: {
    survey_pertanyaan_id: number;
    pertanyaan: string;
    tipe_survey?: string;
    total_jawaban: number;
    rata_rata: number;
    sangat_baik: number;
    baik: number;
    cukup: number;
    kurang: number;
    kurang_sekali: number;
  }[];
}
