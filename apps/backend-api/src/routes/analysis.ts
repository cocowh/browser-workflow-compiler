import { buildEvidenceGraph, generateMinimalWorkflow, linkActionRequests } from "@bwc/analysis";
import type { FastifyInstance } from "fastify";
import {
  type AnalysisResponse,
  AnalysisResponseSchema,
  type ErrorResponse,
  ErrorResponseSchema,
  type SessionParams,
  SessionParamsSchema,
} from "../schemas/api.js";
import type { RecordingStore } from "../storage/recording-store.js";

export function registerAnalysisRoutes(server: FastifyInstance, store: RecordingStore) {
  server.post<{ Params: SessionParams; Reply: AnalysisResponse | ErrorResponse }>(
    "/sessions/:sessionId/analyze",
    {
      schema: {
        params: SessionParamsSchema,
        response: {
          200: AnalysisResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { sessionId } = request.params;
      const session = await store.getSession(sessionId);
      if (!session) {
        return reply.code(404).send({
          error: "not_found",
          message: `Session ${sessionId} was not found.`,
        });
      }

      const events = await store.listEvents(sessionId);
      const actionRequestLinks = linkActionRequests(events);
      const evidenceGraph = buildEvidenceGraph(events, { actionRequestLinks });
      const workflow = generateMinimalWorkflow(events, {
        graph: evidenceGraph,
        sourceSessionId: sessionId,
      });

      return {
        sessionId,
        actionRequestLinks,
        evidenceGraph,
        workflow,
      };
    },
  );
}
