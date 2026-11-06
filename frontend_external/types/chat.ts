// export type ModelId = "gpt-oss" | "gemma-4";

// export type EffortLevel = "low" | "medium" | "high" | "max";

// export type MessageRole = "user" | "assistant" | "system";

// export interface ChatModel {
//   id: ModelId;
//   name: string;
//   description: string;
//   category: "open-source" | "cloud";
// }

// export interface ChatSettings {
//   model: ModelId;
//   effort: EffortLevel;
//   thinking: boolean;
//   webSearch: boolean;
// }

// export interface ChatMessage {
//   id: number
//   type: "user" | "assistant"
//   message: string
//   timestamp: string
//   query?: string
//   results?: any
//   insights?: string[]
//   intent?: string
//   sample_data?: any[]
// }

// export interface SendMessagePayload {
//   message: string;
//   settings: ChatSettings;
//   history?: ChatMessage[];
// }

// export interface SendMessageResponse {
//   id: string;
//   content: string;
//   createdAt: string;
//   settings: ChatSettings;
// }

// export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
//   model: "gemma-4",
//   effort: "low",
//   thinking: true,
//   webSearch: false,
// };

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: number | string
  type: ChatRole
  message: string
  query?: string | null
  results?: unknown
  insights?: string[]
  sample_data?: unknown[]
  intent?: string | null
  timestamp: string
}

export interface ConversationStats {
  messageCount?: number
  [key: string]: unknown
}

export interface ChatApiResponse {
  success: boolean
  message?: string
  query?: string | null
  intent?: string | null
  insights?: string[]
  sample_data?: unknown[]
  conversationStats?: ConversationStats | null
  error?: string
}