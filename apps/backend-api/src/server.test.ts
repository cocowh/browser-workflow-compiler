import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ObservationEvent } from "@bwc/observation-ir";
import { describe, expect, it } from "vitest";
import { buildServer } from "./server.js";

describe("backend health endpoint", () => {
  it("returns the runtime and schema baseline", async () => {
    const server = buildServer({ logger: false });
    const response = await server.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "backend-api",
      schemas: {
        observationEvent: "ObservationEvent",
        recordingSession: "RecordingSession",
      },
    });
    await server.close();
  });
});

describe("recording sessions and observation event ingestion", () => {
  it("creates sessions and stores local data under the configured .bwc path", async () => {
    const dataDir = makeTempDataDir();
    const server = buildServer({ logger: false, dataDir });

    try {
      const createResponse = await server.inject({
        method: "POST",
        url: "/sessions",
        payload: {
          name: "Checkout Flow",
          metadata: {
            source: "test",
          },
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const session = createResponse.json();
      expect(session).toMatchObject({
        name: "Checkout Flow",
        status: "created",
        metadata: {
          source: "test",
        },
      });

      expect(existsSync(join(dataDir, "bwc.sqlite"))).toBe(true);
      expect(existsSync(join(dataDir, "artifacts"))).toBe(true);

      const listResponse = await server.inject({ method: "GET", url: "/sessions" });
      expect(listResponse.statusCode).toBe(200);
      expect(listResponse.json()).toMatchObject({
        sessions: [
          {
            id: session.id,
            name: "Checkout Flow",
          },
        ],
      });
    } finally {
      await server.close();
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("rejects invalid events and accepts valid events in sequence order", async () => {
    const dataDir = makeTempDataDir();
    const server = buildServer({ logger: false, dataDir });

    try {
      const createResponse = await server.inject({
        method: "POST",
        url: "/sessions",
        payload: { name: "Smoke Session" },
      });
      const session = createResponse.json();

      const invalidResponse = await server.inject({
        method: "POST",
        url: `/sessions/${session.id}/events`,
        payload: {
          id: "evt_invalid",
          sessionId: session.id,
          type: "browser.click",
        },
      });

      expect(invalidResponse.statusCode).toBe(400);

      const laterEvent = makeEvent({ id: "evt_002", sessionId: session.id, sequence: 2, type: "network.request" });
      const earlierEvent = makeEvent({ id: "evt_001", sessionId: session.id, sequence: 1, type: "browser.click" });

      const laterResponse = await server.inject({
        method: "POST",
        url: `/sessions/${session.id}/events`,
        payload: laterEvent,
      });
      expect(laterResponse.statusCode).toBe(201);

      const earlierResponse = await server.inject({
        method: "POST",
        url: `/sessions/${session.id}/events`,
        payload: earlierEvent,
      });
      expect(earlierResponse.statusCode).toBe(201);

      const eventsResponse = await server.inject({
        method: "GET",
        url: `/sessions/${session.id}/events`,
      });

      expect(eventsResponse.statusCode).toBe(200);
      expect(eventsResponse.json()).toMatchObject({
        events: [
          {
            id: "evt_001",
            sequence: 1,
          },
          {
            id: "evt_002",
            sequence: 2,
          },
        ],
      });
    } finally {
      await server.close();
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("rejects event session mismatches", async () => {
    const dataDir = makeTempDataDir();
    const server = buildServer({ logger: false, dataDir });

    try {
      const createResponse = await server.inject({
        method: "POST",
        url: "/sessions",
        payload: { name: "Mismatch Session" },
      });
      const session = createResponse.json();
      const event = makeEvent({ sessionId: "sess_other" });

      const response = await server.inject({
        method: "POST",
        url: `/sessions/${session.id}/events`,
        payload: event,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        error: "session_mismatch",
      });
    } finally {
      await server.close();
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});

describe("session analysis", () => {
  it("analyzes a stored session into links, evidence graph, and workflow facts", async () => {
    const dataDir = makeTempDataDir();
    const server = buildServer({ logger: false, dataDir });

    try {
      const createResponse = await server.inject({
        method: "POST",
        url: "/sessions",
        payload: { name: "Analysis Session" },
      });
      const session = createResponse.json();
      const events = [
        makeEvent({
          id: "evt_click",
          sessionId: session.id,
          sequence: 1,
          timestamp: 1_300,
          type: "browser.click",
          actor: "user",
          payload: { actionId: "act_click", text: "Search" },
        }),
        makeEvent({
          id: "evt_request",
          sessionId: session.id,
          sequence: 2,
          timestamp: 1_420,
          type: "network.request",
          actor: "network",
          payload: {
            requestId: "req_search",
            method: "POST",
            url: "https://example.test/api/search?q=books",
            resourceType: "fetch",
          },
        }),
        makeEvent({
          id: "evt_response",
          sessionId: session.id,
          sequence: 3,
          timestamp: 1_480,
          type: "network.response",
          actor: "network",
          payload: {
            requestId: "req_search",
            method: "POST",
            url: "https://example.test/api/search?q=books",
            status: 200,
            statusText: "OK",
            contentType: "application/json",
          },
        }),
      ];

      for (const event of events) {
        const eventResponse = await server.inject({
          method: "POST",
          url: `/sessions/${session.id}/events`,
          payload: event,
        });
        expect(eventResponse.statusCode).toBe(201);
      }

      const response = await server.inject({
        method: "POST",
        url: `/sessions/${session.id}/analyze`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        sessionId: session.id,
        actionRequestLinks: [
          {
            actionEventId: "evt_click",
            requestEventId: "evt_request",
            requestId: "req_search",
            responseEventId: "evt_response",
          },
        ],
        evidenceGraph: {
          nodes: [
            expect.objectContaining({ id: "node_action_evt_click", type: "action" }),
            expect.objectContaining({ id: "node_request_evt_request", type: "request" }),
            expect.objectContaining({ id: "node_response_evt_response", type: "response" }),
          ],
          edges: [
            expect.objectContaining({
              id: "edge_triggered_link_evt_click_evt_request",
              type: "triggered",
              fromNodeId: "node_action_evt_click",
              toNodeId: "node_request_evt_request",
            }),
          ],
        },
        workflow: {
          id: expect.stringMatching(/^wf_/),
          sourceSessionId: session.id,
          steps: [
            {
              id: "step_evt_request",
              type: "http.request",
              method: "POST",
              url: "https://example.test/api/search?q=books",
              evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
            },
          ],
        },
      });
    } finally {
      await server.close();
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it("returns 404 when analyzing a missing session", async () => {
    const dataDir = makeTempDataDir();
    const server = buildServer({ logger: false, dataDir });

    try {
      const response = await server.inject({
        method: "POST",
        url: "/sessions/sess_missing/analyze",
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({
        error: "not_found",
        message: "Session sess_missing was not found.",
      });
    } finally {
      await server.close();
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});

function makeTempDataDir(): string {
  return mkdtempSync(join(tmpdir(), "bwc-test-"));
}

function makeEvent(overrides: Partial<ObservationEvent> = {}): ObservationEvent {
  return {
    id: "evt_test",
    sessionId: "sess_test",
    type: "browser.session_started",
    timestamp: 1781190000000,
    sequence: 0,
    pageUrl: "about:blank",
    frameId: "main",
    actor: "worker",
    payload: {},
    artifactRefs: [],
    tags: [],
    ...overrides,
  };
}
