import type { ObservationEvent } from "@bwc/observation-ir";
import type { RecordingSession } from "@bwc/shared";

export const demoSession: RecordingSession = {
  id: "sess_demo",
  name: "Checkout Flow",
  status: "recording",
  createdAt: "2026-06-12T08:00:00.000Z",
  updatedAt: "2026-06-12T08:02:00.000Z",
  startedAt: "2026-06-12T08:00:12.000Z",
};

export const demoEvents: ObservationEvent[] = [
  {
    id: "evt_001",
    sessionId: demoSession.id,
    type: "browser.navigate",
    timestamp: 1781193600000,
    sequence: 1,
    pageUrl: "https://shop.example.com/cart",
    frameId: "main",
    actor: "user",
    payload: { url: "https://shop.example.com/cart" },
    artifactRefs: [],
    tags: [],
  },
  {
    id: "evt_002",
    sessionId: demoSession.id,
    type: "browser.click",
    timestamp: 1781193601120,
    sequence: 2,
    pageUrl: "https://shop.example.com/cart",
    frameId: "main",
    actor: "user",
    payload: { selector: "button[data-testid='checkout']", text: "Checkout" },
    artifactRefs: [],
    tags: [],
  },
  {
    id: "evt_003",
    sessionId: demoSession.id,
    type: "network.request",
    timestamp: 1781193601190,
    sequence: 3,
    pageUrl: "https://shop.example.com/cart",
    frameId: "main",
    actor: "network",
    payload: { method: "POST", url: "https://shop.example.com/api/checkout", resourceType: "fetch" },
    artifactRefs: [],
    tags: ["json"],
  },
];
