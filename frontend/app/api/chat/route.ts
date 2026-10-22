import { NextRequest, NextResponse } from "next/server";
import { getSmartFallbackResponse } from "@/lib/chat-fallback";

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
      // Backend ACS API key belum diatur, gunakan fallback cerdas
      const fallback = getSmartFallbackResponse(message);
      return NextResponse.json({
        success: true,
        message: fallback,
        isFallback: true,
        insights: [],
        sample_data: [],
      });
    }

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
          question: message,
          conversationId,
          divisionId: "Kepegawaian",
          isThinking: true,
        }),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      // Timeout atau network fetch error ke backend ACS -> gunakan fallback
      console.warn("Koneksi ke backend ACS error/timeout, menggunakan jawaban cadangan:", err);
      const fallback = getSmartFallbackResponse(message);
      return NextResponse.json({
        success: true,
        message: fallback,
        isFallback: true,
        insights: [],
        sample_data: [],
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!acsRes.ok) {
      console.warn(`Backend ACS merespons dengan status ${acsRes.status}, menggunakan jawaban cadangan.`);
      const fallback = getSmartFallbackResponse(message);
      return NextResponse.json({
        success: true,
        message: fallback,
        isFallback: true,
        insights: [],
        sample_data: [],
      });
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
    console.error("Error pada route /api/chat, beralih ke fallback:", error);
    // Jika masih ada parameter message dalam request, berikan fallback
    try {
      const fallback = getSmartFallbackResponse("umum");
      return NextResponse.json({
        success: true,
        message: fallback,
        isFallback: true,
      });
    } catch {
      const err = error instanceof Error ? error : new Error("Unknown error");
      return NextResponse.json(
        { success: false, error: err.message || "Internal Server Error" },
        { status: 500 },
      );
    }
  }
}
