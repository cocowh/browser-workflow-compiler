import { createBwcApiClient } from "@bwc/api-client";
import type { ObservationEvent } from "@bwc/observation-ir";
import { createId, nowIso, type RecordingSession } from "@bwc/shared";
import { chromium } from "playwright";

const apiUrl = getArgValue("--api") ?? process.env.BWC_API_URL;
const sessionId = createId("sess");
const now = Date.now();

let session: RecordingSession = {
  id: sessionId,
  name: "Browser worker smoke",
  status: "recording",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  startedAt: nowIso(),
};

const sessionStarted: ObservationEvent = {
  id: createId("evt"),
  sessionId,
  type: "browser.session_started",
  timestamp: now,
  sequence: 0,
  pageUrl: "about:blank",
  frameId: "main",
  actor: "worker",
  payload: {
    browserName: "chromium",
  },
  artifactRefs: [],
  tags: [],
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto("data:text/html,<main><button id='record'>Record</button></main>");
  const buttonText = await page.locator("#record").innerText();
  let posted = false;
  let storedEventCount: number | undefined;

  if (apiUrl !== undefined) {
    const client = createBwcApiClient({ baseUrl: apiUrl });
    session = await client.createSession({
      name: "Browser worker smoke",
      metadata: {
        source: "browser-worker-smoke",
      },
    });
    sessionStarted.sessionId = session.id;
    await client.appendEvent(session.id, sessionStarted);
    const storedEvents = await client.listEvents(session.id);
    posted = storedEvents.events.some((event) => event.id === sessionStarted.id);
    storedEventCount = storedEvents.events.length;
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        posted,
        apiUrl,
        storedEventCount,
        browserName: browser.browserType().name(),
        buttonText,
        session,
        sampleEvent: sessionStarted,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}

function getArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}
