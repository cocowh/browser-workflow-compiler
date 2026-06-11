import { ObservationEventSchema } from "@bwc/observation-ir";
import { RecordingSessionSchema } from "@bwc/shared";
import { type Static, Type } from "@sinclair/typebox";

export const ErrorResponseSchema = Type.Object(
  {
    error: Type.String(),
    message: Type.String(),
  },
  { additionalProperties: false },
);

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export const CreateSessionBodySchema = Type.Object(
  {
    name: Type.Optional(Type.String({ minLength: 1 })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: false },
);

export type CreateSessionBody = Static<typeof CreateSessionBodySchema>;

export const SessionParamsSchema = Type.Object(
  {
    sessionId: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export type SessionParams = Static<typeof SessionParamsSchema>;

export const SessionListResponseSchema = Type.Object(
  {
    sessions: Type.Array(RecordingSessionSchema),
  },
  { additionalProperties: false },
);

export type SessionListResponse = Static<typeof SessionListResponseSchema>;

export const EventListResponseSchema = Type.Object(
  {
    events: Type.Array(ObservationEventSchema),
  },
  { additionalProperties: false },
);

export type EventListResponse = Static<typeof EventListResponseSchema>;
