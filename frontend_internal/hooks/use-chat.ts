"use client";

import { useCallback, useRef, useState } from "react";
import {
  ChatServiceError,
  createLocalMessage,
  sendMessage as sendMessageService,
} from "@/services/chat-service";
import type { ChatMessage, ChatSettings } from "@/types/chat";
import { DEFAULT_CHAT_SETTINGS } from "@/types/chat";

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  initialSettings?: ChatSettings;
  historyLimit?: number;
}

interface UseChatReturn {
  messages: ChatMessage[];
  settings: ChatSettings;
  isSending: boolean;
  error: string | null;
  sendMessage: (text: string, settingsOverride?: ChatSettings) => Promise<void>;
  updateSettings: (partial: Partial<ChatSettings>) => void;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    initialMessages = [],
    initialSettings = DEFAULT_CHAT_SETTINGS,
    historyLimit = 20,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [settings, setSettings] = useState<ChatSettings>(initialSettings);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastUserTextRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateSettings = useCallback((partial: Partial<ChatSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string, settingsOverride?: ChatSettings) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const activeSettings = settingsOverride ?? settings;
      lastUserTextRef.current = trimmed;

      const userMessage = createLocalMessage("user", trimmed, {
        settings: activeSettings,
      });

      const pendingAssistantMessage = createLocalMessage("assistant", "", {
        status: "pending",
      });

      setMessages((prev) => [...prev, userMessage, pendingAssistantMessage]);
      setIsSending(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        const response = await sendMessageService(
          {
            message: trimmed,
            settings: activeSettings,
            history: messages.slice(-historyLimit),
          },
          { signal: abortControllerRef.current.signal }
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantMessage.id
              ? {
                  ...m,
                  id: response.id,
                  content: response.content,
                  createdAt: response.createdAt,
                  settings: response.settings,
                  status: "complete",
                }
              : m
          )
        );
      } catch (err) {
        const message =
          err instanceof ChatServiceError
            ? err.message
            : "Gagal mengirim pesan. Silakan coba lagi.";

        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingAssistantMessage.id
              ? { ...m, status: "error", error: message }
              : m
          )
        );
      } finally {
        setIsSending(false);
      }
    },
    [messages, settings, isSending, historyLimit]
  );

  const retryLastMessage = useCallback(async () => {
    if (!lastUserTextRef.current) return;
    setMessages((prev) => prev.filter((m) => m.status !== "error"));
    await sendMessage(lastUserTextRef.current);
  }, [sendMessage]);

  return {
    messages,
    settings,
    isSending,
    error,
    sendMessage,
    updateSettings,
    retryLastMessage,
    clearMessages,
    clearError,
  };
}
