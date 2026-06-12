import { describe, expect, it } from "vitest";
import { makeEvent } from "./browser-recorder.js";

describe("makeEvent", () => {
  it("creates factual Observation IR events with stable envelope fields", () => {
    const event = makeEvent({
      sessionId: "sess_test",
      type: "browser.navigate",
      sequence: 1,
      pageUrl: "https://example.com/",
      actor: "browser",
      payload: {
        requestedUrl: "https://example.com",
        finalUrl: "https://example.com/",
      },
      tags: ["smoke"],
    });

    expect(event).toMatchObject({
      sessionId: "sess_test",
      type: "browser.navigate",
      sequence: 1,
      pageUrl: "https://example.com/",
      actor: "browser",
      payload: {
        requestedUrl: "https://example.com",
        finalUrl: "https://example.com/",
      },
      artifactRefs: [],
      tags: ["smoke"],
    });
    expect(event.id).toMatch(/^evt_/);
    expect(event.timestamp).toEqual(expect.any(Number));
  });
});
