import { ObservationEventSchema } from "@bwc/observation-ir";
import { RecordingSessionSchema } from "@bwc/shared";
import { type Static, Type } from "@sinclair/typebox";
import Fastify, { type FastifyServerOptions } from "fastify";
import { registerAnalysisRoutes } from "./routes/analysis.js";
import { registerSessionRoutes } from "./routes/sessions.js";
import type { RecordingStore } from "./storage/recording-store.js";
import { SqliteRecordingStore } from "./storage/sqlite-recording-store.js";

const HealthResponseSchema = Type.Object(
  {
    status: Type.Literal("ok"),
    service: Type.Literal("backend-api"),
    time: Type.String({ format: "date-time" }),
    schemas: Type.Object(
      {
        observationEvent: Type.Literal("ObservationEvent"),
        recordingSession: Type.Literal("RecordingSession"),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

type HealthResponse = Static<typeof HealthResponseSchema>;

export type BuildServerOptions = FastifyServerOptions & {
  dataDir?: string;
  store?: RecordingStore;
};

export function buildServer(options: BuildServerOptions = {}) {
  const server = Fastify({
    logger: options.logger ?? true,
  });

  const store =
    options.store ?? new SqliteRecordingStore(options.dataDir === undefined ? {} : { dataDir: options.dataDir });

  server.addSchema({
    ...ObservationEventSchema,
    $id: "ObservationEvent",
  });
  server.addSchema({
    ...RecordingSessionSchema,
    $id: "RecordingSession",
  });

  server.get<{ Reply: HealthResponse }>(
    "/health",
    {
      schema: {
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async () => ({
      status: "ok",
      service: "backend-api",
      time: new Date().toISOString(),
      schemas: {
        observationEvent: "ObservationEvent",
        recordingSession: "RecordingSession",
      },
    }),
  );

  registerSessionRoutes(server, store);
  registerAnalysisRoutes(server, store);

  server.addHook("onClose", async () => {
    await store.close();
  });

  return server;
}
