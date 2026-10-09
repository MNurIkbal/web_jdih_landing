"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Bot, Trash2, ArrowDown, Sparkles } from "lucide-react";
import rehypeRaw from "rehype-raw";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { ChatMessage } from "@/types/chat";
import { sendChatMessage } from "@/services/chat-service";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function nowTimestamp() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function newId() {
  return crypto.randomUUID();
}

/* =========================
   EMPTY STATE (WELCOME AI)
========================= */
const EmptyState = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const suggestions = [
    "Apa saja dasar hukum tugas Badan Intelijen Negara?",
    "Jelaskan UU Intelijen Negara secara ringkas",
    "Buatkan ringkasan regulasi keamanan nasional",
    "Apa peran BIN dalam sistem pertahanan negara?",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 ">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center mb-4 shadow-lg">
        <Sparkles size={26} />
      </div>

      <h2 className="text-lg font-semibold mb-1">Asisten AI JDIH Intelijen</h2>

      <p className="text-sm text-muted-foreground mb-4 max-w-md leading-relaxed">
        Sistem ini menyediakan informasi terkait{" "}
        <span className="font-medium text-foreground">
          Jaringan Dokumentasi dan Informasi Hukum
        </span>{" "}
        serta regulasi yang berkaitan dengan{" "}
        <span className="font-medium text-foreground">
          Badan Intelijen Negara (BIN)
        </span>
        .
      </p>

      <p className="text-xs text-muted-foreground mb-6">
        Silakan pilih pertanyaan atau ketik langsung di bawah ini.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item)}
            className="text-left text-sm p-3 rounded-xl border bg-muted hover:bg-primary hover:text-white transition"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

