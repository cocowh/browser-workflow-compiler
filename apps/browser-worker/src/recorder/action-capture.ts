import type { ObservationEvent } from "@bwc/observation-ir";
import type { Page } from "playwright";
import { makeEvent } from "./event-factory.js";
import type { EventSequencer } from "./event-sequencer.js";

export type ActionCaptureContext = {
  sessionId: string;
  page: Page;
  events: ObservationEvent[];
  sequencer: EventSequencer;
};

export type BrowserActionFacts = {
  actionId: string;
  actionType: "click" | "input";
  pageUrl: string;
  target: string;
  tagName: string;
  inputType?: string;
  text?: string;
  value?: string;
  valueLength?: number;
  checked?: boolean;
  isContentEditable?: boolean;
  isSensitive: boolean;
  browserTimestamp: number;
};

export async function attachActionCapture(context: ActionCaptureContext): Promise<void> {
  await context.page.exposeBinding("__bwcRecordAction", (_source, action: BrowserActionFacts) => {
    context.events.push(
      makeBrowserActionEvent({
        facts: normalizeActionFacts(action),
        sessionId: context.sessionId,
        sequence: context.sequencer.nextSequence(),
        pageUrl: context.page.url(),
      }),
    );
  });

  await context.page.addInitScript({ content: actionCaptureScript });
}

export async function ensureActionCaptureInstalled(page: Page): Promise<void> {
  await page.addScriptTag({ content: actionCaptureScript });
}

export function makeBrowserActionEvent(input: {
  facts: BrowserActionFacts;
  sessionId: string;
  sequence: number;
  pageUrl: string;
}): ObservationEvent {
  const payload: Record<string, unknown> = {
    actionId: input.facts.actionId,
    actionType: input.facts.actionType,
    target: input.facts.target,
    tagName: input.facts.tagName,
    pageUrl: input.facts.pageUrl,
    isSensitive: input.facts.isSensitive,
    browserTimestamp: input.facts.browserTimestamp,
  };

  assignIfDefined(payload, "inputType", input.facts.inputType);
  assignIfDefined(payload, "text", input.facts.text);
  assignIfDefined(payload, "value", input.facts.value);
  assignIfDefined(payload, "valueLength", input.facts.valueLength);
  assignIfDefined(payload, "checked", input.facts.checked);
  assignIfDefined(payload, "isContentEditable", input.facts.isContentEditable);

  return makeEvent({
    sessionId: input.sessionId,
    type: input.facts.actionType === "click" ? "browser.click" : "browser.input",
    sequence: input.sequence,
    pageUrl: input.pageUrl,
    actor: "user",
    payload,
    tags: input.facts.isSensitive ? ["sensitive"] : [],
  });
}

export function normalizeActionFacts(facts: BrowserActionFacts): BrowserActionFacts {
  if (!facts.isSensitive) {
    return facts;
  }

  const { value: _value, text: _text, ...safeFacts } = facts;
  return safeFacts;
}

function assignIfDefined(payload: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== undefined) {
    payload[key] = value;
  }
}

const actionCaptureScript = String.raw`
(() => {
  if (window.__bwcActionCaptureInstalled === true) {
    return;
  }

  const sensitiveInputTypes = new Set(["password", "hidden"]);
  const maxTextLength = 120;

  function recordAction(actionType, event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const facts = collectActionFacts(actionType, target);
    window.__bwcRecordAction?.(facts);
  }

  function collectActionFacts(actionType, element) {
    const tagName = element.tagName.toLowerCase();
    const inputElement = element instanceof HTMLInputElement ? element : undefined;
    const textareaElement = element instanceof HTMLTextAreaElement ? element : undefined;
    const inputType = inputElement?.type?.toLowerCase();
    const isSensitive = isSensitiveElement(element);
    const rawValue = inputElement?.value ?? textareaElement?.value;
    const checked = inputElement?.type === "checkbox" || inputElement?.type === "radio" ? inputElement.checked : undefined;

    const action = {
      actionId: makeActionId(),
      actionType,
      pageUrl: window.location.href,
      target: makeTargetHint(element),
      tagName,
      isSensitive,
      browserTimestamp: Date.now(),
    };

    if (inputType !== undefined) {
      action.inputType = inputType;
    }

    const text = normalizeText(element.innerText || element.textContent || "");
    if (text !== undefined && !isSensitive) {
      action.text = text;
    }

    if (rawValue !== undefined) {
      action.valueLength = rawValue.length;
      if (!isSensitive) {
        action.value = clampText(rawValue);
      }
    }

    if (checked !== undefined) {
      action.checked = checked;
    }

    if (element.isContentEditable) {
      action.isContentEditable = true;
    }

    return action;
  }

  function isSensitiveElement(element) {
    if (element instanceof HTMLInputElement && sensitiveInputTypes.has(element.type.toLowerCase())) {
      return true;
    }

    const autocomplete = element.getAttribute("autocomplete")?.toLowerCase();
    const name = element.getAttribute("name")?.toLowerCase();
    return autocomplete === "current-password" || autocomplete === "new-password" || name?.includes("password") === true;
  }

  function makeTargetHint(element) {
    const testId = element.getAttribute("data-testid");
    if (testId !== null && testId.length > 0) {
      return '[data-testid="' + escapeAttributeValue(testId) + '"]';
    }

    if (element.id.length > 0) {
      return "#" + escapeCssIdentifier(element.id);
    }

    const name = element.getAttribute("name");
    if (name !== null && name.length > 0) {
      return element.tagName.toLowerCase() + '[name="' + escapeAttributeValue(name) + '"]';
    }

    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel !== null && ariaLabel.length > 0) {
      return element.tagName.toLowerCase() + '[aria-label="' + escapeAttributeValue(ariaLabel) + '"]';
    }

    return element.tagName.toLowerCase();
  }

  function normalizeText(value) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length === 0) {
      return undefined;
    }
    return clampText(normalized);
  }

  function clampText(value) {
    if (value.length <= maxTextLength) {
      return value;
    }
    return value.slice(0, maxTextLength) + "...";
  }

  function escapeCssIdentifier(value) {
    return window.CSS?.escape?.(value) ?? value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeAttributeValue(value) {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function makeActionId() {
    const random = Math.random().toString(36).slice(2, 10);
    return "act_" + Date.now().toString(36) + "_" + random;
  }

  document.addEventListener("click", (event) => recordAction("click", event), true);
  document.addEventListener("input", (event) => recordAction("input", event), true);
  window.__bwcActionCaptureInstalled = true;
})();
`;
