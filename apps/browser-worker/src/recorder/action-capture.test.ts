import { describe, expect, it } from "vitest";
import { type BrowserActionFacts, makeBrowserActionEvent, normalizeActionFacts } from "./action-capture.js";

describe("action capture helpers", () => {
  it("creates browser.click events with target hints and visible text metadata", () => {
    const event = makeBrowserActionEvent({
      facts: {
        actionId: "act_click",
        actionType: "click",
        pageUrl: "https://example.com/form",
        target: "#record",
        tagName: "button",
        text: "Record",
        isSensitive: false,
        browserTimestamp: 1781280000000,
      },
      sessionId: "sess_test",
      sequence: 2,
      pageUrl: "https://example.com/form",
    });

    expect(event).toMatchObject({
      sessionId: "sess_test",
      type: "browser.click",
      sequence: 2,
      actor: "user",
      pageUrl: "https://example.com/form",
      payload: {
        actionId: "act_click",
        actionType: "click",
        target: "#record",
        tagName: "button",
        text: "Record",
        isSensitive: false,
        browserTimestamp: 1781280000000,
      },
      artifactRefs: [],
      tags: [],
    });
  });

  it("creates browser.input events with safe value metadata", () => {
    const event = makeBrowserActionEvent({
      facts: {
        actionId: "act_input",
        actionType: "input",
        pageUrl: "https://example.com/form",
        target: 'input[name="workflowName"]',
        tagName: "input",
        inputType: "text",
        value: "smoke workflow",
        valueLength: 14,
        isSensitive: false,
        browserTimestamp: 1781280001000,
      },
      sessionId: "sess_test",
      sequence: 1,
      pageUrl: "https://example.com/form",
    });

    expect(event).toMatchObject({
      type: "browser.input",
      actor: "user",
      payload: {
        actionId: "act_input",
        actionType: "input",
        target: 'input[name="workflowName"]',
        tagName: "input",
        inputType: "text",
        value: "smoke workflow",
        valueLength: 14,
      },
    });
  });

  it("removes raw text and value metadata from sensitive input facts", () => {
    const facts: BrowserActionFacts = {
      actionId: "act_password",
      actionType: "input",
      pageUrl: "https://example.com/login",
      target: "#password",
      tagName: "input",
      inputType: "password",
      text: "secret",
      value: "secret",
      valueLength: 6,
      isSensitive: true,
      browserTimestamp: 1781280002000,
    };

    const normalized = normalizeActionFacts(facts);
    const event = makeBrowserActionEvent({
      facts: normalized,
      sessionId: "sess_test",
      sequence: 3,
      pageUrl: "https://example.com/login",
    });

    expect(normalized).not.toHaveProperty("value");
    expect(normalized).not.toHaveProperty("text");
    expect(event.payload).toMatchObject({
      actionId: "act_password",
      inputType: "password",
      valueLength: 6,
      isSensitive: true,
    });
    expect(event.payload).not.toHaveProperty("value");
    expect(event.payload).not.toHaveProperty("text");
    expect(event.tags).toEqual(["sensitive"]);
  });
});
