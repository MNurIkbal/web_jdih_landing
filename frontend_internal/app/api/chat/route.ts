import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  message?: string;
  conversationId?: string;
}

interface AcsApiResponse {
  answer?: string;
  message?: string;
  response?: string;
  reply?: string;
  insights?: string[];
  sample_data?: unknown[];
  query?: string;
  intent?: string;
  conversationStats?: Record<string, unknown>;
  [key: string]: unknown;
}

const ACS_API_URL =
  process.env.ACS_API_URL || "http://localhost:3001/api/integration/chat/ss";

const ACS_API_KEY = process.env.ACS_API_KEY;
const ACS_TIMEOUT_MS = Number(process.env.ACS_API_TIMEOUT_MS) || 30000;

export async function POST(req: NextRequest) {
  try {
    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Body request tidak valid (bukan JSON)" },
        { status: 400 },
      );
    }

    const message = body.message?.trim();
    const conversationId = body.conversationId?.trim();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message wajib diisi" },
        { status: 400 },
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "conversationId wajib diisi" },
        { status: 400 },
      );
    }

    if (!ACS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Konfigurasi ACS_API_KEY belum diatur pada environment server.",
        },
        { status: 500 },
      );
    }

    // Batasi pesan maksimal 4800 karakter untuk mencegah validation error 400 dari backend ACS
    const safeQuestion = message.length > 4800 ? message.slice(0, 4800) : message;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ACS_TIMEOUT_MS);

    let acsRes: Response;
    try {
      acsRes = await fetch(ACS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ACS_API_KEY,
        },
        body: JSON.stringify({
          question: safeQuestion,
          conversationId,
          divisionId: "Kepegawaian",
          isThinking: true,
        }),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      console.error("Koneksi ke backend ACS gagal:", err);
      return NextResponse.json(
        {
          success: false,
          error: "Gagal terhubung ke layanan AI backend ACS. Silakan coba kembali.",
        },
        { status: 502 },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!acsRes.ok) {
      const errText = await acsRes.text();
      console.error(`Backend ACS error (${acsRes.status}):`, errText);
      return NextResponse.json(
        {
          success: false,
          error: `Layanan AI backend ACS merespons dengan status ${acsRes.status}: ${errText.slice(0, 150)}`,
        },
        { status: acsRes.status },
      );
    }

    const acsData: AcsApiResponse = await acsRes.json();

    const aiMessage =
      acsData.answer ??
      acsData.message ??
      acsData.response ??
      acsData.reply ??
      JSON.stringify(acsData, null, 2);

    return NextResponse.json({
      success: true,
      message: aiMessage,
      query: acsData.query ?? null,
      intent: acsData.intent ?? null,
      insights: acsData.insights ?? [],
      sample_data: acsData.sample_data ?? [],
      conversationStats: acsData.conversationStats ?? null,
    });
  } catch (error: unknown) {
    console.error("Error pada route /api/chat:", error);
    const err = error instanceof Error ? error : new Error("Unknown error");
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
