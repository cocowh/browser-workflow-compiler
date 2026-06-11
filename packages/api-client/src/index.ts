import type { ObservationEvent } from "@bwc/observation-ir";
import type { RecordingSession } from "@bwc/shared";

export type CreateSessionRequest = {
  name?: string;
  metadata?: Record<string, unknown>;
};

export type BwcApiClientOptions = {
  baseUrl: string;
  fetcher?: typeof fetch;
};

export type HealthResponse = {
  status: "ok";
  service: "backend-api";
  time: string;
  schemas: {
    observationEvent: "ObservationEvent";
    recordingSession: "RecordingSession";
  };
};

export type SessionListResponse = {
  sessions: RecordingSession[];
};

export type EventListResponse = {
  events: ObservationEvent[];
};

export class BwcApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`BWC API request failed with status ${status}`);
    this.name = "BwcApiError";
    this.status = status;
    this.body = body;
  }
}

export function createBwcApiClient(options: BwcApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetcher = options.fetcher ?? fetch;

  return {
    health: () => requestJson<HealthResponse>(fetcher, `${baseUrl}/health`),
    createSession: (body: CreateSessionRequest) =>
      requestJson<RecordingSession>(fetcher, `${baseUrl}/sessions`, {
        method: "POST",
        body,
      }),
    listSessions: () => requestJson<SessionListResponse>(fetcher, `${baseUrl}/sessions`),
    getSession: (sessionId: string) => requestJson<RecordingSession>(fetcher, `${baseUrl}/sessions/${sessionId}`),
    appendEvent: (sessionId: string, event: ObservationEvent) =>
      requestJson<ObservationEvent>(fetcher, `${baseUrl}/sessions/${sessionId}/events`, {
        method: "POST",
        body: event,
      }),
    listEvents: (sessionId: string) =>
      requestJson<EventListResponse>(fetcher, `${baseUrl}/sessions/${sessionId}/events`),
  };
}

async function requestJson<T>(
  fetcher: typeof fetch,
  url: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
  } = {},
): Promise<T> {
  const requestInit: RequestInit = {
    method: options.method ?? "GET",
  };

  if (options.body !== undefined) {
    requestInit.headers = { "content-type": "application/json" };
    requestInit.body = JSON.stringify(options.body);
  }

  const response = await fetcher(url, requestInit);
  const body = await readJson(response);

  if (!response.ok) {
    throw new BwcApiError(response.status, body);
  }

  return body as T;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }
  return JSON.parse(text) as unknown;
}
