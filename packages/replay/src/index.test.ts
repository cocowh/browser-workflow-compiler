import type { Workflow } from "@bwc/workflow-ir";
import { describe, expect, it } from "vitest";
import { replayWorkflow } from "./index.js";

describe("replayWorkflow", () => {
  it("replays a successful minimal HTTP request step and preserves evidence refs", async () => {
    const now = makeClock([1_000, 1_000, 1_042, 1_050]);

    const result = await replayWorkflow(makeWorkflow(), {
      id: "replay_search",
      now,
      httpClient: async (request) => {
        expect(request).toEqual({
          method: "POST",
          url: "https://example.test/api/search?q=books",
        });
        return {
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
        };
      },
    });

    expect(result).toEqual({
      id: "replay_search",
      workflowId: "wf_search",
      status: "passed",
      startedAt: "1970-01-01T00:00:01.000Z",
      endedAt: "1970-01-01T00:00:01.050Z",
      durationMs: 50,
      evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
      stepResults: [
        {
          id: "replay_step_replay_search_step_evt_request",
          replayId: "replay_search",
          workflowId: "wf_search",
          stepId: "step_evt_request",
          stepType: "http.request",
          status: "passed",
          startedAt: "1970-01-01T00:00:01.000Z",
          endedAt: "1970-01-01T00:00:01.042Z",
          durationMs: 42,
          request: {
            method: "POST",
            url: "https://example.test/api/search?q=books",
          },
          response: {
            status: 200,
            statusText: "OK",
            contentType: "application/json",
          },
          evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
        },
      ],
    });
  });

  it("marks a step failed when the response status does not match the assertion", async () => {
    const result = await replayWorkflow(
      {
        ...makeWorkflow(),
        steps: [
          {
            id: "step_create",
            type: "http.request",
            method: "POST",
            url: "https://example.test/api/items",
            assert: { status: 201 },
            evidenceRefs: ["evidence://edge_create"],
          },
          {
            id: "step_never_runs",
            type: "http.request",
            method: "GET",
            url: "https://example.test/api/items/1",
            evidenceRefs: ["evidence://edge_read"],
          },
        ],
      },
      {
        now: makeClock([2_000, 2_030, 2_050]),
        httpClient: async () => ({
          status: 500,
          statusText: "Internal Server Error",
        }),
      },
    );

    expect(result.status).toBe("failed");
    expect(result.stepResults).toEqual([
      expect.objectContaining({
        stepId: "step_create",
        status: "failed",
        response: {
          status: 500,
          statusText: "Internal Server Error",
        },
        evidenceRefs: ["evidence://edge_create"],
      }),
    ]);
  });

  it("records thrown HTTP client errors as failed replay facts", async () => {
    const result = await replayWorkflow(makeWorkflow(), {
      now: makeClock([3_000, 3_025, 3_030]),
      httpClient: async () => {
        throw new TypeError("network down");
      },
    });

    expect(result.status).toBe("failed");
    expect(result.stepResults).toEqual([
      expect.objectContaining({
        stepId: "step_evt_request",
        status: "failed",
        error: {
          name: "TypeError",
          message: "network down",
        },
        evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
      }),
    ]);
  });
});

function makeWorkflow(): Workflow {
  return {
    id: "wf_search",
    name: "Search Workflow",
    version: 1,
    sourceSessionId: "sess_test",
    inputs: {},
    variables: {},
    evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
    steps: [
      {
        id: "step_evt_request",
        type: "http.request",
        method: "POST",
        url: "https://example.test/api/search?q=books",
        evidenceRefs: ["evidence://edge_triggered_link_evt_click_evt_request"],
      },
    ],
  };
}

function makeClock(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index];
    index += 1;
    return value ?? values.at(-1) ?? 0;
  };
}
