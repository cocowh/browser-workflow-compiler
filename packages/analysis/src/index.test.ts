import type { ObservationEvent } from "@bwc/observation-ir";
import { describe, expect, it } from "vitest";
import { buildEvidenceGraph, linkActionRequests } from "./index.js";

describe("linkActionRequests", () => {
  it("links the nearest click action to a following network request and matching response", () => {
    const links = linkActionRequests([
      makeEvent({ id: "evt_started", sequence: 0, timestamp: 1_000, type: "browser.session_started" }),
      makeEvent({
        id: "evt_input",
        sequence: 1,
        timestamp: 1_100,
        type: "browser.input",
        payload: { actionId: "act_input" },
      }),
      makeEvent({
        id: "evt_click",
        sequence: 2,
        timestamp: 1_300,
        type: "browser.click",
        payload: { actionId: "act_click" },
      }),
      makeEvent({
        id: "evt_request",
        sequence: 3,
        timestamp: 1_420,
        type: "network.request",
        payload: { requestId: "req_smoke" },
      }),
      makeEvent({
        id: "evt_response",
        sequence: 4,
        timestamp: 1_480,
        type: "network.response",
        payload: { requestId: "req_smoke" },
      }),
    ]);

    expect(links).toEqual([
      {
        id: "link_evt_click_evt_request",
        sessionId: "sess_test",
        actionEventId: "evt_click",
        actionId: "act_click",
        requestEventId: "evt_request",
        requestId: "req_smoke",
        responseEventId: "evt_response",
        confidence: 0.9,
        reason: "nearest_request_after_action",
        timeDeltaMs: 120,
      },
    ]);
  });

  it("links input actions when they are the nearest action before a request", () => {
    const links = linkActionRequests([
      makeEvent({
        id: "evt_input",
        sequence: 1,
        timestamp: 2_000,
        type: "browser.input",
        payload: { actionId: "act_input" },
      }),
      makeEvent({
        id: "evt_request",
        sequence: 2,
        timestamp: 2_900,
        type: "network.request",
        payload: { requestId: "req_search" },
      }),
    ]);

    expect(links).toMatchObject([
      {
        actionEventId: "evt_input",
        actionId: "act_input",
        requestEventId: "evt_request",
        requestId: "req_search",
        confidence: 0.7,
        timeDeltaMs: 900,
      },
    ]);
  });

  it("does not link requests outside the configured time window", () => {
    const links = linkActionRequests(
      [
        makeEvent({
          id: "evt_click",
          sequence: 1,
          timestamp: 3_000,
          type: "browser.click",
          payload: { actionId: "act_click" },
        }),
        makeEvent({
          id: "evt_request",
          sequence: 2,
          timestamp: 5_000,
          type: "network.request",
          payload: { requestId: "req_late" },
        }),
      ],
      { windowMs: 1_500 },
    );

    expect(links).toEqual([]);
  });

  it("ignores requests without request IDs and actions without action IDs", () => {
    const links = linkActionRequests([
      makeEvent({ id: "evt_click", sequence: 1, timestamp: 3_000, type: "browser.click" }),
      makeEvent({ id: "evt_request", sequence: 2, timestamp: 3_100, type: "network.request" }),
    ]);

    expect(links).toEqual([]);
  });

  it("keeps response matching scoped to the recording session", () => {
    const links = linkActionRequests([
      makeEvent({
        id: "evt_click_a",
        sessionId: "sess_a",
        sequence: 1,
        timestamp: 1_000,
        type: "browser.click",
        payload: { actionId: "act_a" },
      }),
      makeEvent({
        id: "evt_request_a",
        sessionId: "sess_a",
        sequence: 2,
        timestamp: 1_100,
        type: "network.request",
        payload: { requestId: "req_same" },
      }),
      makeEvent({
        id: "evt_response_b",
        sessionId: "sess_b",
        sequence: 3,
        timestamp: 1_120,
        type: "network.response",
        payload: { requestId: "req_same" },
      }),
    ]);

    expect(links).toEqual([
      expect.not.objectContaining({
        responseEventId: "evt_response_b",
      }),
    ]);
  });
});