const AIMessageRenderer = ({ message }: { message: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-semibold mt-3 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed text-[14px] text-foreground">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        table: ({ children }) => (
          <div className="overflow-x-auto rounded-lg border mt-3 mb-3">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border px-3 py-2 bg-muted text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border px-3 py-2 align-top whitespace-pre-line">
            {children}
          </td>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
      }}
    >
      {message}
    </ReactMarkdown>
  );
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150" />
    <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-300" />
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
export default function AsistenAIContent() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showScroll, setShowScroll] = useState(false);

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  function cleanAIResponse(text: string) {
    return text
      .replace(/catatan[:\s\S]*$/i, "")
      .replace(/note[:\s\S]*$/i, "")
      .trim();
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    let id = localStorage.getItem("conversation-id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("conversation-id", id);
    }

    setConversationId(id);

    const saved = localStorage.getItem(`chat-${id}`);

    if (saved) {
      try {
        setConversation(JSON.parse(saved));
      } catch {
        setConversation([]);
      }
    }
  }, []);

  /* AUTO SAVE */
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let id = localStorage.getItem("conversation-id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("conversation-id", id);
    }

    setConversationId(id);

    const saved = localStorage.getItem(`chat-${id}`);

    if (saved) {
      try {
        setConversation(JSON.parse(saved));
      } catch {
        setConversation([]);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!conversationId || !isLoaded) return;

    localStorage.setItem(
      `chat-${conversationId}`,
      JSON.stringify(conversation),
    );
  }, [conversation, conversationId, isLoaded]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isTyping]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;

    setShowScroll(!isBottom);
  };

  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // lama
  // const handleSendMessage = useCallback(async () => {
  //   if (!message.trim() || !conversationId || isTyping) return;

  //   const userMsg: ChatMessage = {
  //     id: newId(),
  //     type: "user",
  //     message,
  //     timestamp: nowTimestamp(),
  //   };

  //   setConversation((prev) => [...prev, userMsg]);
  //   setMessage("");
  //   setIsTyping(true);

  //   try {
  //     const res = await sendChatMessage(message, conversationId);

  //     const aiMsg: ChatMessage = {
  //       id: newId(),
  //       type: "assistant",
  //       message: res.message ?? "",
  //       timestamp: nowTimestamp(),
  //     };

  //     setConversation((prev) => [...prev, aiMsg]);
  //   } catch {
  //     setConversation((prev) => [
  //       ...prev,
  //       {
  //         id: newId(),
  //         type: "assistant",
  //         message: "Terjadi error",
  //         timestamp: nowTimestamp(),
  //       },
  //     ]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // }, [message, conversationId]);

  function isValidContext(currentText: string): boolean {
    const current = currentText.toLowerCase().trim();

    const legalKeywords = [
      "jdih",
      "jaringan dokumentasi",
      "informasi hukum",
      "dokumen",
      "peraturan",
      "regulasi",
      "undang-undang",
      "uu",
      "perpres",
      "peraturan presiden",
      "peraturan pemerintah",
      "pp",
      "keputusan",
      "instruksi",
      "hukum",
      "pasal",
      "ayat",
      "bab",
      "bagian",
      "ketentuan",
      "bin",
      "badan intelijen negara",
      "intelijen",
      "kebijakan",
      "aturan",
    ];

    return legalKeywords.some((keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?;:()])`, "i");

      return regex.test(current);
    });
  }

  function isFollowUpQuestion(
    currentText: string,
    previousConversation: ChatMessage[],
  ): boolean {
    const current = currentText.toLowerCase().trim();

    if (previousConversation.length === 0) {
      return false;
    }

    // =========================================================
    // AMBIL PESAN USER SEBELUMNYA
    // =========================================================

    const previousUserMessages = previousConversation
      .filter((msg) => msg.type === "user")
      .map((msg) => msg.message.toLowerCase())
      .join(" ");

    // =========================================================
    // FOLLOW-UP YANG SECARA EKSPLISIT MERUJUK KE KONTEN HUKUM
    // =========================================================

    const explicitFollowUpKeywords = [
      "peraturan itu",
      "aturan itu",
      "uu itu",
      "undang-undang itu",
      "perpres itu",
      "pp itu",
      "pasal itu",
      "ayat itu",
      "bab itu",
      "dokumen itu",

      "peraturan tersebut",
      "aturan tersebut",
      "uu tersebut",
      "undang-undang tersebut",
      "perpres tersebut",
      "pp tersebut",
      "pasal tersebut",
      "ayat tersebut",
      "bab tersebut",
      "dokumen tersebut",

      "peraturan ini",
      "aturan ini",
      "uu ini",
      "undang-undang ini",
      "perpres ini",
      "pp ini",
      "pasal ini",
      "ayat ini",
      "bab ini",

      "yang dimaksud",
      "maksudnya",
      "apa isinya",
      "apa maksudnya",
      "isinya apa",
      "tentang apa",
      "lebih detail",
      "lebih rinci",
      "jelaskan lagi",
      "jelaskan lebih lanjut",
      "lanjutkan",
    ];

    if (explicitFollowUpKeywords.some((keyword) => current.includes(keyword))) {
      return true;
    }

    // =========================================================
    // REFERENSI PASAL / AYAT / BAB
    //
    // Contoh:
    // "Bab 1 isinya apa?"
    // "Pasal 3 tentang apa?"
    // "Ayat 2 menjelaskan apa?"
    // =========================================================

    const legalReferencePattern =
      /^(bab|pasal|ayat|bagian|ketentuan)\s+[a-z0-9ivx.-]+/i;

    if (legalReferencePattern.test(current)) {
      return true;
    }

    // =========================================================
    // PERTANYAAN TENTANG WAKTU / STATUS PERATURAN
    //
    // Contoh:
    // "Tahun berapa peraturan itu dibuat?"
    // "Kapan ditetapkan?"
    // "Kapan berlaku?"
    // =========================================================

    const regulationFollowUpPatterns = [
      /^tahun berapa.*(dibuat|ditetapkan|disahkan|diterbitkan|berlaku)/i,
      /^kapan.*(dibuat|ditetapkan|disahkan|diterbitkan|berlaku)/i,
      /^tanggal berapa.*(ditetapkan|disahkan|diterbitkan)/i,
      /^sejak kapan.*(berlaku|diterapkan)/i,
      /^kapan.*berlaku/i,
    ];

    if (regulationFollowUpPatterns.some((pattern) => pattern.test(current))) {
      return true;
    }

    // =========================================================
    // PERTANYAAN LANJUTAN DENGAN REFERENSI "INI"
    //
    // Contoh:
    // "Ini berlaku kapan?"
    // "Ini ditetapkan kapan?"
    // =========================================================

    const contextualReferencePatterns = [
      /^ini\s+(berlaku|ditetapkan|disahkan|dibuat|diterbitkan)/i,
      /^ini\s+(tentang|mengatur|menjelaskan)/i,
      /^yang\s+ini\s+(tentang|mengatur|menjelaskan)/i,
    ];

    if (contextualReferencePatterns.some((pattern) => pattern.test(current))) {
      return true;
    }

    // =========================================================
    // JIKA ADA KATA HUKUM YANG JELAS
    // =========================================================

    if (isValidContext(current)) {
      return true;
    }

    // =========================================================
    // JANGAN LAGI MENGANGGAP SEMUA PERTANYAAN PENDEK
    // SEBAGAI FOLLOW-UP
    //
    // INI BAGIAN YANG MEMPERBAIKI BUG:
    //
    // "sepak bola" -> BLOCK
    // "website indonesia seperti apa" -> BLOCK
    // "ibu kota Indonesia di mana" -> BLOCK
    // =========================================================

    return false;
  }

  function canProcessQuestion(
    currentText: string,
    previousConversation: ChatMessage[],
  ): boolean {
    // =========================================================
    // CHAT PERTAMA
    // =========================================================

    if (previousConversation.length === 0) {
      return isValidContext(currentText);
    }

    if (isValidContext(currentText)) {
      return true;
    }

    if (isFollowUpQuestion(currentText, previousConversation)) {
      return true;
    }

    return false;
  }

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !conversationId || isTyping) {
      return;
    }

    const userText = message.trim();

    const previousConversation = conversation;

    const userMsg: ChatMessage = {
      id: newId(),
      type: "user",
      message: userText,
      timestamp: nowTimestamp(),
    };

    setConversation((prev) => [...prev, userMsg]);

    setMessage("");

    const canProcess = canProcessQuestion(userText, previousConversation);

    if (!canProcess) {
      const blockedMsg: ChatMessage = {
        id: newId(),
        type: "assistant",
        message:
          "Maaf, pertanyaan tidak dapat diproses karena berada di luar konteks percakapan.\n\n" +
          "Silakan ajukan pertanyaan yang berkaitan dengan JDIH, hukum, " +
          "peraturan Intelijen Negara.",
        timestamp: nowTimestamp(),
      };

      setConversation((prev) => [...prev, blockedMsg]);

      return;
    }

    setIsTyping(true);

    try {
      const res = await sendChatMessage(userText, conversationId);

      let aiText = res.message ?? "";

      // Hapus Sumber / Referensi / Catatan
      aiText = cleanAIResponse(aiText);

      const aiMsg: ChatMessage = {
        id: newId(),
        type: "assistant",
        message: aiText,
        timestamp: nowTimestamp(),
      };

      setConversation((prev) => [...prev, aiMsg]);
    } catch (error) {

      setConversation((prev) => [
        ...prev,
        {
          id: newId(),
          type: "assistant",
          message: "Terjadi error saat memproses pertanyaan.",
          timestamp: nowTimestamp(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [message, conversationId, isTyping, conversation]);

  const handleClear = () => {
    if (!conversationId) return;

    localStorage.removeItem(`chat-${conversationId}`);
    setConversation([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) return;
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-">
      <div
        className="w-full flex justify-center border-b mb-3"
        style={{ background: "none" }}
      >
        <div className="w-full max-w-[900px] h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <Bot size={16} />
            </div>
            <div>
              <div className="font-semibold text-sm">
                Asisten Hukum Intelijen
              </div>
              <div className="text-xs text-muted-foreground">
                JDIH Badan Intelijen Negara
              </div>
            </div>
          </div>

          {/* KANAN (BUTTON) */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            className="gap-1 cursor-pointer"
          >
            <Trash2 size={14} />
            Bersihkan
          </Button>
        </div>
      </div>
      <div className="flex-1 flex justify-center overflow-hidden">
        {/* CONTAINER CHAT (FIX WIDTH 400px) */}
        <div className="w-full max-w-[900px] flex flex-col h-full">
          {/* CHAT AREA */}
          <div className="relative flex-1 overflow-hidden">
            <Card
              ref={containerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto p-4"
            >
              {conversation.length === 0 ? (
                <EmptyState onSelect={(text) => setMessage(text)} />
              ) : (
                <div className="space-y-4">
                  {conversation.map((msg, i) => {
                    const isUser = msg.type === "user";

                    return (
                      <div
                        key={msg.id}
                        ref={
                          i === conversation.length - 1 ? lastMessageRef : null
                        }
                        className={`flex gap-3 ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white">
                            <Bot size={16} />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isUser
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          ) : (
                            <AIMessageRenderer message={msg.message} />
                          )}

                          <div className="text-[10px] mt-2 opacity-60 text-right">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && <TypingDots />}
                </div>
              )}
            </Card>

            {/* SCROLL BUTTON */}
            {showScroll && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition"
              >
                <ArrowDown size={18} />
              </button>
            )}
          </div>

          {/* INPUT */}
          <div className="flex gap-2 items-end border-t p-3 shrink-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder="Tanyakan seputar peraturan,hukum..."
              className="flex-1 resize-none rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={isTyping || !message.trim()}
              className="h-12 w-12 p-0 cursor-pointer"
            >
              <Send
                size={18}
                className={isTyping ? "animate-pulse cursor-pointer" : ""}
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
