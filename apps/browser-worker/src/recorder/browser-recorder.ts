import { createBwcApiClient } from "@bwc/api-client";
import type { ObservationEvent } from "@bwc/observation-ir";
import { createId, nowIso, type RecordingSession } from "@bwc/shared";
import { chromium, type Page } from "playwright";
import { EventSequencer } from "./event-sequencer.js";
import type { BrowserRecorderOptions } from "./recorder-options.js";

export type BrowserRecorderResult = {
  ok: true;
  posted: boolean;
  apiUrl: string | undefined;
  targetUrl: string;
  finalUrl: string;
  browserName: string;
  buttonText: string | undefined;
  session: RecordingSession;
  events: ObservationEvent[];
  storedEventCount: number | undefined;
};

export async function recordBrowserLifecycle(options: BrowserRecorderOptions): Promise<BrowserRecorderResult> {
  const browser = await chromium.launch({ headless: options.headless });
  const browserName = browser.browserType().name();
  const session = await createSession(options);
  const sequencer = new EventSequencer();
  const events: ObservationEvent[] = [];

  try {
    const page = await browser.newPage();

    events.push(
      makeEvent({
        sessionId: session.id,
        type: "browser.session_started",
        sequence: sequencer.nextSequence(),
        pageUrl: "about:blank",
        payload: {
          browserName,
        },
      }),
    );

    await page.goto(options.targetUrl);
    const finalUrl = page.url();

    events.push(
      makeEvent({
        sessionId: session.id,
        type: "browser.navigate",
        sequence: sequencer.nextSequence(),
        pageUrl: finalUrl,
        actor: "browser",
        payload: {
          requestedUrl: options.targetUrl,
          finalUrl,
        },
      }),
    );

    const buttonText = await readOptionalButtonText(page);

    events.push(
      makeEvent({
        sessionId: session.id,
        type: "browser.session_stopped",
        sequence: sequencer.nextSequence(),
        pageUrl: finalUrl,
        payload: {
          reason: "smoke_finished",
        },
      }),
    );

    const storedEventCount = await postEvents(options.apiUrl, session.id, events);

    return {
      ok: true,
      posted: options.apiUrl !== undefined,
      apiUrl: options.apiUrl,
      targetUrl: options.targetUrl,
      finalUrl,
      browserName,
      buttonText,
      session,
      events,
      storedEventCount,
    };
  } finally {
    await browser.close();
  }
}

export function makeEvent(input: {
  sessionId: string;
  type: ObservationEvent["type"];
  sequence: number;
  pageUrl: string;
  payload: Record<string, unknown>;
  actor?: ObservationEvent["actor"];
  frameId?: string;
  tags?: string[];
}): ObservationEvent {
  const event: ObservationEvent = {
    id: createId("evt"),
    sessionId: input.sessionId,
    type: input.type,
    timestamp: Date.now(),
    sequence: input.sequence,
    pageUrl: input.pageUrl,
    actor: input.actor ?? "worker",
    payload: input.payload,
    artifactRefs: [],
    tags: input.tags ?? [],
  };

  if (input.frameId !== undefined) {
    event.frameId = input.frameId;
  }

  return event;
}

async function createSession(options: BrowserRecorderOptions): Promise<RecordingSession> {
  if (options.apiUrl !== undefined) {
    const client = createBwcApiClient({ baseUrl: options.apiUrl });
    return client.createSession({
      name: options.sessionName,
      metadata: {
        source: "browser-worker-recorder",
        targetUrl: options.targetUrl,
      },
    });
  }

  const now = nowIso();
  return {
    id: createId("sess"),
    name: options.sessionName,
    status: "recording",
    createdAt: now,
    updatedAt: now,
    startedAt: now,
    metadata: {
      source: "browser-worker-recorder",
      targetUrl: options.targetUrl,
    },
  };
}

async function postEvents(
  apiUrl: string | undefined,
  sessionId: string,
  events: ObservationEvent[],
): Promise<number | undefined> {
  if (apiUrl === undefined) {
    return undefined;
  }

  const client = createBwcApiClient({ baseUrl: apiUrl });
  for (const event of events) {
    await client.appendEvent(sessionId, event);
  }

  const storedEvents = await client.listEvents(sessionId);
  return storedEvents.events.length;
}

async function readOptionalButtonText(page: Page): Promise<string | undefined> {
  const button = page.locator("button").first();
  if ((await button.count()) === 0) {
    return undefined;
  }
  return button.innerText();
}