describe("buildEvidenceGraph", () => {
  it("builds action, request, response nodes and a triggered edge from Step 04 style events", () => {
    const graph = buildEvidenceGraph([
      makeEvent({ id: "evt_started", sequence: 0, timestamp: 1_000, type: "browser.session_started" }),
      makeEvent({
        id: "evt_input",
        sequence: 1,
        timestamp: 1_100,
        type: "browser.input",
        payload: { actionId: "act_input", target: "#search", valueLength: 5 },
      }),
      makeEvent({
        id: "evt_click",
        sequence: 2,
        timestamp: 1_300,
        type: "browser.click",
        payload: { actionId: "act_click", text: "Search" },
      }),
      makeEvent({
        id: "evt_request",
        sequence: 3,
        timestamp: 1_420,
        type: "network.request",
        payload: {
          requestId: "req_smoke",
          method: "POST",
          url: "https://example.test/api/search?q=books",
          resourceType: "fetch",
        },
      }),
      makeEvent({
        id: "evt_response",
        sequence: 4,
        timestamp: 1_480,
        type: "network.response",
        payload: {
          requestId: "req_smoke",
          method: "POST",
          url: "https://example.test/api/search?q=books",
          status: 200,
          contentType: "application/json",
        },
      }),
    ]);

    expect(graph.nodes).toEqual([
      expect.objectContaining({
        id: "node_action_evt_input",
        type: "action",
        sourceEventId: "evt_input",
        label: "Input #search",
      }),
      expect.objectContaining({
        id: "node_action_evt_click",
        type: "action",
        sourceEventId: "evt_click",
        label: "Click Search",
      }),
      expect.objectContaining({
        id: "node_request_evt_request",
        type: "request",
        sourceEventId: "evt_request",
        label: "POST /api/search?q=books",
      }),
      expect.objectContaining({
        id: "node_response_evt_response",
        type: "response",
        sourceEventId: "evt_response",
        label: "Response 200 /api/search?q=books",
      }),
    ]);

    expect(graph.edges).toEqual([
      {
        id: "edge_triggered_link_evt_click_evt_request",
        type: "triggered",
        sessionId: "sess_test",
        fromNodeId: "node_action_evt_click",
        toNodeId: "node_request_evt_request",
        sourceLinkId: "link_evt_click_evt_request",
        sourceEventIds: ["evt_click", "evt_request", "evt_response"],
        confidence: 0.9,
        reason: "nearest_request_after_action",
        metadata: {
          actionId: "act_click",
          requestId: "req_smoke",
          responseEventId: "evt_response",
          timeDeltaMs: 120,
        },
      },
    ]);
  });

  it("preserves supplied action-request link metadata on graph edges", () => {
    const graph = buildEvidenceGraph(
      [
        makeEvent({
          id: "evt_input",
          sequence: 1,
          timestamp: 2_000,
          type: "browser.input",
          payload: { actionId: "act_input" },
        }),
        makeEvent({
          id: "evt_request",
          sequence: 2,
          timestamp: 2_900,
          type: "network.request",
          payload: { requestId: "req_search" },
        }),
      ],
      {
        actionRequestLinks: [
          {
            id: "link_custom",
            sessionId: "sess_test",
            actionEventId: "evt_input",
            actionId: "act_input",
            requestEventId: "evt_request",
            requestId: "req_search",
            confidence: 0.42,
            reason: "nearest_request_after_action",
            timeDeltaMs: 900,
          },
        ],
      },
    );

    expect(graph.edges).toEqual([
      expect.objectContaining({
        id: "edge_triggered_link_custom",
        sourceLinkId: "link_custom",
        confidence: 0.42,
        reason: "nearest_request_after_action",
        metadata: expect.objectContaining({
          actionId: "act_input",
          requestId: "req_search",
          timeDeltaMs: 900,
        }),
      }),
    ]);
  });
});

function makeEvent(input: {
  id: string;
  sessionId?: string;
  sequence: number;
  timestamp: number;
  type: ObservationEvent["type"];
  payload?: Record<string, unknown>;
}): ObservationEvent {
  return {
    id: input.id,
    sessionId: input.sessionId ?? "sess_test",
    type: input.type,
    timestamp: input.timestamp,
    sequence: input.sequence,
    pageUrl: "data:text/html,smoke",
    actor: "worker",
    payload: input.payload ?? {},
    artifactRefs: [],
    tags: [],
  };
}
