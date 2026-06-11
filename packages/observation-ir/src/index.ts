import { ActorSchema } from "@bwc/shared";
import { type Static, Type } from "@sinclair/typebox";

export const ObservationEventTypeSchema = Type.Union([
  Type.Literal("browser.session_started"),
  Type.Literal("browser.session_stopped"),
  Type.Literal("browser.navigate"),
  Type.Literal("browser.click"),
  Type.Literal("browser.input"),
  Type.Literal("browser.wait"),
  Type.Literal("browser.screenshot"),
  Type.Literal("browser.dom_snapshot"),
  Type.Literal("network.request"),
  Type.Literal("network.response"),
  Type.Literal("network.request_failed"),
  Type.Literal("network.graphql_operation"),
  Type.Literal("storage.cookie_snapshot"),
  Type.Literal("storage.local_storage_snapshot"),
  Type.Literal("replay.started"),
  Type.Literal("replay.step_result"),
  Type.Literal("replay.finished"),
]);

export type ObservationEventType = Static<typeof ObservationEventTypeSchema>;

export const ArtifactRefSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    uri: Type.String({ minLength: 1 }),
    kind: Type.Optional(
      Type.Union([
        Type.Literal("request_body"),
        Type.Literal("response_body"),
        Type.Literal("headers"),
        Type.Literal("screenshot"),
        Type.Literal("dom_snapshot"),
        Type.Literal("trace"),
        Type.Literal("other"),
      ]),
    ),
    mediaType: Type.Optional(Type.String()),
    sensitive: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export type ArtifactRef = Static<typeof ArtifactRefSchema>;

export const ObservationEventSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    sessionId: Type.String({ minLength: 1 }),
    type: ObservationEventTypeSchema,
    timestamp: Type.Number(),
    sequence: Type.Integer({ minimum: 0 }),
    pageUrl: Type.Optional(Type.String()),
    frameId: Type.Optional(Type.String()),
    actor: ActorSchema,
    payload: Type.Record(Type.String(), Type.Unknown()),
    artifactRefs: Type.Array(ArtifactRefSchema),
    tags: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export type ObservationEvent = Static<typeof ObservationEventSchema>;

export const p0ObservationEventTypes = [
  "browser.session_started",
  "browser.session_stopped",
  "browser.navigate",
  "browser.click",
  "browser.input",
  "browser.wait",
  "network.request",
  "network.response",
  "network.request_failed",
  "network.graphql_operation",
] as const satisfies readonly ObservationEventType[];
