import { z } from "zod";

export const modelIdSchema = z.enum(["gpt-oss", "gemma-4"]);

export const effortLevelSchema = z.enum(["low", "medium", "high", "max"]);

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

export const chatSettingsSchema = z.object({
  model: modelIdSchema,
  effort: effortLevelSchema,
  thinking: z.boolean(),
  webSearch: z.boolean(),
});

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: messageRoleSchema,
  content: z.string().min(1, "Message content cannot be empty"),
  createdAt: z.string().datetime(),
  settings: chatSettingsSchema.optional(),
  status: z.enum(["pending", "complete", "error"]).optional(),
  error: z.string().optional(),
});

export const sendMessagePayloadSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message tidak boleh kosong")
    .max(8000, "Message terlalu panjang (maks 8000 karakter)"),
  settings: chatSettingsSchema,
  history: z.array(chatMessageSchema).max(50).optional(),
});


export const sendMessageResponseSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  createdAt: z.string().datetime(),
  settings: chatSettingsSchema,
});

export type SendMessagePayloadInput = z.infer<typeof sendMessagePayloadSchema>;
export type SendMessageResponseOutput = z.infer<typeof sendMessageResponseSchema>;
