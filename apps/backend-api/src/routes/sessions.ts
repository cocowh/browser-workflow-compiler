import type { ObservationEvent } from "@bwc/observation-ir";
import { ObservationEventSchema } from "@bwc/observation-ir";
import type { RecordingSession } from "@bwc/shared";
import { RecordingSessionSchema } from "@bwc/shared";
import type { FastifyInstance } from "fastify";
import {
  type CreateSessionBody,
  CreateSessionBodySchema,
  type ErrorResponse,
  ErrorResponseSchema,
  type EventListResponse,
  EventListResponseSchema,
  type SessionListResponse,
  SessionListResponseSchema,
  type SessionParams,
  SessionParamsSchema,
} from "../schemas/api.js";
import type { RecordingStore } from "../storage/recording-store.js";

export function registerSessionRoutes(server: FastifyInstance, store: RecordingStore) {
  server.post<{ Body: CreateSessionBody; Reply: RecordingSession }>(
    "/sessions",
    {
      schema: {
        body: CreateSessionBodySchema,
        response: {
          201: RecordingSessionSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await store.createSession(request.body);
      return reply.code(201).send(session);
    },
  );

  server.get<{ Reply: SessionListResponse }>(
    "/sessions",
    {
      schema: {
        response: {
          200: SessionListResponseSchema,
        },
      },
    },
    async () => ({
      sessions: await store.listSessions(),
    }),
  );

  server.get<{ Params: SessionParams; Reply: RecordingSession | ErrorResponse }>(
    "/sessions/:sessionId",
    {
      schema: {
        params: SessionParamsSchema,
        response: {
          200: RecordingSessionSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await store.getSession(request.params.sessionId);
      if (!session) {
        return reply.code(404).send({
          error: "not_found",
          message: `Session ${request.params.sessionId} was not found.`,
        });
      }
      return session;
    },
  );

  server.post<{ Params: SessionParams; Body: ObservationEvent; Reply: ObservationEvent | ErrorResponse }>(
    "/sessions/:sessionId/events",
    {
      schema: {
        params: SessionParamsSchema,
        body: ObservationEventSchema,
        response: {
          201: ObservationEventSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.params;
      if (request.body.sessionId !== sessionId) {
        return reply.code(400).send({
          error: "session_mismatch",
          message: "Event sessionId must match the route sessionId.",
        });
      }

      const session = await store.getSession(sessionId);
      if (!session) {
        return reply.code(404).send({
          error: "not_found",
          message: `Session ${sessionId} was not found.`,
        });
      }

      try {
        const event = await store.appendEvent(sessionId, request.body);
        return reply.code(201).send(event);
      } catch (error) {
        if (isSqliteConstraintError(error)) {
          return reply.code(409).send({
            error: "event_conflict",
            message: "An event with the same id or session sequence already exists.",
          });
        }
        throw error;
      }
    },
  );

  server.get<{ Params: SessionParams; Reply: EventListResponse | ErrorResponse }>(
    "/sessions/:sessionId/events",
    {
      schema: {
        params: SessionParamsSchema,
        response: {
          200: EventListResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const session = await store.getSession(request.params.sessionId);
      if (!session) {
        return reply.code(404).send({
          error: "not_found",
          message: `Session ${request.params.sessionId} was not found.`,
        });
      }

      return {
        events: await store.listEvents(request.params.sessionId),
      };
    },
  );
}

function isSqliteConstraintError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("SQLITE_CONSTRAINT");
}
