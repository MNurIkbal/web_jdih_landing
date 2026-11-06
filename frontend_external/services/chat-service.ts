import type { ChatApiResponse } from "@/types/chat"

export class ChatServiceError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ChatServiceError"
    this.status = status
  }
}

/**
 * Sends a user message + conversationId to the internal Next.js API route,
 * which proxies it to the ACS backend.
 */
export async function sendChatMessage(
  message: string,
  conversationId: string,
  signal?: AbortSignal
): Promise<ChatApiResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
    signal,
  })

  let data: ChatApiResponse
  try {
    data = await response.json()
    
  } catch {
    throw new ChatServiceError("Respons server tidak valid", response.status)
  }

  if (!response.ok || !data.success) {
    throw new ChatServiceError(
      data.error || `Permintaan gagal (status ${response.status})`,
      response.status
    )
  }

  return data
}

const CONVERSATION_ID_KEY = "minpers_conversation_id"

export function getOrCreateConversationId(): string {
  if (typeof window === "undefined") return ""

  let id = window.localStorage.getItem(CONVERSATION_ID_KEY)
  if (!id) {
    id = generateConversationId()
    window.localStorage.setItem(CONVERSATION_ID_KEY, id)
  }
  return id
}

export function resetConversationId(): string {
  const id = generateConversationId()
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONVERSATION_ID_KEY, id)
  }
  return id
}

function generateConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `conv_${crypto.randomUUID()}`
  }
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

function conversationStorageKey(conversationId: string) {
  return `minpers_conversation_${conversationId}`
}

export function loadConversation<T>(conversationId: string): T | null {
  if (typeof window === "undefined" || !conversationId) return null
  const raw = window.localStorage.getItem(conversationStorageKey(conversationId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function saveConversation<T>(conversationId: string, conversation: T) {
  if (typeof window === "undefined" || !conversationId) return
  window.localStorage.setItem(
    conversationStorageKey(conversationId),
    JSON.stringify(conversation)
  )
}

export function clearConversation(conversationId: string) {
  if (typeof window === "undefined" || !conversationId) return
  window.localStorage.removeItem(conversationStorageKey(conversationId))
}