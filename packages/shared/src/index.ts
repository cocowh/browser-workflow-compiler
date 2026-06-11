import { type Static, Type } from "@sinclair/typebox";

export const ActorSchema = Type.Union([
  Type.Literal("user"),
  Type.Literal("browser"),
  Type.Literal("network"),
  Type.Literal("worker"),
  Type.Literal("analyzer"),
  Type.Literal("replay"),
]);

export type Actor = Static<typeof ActorSchema>;

export const RecordingSessionStatusSchema = Type.Union([
  Type.Literal("created"),
  Type.Literal("recording"),
  Type.Literal("stopped"),
  Type.Literal("analyzing"),
  Type.Literal("ready"),
  Type.Literal("failed"),
]);

export type RecordingSessionStatus = Static<typeof RecordingSessionStatusSchema>;

export const RecordingSessionSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    name: Type.Optional(Type.String()),
    status: RecordingSessionStatusSchema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    startedAt: Type.Optional(Type.String({ format: "date-time" })),
    stoppedAt: Type.Optional(Type.String({ format: "date-time" })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false },
);

export type RecordingSession = Static<typeof RecordingSessionSchema>;

export function createId(prefix: string): string {
  const entropy = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${entropy}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
