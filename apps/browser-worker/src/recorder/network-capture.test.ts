import { describe, expect, it } from "vitest";
import {
  detectNetworkTags,
  makeNetworkRequestEvent,
  makeNetworkResponseEvent,
  type RequestFacts,
  type ResponseFacts,
  shouldFilterRequest,
} from "./network-capture.js";

const timing = {
  startTime: 10,
  domainLookupStart: -1,
  domainLookupEnd: -1,
  connectStart: -1,
  secureConnectionStart: -1,
  connectEnd: -1,
  requestStart: 12,
  responseStart: 20,
  responseEnd: 24,
};

describe("network capture helpers", () => {
  it("filters obvious static assets", () => {
    expect(shouldFilterRequest(mockRequest("image", "https://example.com/logo.png"))).toBe(true);
    expect(shouldFilterRequest(mockRequest("fetch", "https://example.com/api/items"))).toBe(false);
  });

  it("detects json, graphql, and sensitive network tags", () => {
    expect(
      detectNetworkTags({
        method: "POST",
        url: "https://example.com/graphql",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ query: "{ viewer { id } }" }),
      }),
    ).toEqual(["json", "graphql", "sensitive"]);
  });

  it("creates request and response events with pairing fields and artifact references", () => {
    const requestFacts: RequestFacts = {
      requestId: "req_test",
      method: "GET",
      url: "https://bwc.local/api/smoke",
      resourceType: "fetch",
      headers: { accept: "application/json" },
      postData: null,
      timing,
    };
    const responseFacts: ResponseFacts = {
      ...requestFacts,
      status: 200,
      statusText: "OK",
      contentType: "application/json",
      headers: { "content-type": "application/json" },
    };

    const requestEvent = makeNetworkRequestEvent({
      facts: requestFacts,
      sessionId: "sess_test",
      sequence: 2,
      pageUrl: "data:text/html,smoke",
    });
    const responseEvent = makeNetworkResponseEvent({
      facts: responseFacts,
      sessionId: "sess_test",
      sequence: 3,
      pageUrl: "data:text/html,smoke",
    });

    expect(requestEvent).toMatchObject({
      type: "network.request",
      actor: "network",
      sequence: 2,
      payload: {
        requestId: "req_test",
        method: "GET",
        url: "https://bwc.local/api/smoke",
        resourceType: "fetch",
        timing,
      },
      tags: ["json"],
    });
    expect(requestEvent.artifactRefs).toEqual([
      {
        id: "req_test_request_headers",
        uri: "artifact://sess_test/req_test/request.headers.json",
        kind: "headers",
        mediaType: "application/json",
        sensitive: false,
      },
    ]);

    expect(responseEvent).toMatchObject({
      type: "network.response",
      actor: "network",
      sequence: 3,
      payload: {
        requestId: "req_test",
        method: "GET",
        url: "https://bwc.local/api/smoke",
        status: 200,
        bodyRef: "artifact://sess_test/req_test/response.body",
        timing,
      },
      tags: ["json"],
    });
    expect(responseEvent.artifactRefs).toContainEqual({
      id: "req_test_response_body",
      uri: "artifact://sess_test/req_test/response.body",
      kind: "response_body",
      mediaType: "application/json",
      sensitive: false,
    });
  });
});

function mockRequest(resourceType: string, url: string) {
  return {
    resourceType: () => resourceType,
    url: () => url,
  };
}
