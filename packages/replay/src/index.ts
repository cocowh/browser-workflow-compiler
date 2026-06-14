import type { HttpRequestStep, Workflow } from "@bwc/workflow-ir";

export type ReplayStepStatus = "passed" | "failed";

export type ReplayWorkflowStatus = "passed" | "failed";

export type ReplayHttpRequest = {
  method: HttpRequestStep["method"];
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
};

export type ReplayHttpResponse = {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
};

export type ReplayHttpClient = (request: ReplayHttpRequest) => Promise<ReplayHttpResponse>;

export type ReplayClock = () => number;

export type ReplayWorkflowOptions = {
  id?: string;
  httpClient?: ReplayHttpClient;
  now?: ReplayClock;
  continueOnError?: boolean;
};

export type ReplayStepResult = {
  id: string;
  replayId: string;
  workflowId: string;
  stepId: string;
  stepType: "http.request";
  status: ReplayStepStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  request: {
    method: HttpRequestStep["method"];
    url: string;
  };
  response?: {
    status: number;
    statusText: string;
    contentType?: string;
  };
  error?: {
    name: string;
    message: string;
  };
  evidenceRefs: string[];
};

export type ReplayResult = {
  id: string;
  workflowId: string;
  status: ReplayWorkflowStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  stepResults: ReplayStepResult[];
  evidenceRefs: string[];
};

type ReplayStepError = NonNullable<ReplayStepResult["error"]>;

const defaultSuccessfulStatusMinimum = 200;
const defaultSuccessfulStatusMaximum = 399;

export async function replayWorkflow(workflow: Workflow, options: ReplayWorkflowOptions = {}): Promise<ReplayResult> {
  const replayId = options.id ?? makeReplayId(workflow.id);
  const now = options.now ?? Date.now;
  const httpClient = options.httpClient ?? defaultHttpClient;
  const startedAtMs = now();
  const stepResults: ReplayStepResult[] = [];

  for (const step of workflow.steps) {
    const stepResult = await replayHttpRequestStep({
      replayId,
      workflowId: workflow.id,
      step,
      httpClient,
      now,
    });
    stepResults.push(stepResult);

    if (stepResult.status === "failed" && options.continueOnError !== true) {
      break;
    }
  }

  const endedAtMs = now();
  const evidenceRefs = collectReplayEvidenceRefs(workflow, stepResults);

  return {
    id: replayId,
    workflowId: workflow.id,
    status: stepResults.every((result) => result.status === "passed") ? "passed" : "failed",
    startedAt: toIsoTimestamp(startedAtMs),
    endedAt: toIsoTimestamp(endedAtMs),
    durationMs: getDurationMs(startedAtMs, endedAtMs),
    stepResults,
    evidenceRefs,
  };
}

export function makeReplayId(workflowId: string): string {
  return `replay_${sanitizeIdPart(workflowId)}`;
}

export function makeReplayStepResultId(replayId: string, stepId: string): string {
  return `replay_step_${sanitizeIdPart(replayId)}_${sanitizeIdPart(stepId)}`;
}

async function replayHttpRequestStep(input: {
  replayId: string;
  workflowId: string;
  step: HttpRequestStep;
  httpClient: ReplayHttpClient;
  now: ReplayClock;
}): Promise<ReplayStepResult> {
  const startedAtMs = input.now();
  const baseResult = {
    id: makeReplayStepResultId(input.replayId, input.step.id),
    replayId: input.replayId,
    workflowId: input.workflowId,
    stepId: input.step.id,
    stepType: input.step.type,
    startedAt: toIsoTimestamp(startedAtMs),
    request: {
      method: input.step.method,
      url: input.step.url,
    },
    evidenceRefs: [...input.step.evidenceRefs].sort(),
  } satisfies Omit<ReplayStepResult, "status" | "endedAt" | "durationMs" | "response" | "error">;

  try {
    const request: ReplayHttpRequest = {
      method: input.step.method,
      url: input.step.url,
    };
    if (input.step.headers !== undefined) {
      request.headers = input.step.headers;
    }
    if (input.step.body !== undefined) {
      request.body = input.step.body;
    }

    const response = await input.httpClient(request);
    const endedAtMs = input.now();
    const status = isExpectedResponse(input.step, response) ? "passed" : "failed";
    const replayResponse: ReplayStepResult["response"] = {
      status: response.status,
      statusText: response.statusText,
    };
    const contentType = getHeaderValue(response.headers, "content-type");
    if (contentType !== undefined) {
      replayResponse.contentType = contentType;
    }

    const result: ReplayStepResult = {
      ...baseResult,
      status,
      endedAt: toIsoTimestamp(endedAtMs),
      durationMs: getDurationMs(startedAtMs, endedAtMs),
      response: replayResponse,
    };
    return result;
  } catch (error) {
    const endedAtMs = input.now();
    return {
      ...baseResult,
      status: "failed",
      endedAt: toIsoTimestamp(endedAtMs),
      durationMs: getDurationMs(startedAtMs, endedAtMs),
      error: normalizeError(error),
    };
  }
}

function isExpectedResponse(step: HttpRequestStep, response: ReplayHttpResponse): boolean {
  if (step.assert?.status !== undefined) {
    return response.status === step.assert.status;
  }

  return response.status >= defaultSuccessfulStatusMinimum && response.status <= defaultSuccessfulStatusMaximum;
}

async function defaultHttpClient(request: ReplayHttpRequest): Promise<ReplayHttpResponse> {
  const requestInit: RequestInit = {
    method: request.method,
  };
  if (request.headers !== undefined) {
    requestInit.headers = request.headers;
  }
  if (request.body !== undefined) {
    requestInit.body = serializeBody(request.body);
  }

  const response = await fetch(request.url, requestInit);

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

function serializeBody(body: unknown): BodyInit {
  return typeof body === "string" || body instanceof Blob || body instanceof FormData || body instanceof URLSearchParams
    ? body
    : JSON.stringify(body);
}

function getHeaderValue(headers: Record<string, string> | undefined, name: string): string | undefined {
  if (headers === undefined) {
    return undefined;
  }

  const exact = headers[name];
  if (exact !== undefined) {
    return exact;
  }

  const lowerName = name.toLowerCase();
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === lowerName);
  return key === undefined ? undefined : headers[key];
}

function normalizeError(error: unknown): ReplayStepError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: "Error",
    message: String(error),
  };
}

function collectReplayEvidenceRefs(workflow: Workflow, stepResults: readonly ReplayStepResult[]): string[] {
  return [
    ...new Set([...(workflow.evidenceRefs ?? []), ...stepResults.flatMap((result) => result.evidenceRefs)]),
  ].sort();
}

function toIsoTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toISOString();
}

function getDurationMs(startedAtMs: number, endedAtMs: number): number {
  return Math.max(0, endedAtMs - startedAtMs);
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}
