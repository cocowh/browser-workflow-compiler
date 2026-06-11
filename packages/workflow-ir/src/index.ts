import { type Static, Type } from "@sinclair/typebox";

export const WorkflowInputSchema = Type.Object(
  {
    type: Type.Union([Type.Literal("string"), Type.Literal("number"), Type.Literal("boolean")]),
    default: Type.Optional(Type.Unknown()),
    required: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export type WorkflowInput = Static<typeof WorkflowInputSchema>;

export const HttpRequestStepSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    type: Type.Literal("http.request"),
    method: Type.Union([
      Type.Literal("GET"),
      Type.Literal("POST"),
      Type.Literal("PUT"),
      Type.Literal("PATCH"),
      Type.Literal("DELETE"),
      Type.Literal("HEAD"),
      Type.Literal("OPTIONS"),
    ]),
    url: Type.String({ minLength: 1 }),
    headers: Type.Optional(Type.Record(Type.String(), Type.String())),
    query: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
    body: Type.Optional(Type.Unknown()),
    extract: Type.Optional(Type.Record(Type.String(), Type.String())),
    assert: Type.Optional(
      Type.Object(
        {
          status: Type.Optional(Type.Integer({ minimum: 100, maximum: 599 })),
          contentType: Type.Optional(Type.String()),
        },
        { additionalProperties: false },
      ),
    ),
    evidenceRefs: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

export type HttpRequestStep = Static<typeof HttpRequestStepSchema>;

export const WorkflowStepSchema = HttpRequestStepSchema;

export type WorkflowStep = Static<typeof WorkflowStepSchema>;

export const WorkflowSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    version: Type.Integer({ minimum: 1 }),
    sourceSessionId: Type.String({ minLength: 1 }),
    inputs: Type.Record(Type.String(), WorkflowInputSchema),
    variables: Type.Record(Type.String(), Type.Unknown()),
    steps: Type.Array(WorkflowStepSchema),
    evidenceRefs: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false },
);

export type Workflow = Static<typeof WorkflowSchema>;
