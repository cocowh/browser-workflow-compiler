import type { ObservationEvent } from "@bwc/observation-ir";
import { describe, expect, it } from "vitest";
import { linkActionRequests } from "./index.js";

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
});

function makeEvent(input: {
  id: string;
  sequence: number;
  timestamp: number;
  type: ObservationEvent["type"];
  payload?: Record<string, unknown>;
}): ObservationEvent {
  return {
    id: input.id,
    sessionId: "sess_test",
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
