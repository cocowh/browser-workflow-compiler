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
