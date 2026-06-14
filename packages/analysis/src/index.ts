import type { ObservationEvent } from "@bwc/observation-ir";

export type ActionRequestLinkReason = "nearest_request_after_action";

export type ActionRequestLink = {
  id: string;
  sessionId: string;
  actionEventId: string;
  actionId: string;
  requestEventId: string;
  requestId: string;
  responseEventId?: string;
  confidence: number;
  reason: ActionRequestLinkReason;
  timeDeltaMs: number;
};

export type LinkActionRequestsOptions = {
  windowMs?: number;
};

const defaultWindowMs = 1_500;
const highConfidenceWindowMs = 500;
const linkableActionTypes = new Set<ObservationEvent["type"]>(["browser.click", "browser.input"]);

export function linkActionRequests(
  events: readonly ObservationEvent[],
  options: LinkActionRequestsOptions = {},
): ActionRequestLink[] {
  const windowMs = options.windowMs ?? defaultWindowMs;
  const orderedEvents = [...events].sort(compareEvents);
  const responseByRequestId = indexResponsesByRequestId(orderedEvents);
  const links: ActionRequestLink[] = [];

  for (const requestEvent of orderedEvents) {
    if (requestEvent.type !== "network.request") {
      continue;
    }

    const requestId = getStringPayload(requestEvent, "requestId");
    if (requestId === undefined) {
      continue;
    }

    const actionEvent = findNearestActionBeforeRequest(orderedEvents, requestEvent, windowMs);
    if (actionEvent === undefined) {
      continue;
    }

    const actionId = getStringPayload(actionEvent, "actionId");
    if (actionId === undefined) {
      continue;
    }

    const responseEvent = responseByRequestId.get(requestId);
    const link: ActionRequestLink = {
      id: makeActionRequestLinkId(actionEvent.id, requestEvent.id),
      sessionId: requestEvent.sessionId,
      actionEventId: actionEvent.id,
      actionId,
      requestEventId: requestEvent.id,
      requestId,
      confidence: getConfidence(requestEvent.timestamp - actionEvent.timestamp),
      reason: "nearest_request_after_action",
      timeDeltaMs: requestEvent.timestamp - actionEvent.timestamp,
    };

    if (responseEvent !== undefined) {
      link.responseEventId = responseEvent.id;
    }

    links.push(link);
  }

  return links;
}

export function makeActionRequestLinkId(actionEventId: string, requestEventId: string): string {
  return `link_${sanitizeIdPart(actionEventId)}_${sanitizeIdPart(requestEventId)}`;
}

function findNearestActionBeforeRequest(
  events: readonly ObservationEvent[],
  requestEvent: ObservationEvent,
  windowMs: number,
): ObservationEvent | undefined {
  let nearestAction: ObservationEvent | undefined;

  for (const event of events) {
    if (event.sessionId !== requestEvent.sessionId) {
      continue;
    }

    if (!linkableActionTypes.has(event.type)) {
      continue;
    }

    const timeDeltaMs = requestEvent.timestamp - event.timestamp;
    if (timeDeltaMs < 0 || timeDeltaMs > windowMs) {
      continue;
    }

    if (nearestAction === undefined || event.timestamp > nearestAction.timestamp) {
      nearestAction = event;
    }
  }

  return nearestAction;
}

function indexResponsesByRequestId(events: readonly ObservationEvent[]): Map<string, ObservationEvent> {
  const responseByRequestId = new Map<string, ObservationEvent>();

  for (const event of events) {
    if (event.type !== "network.response") {
      continue;
    }

    const requestId = getStringPayload(event, "requestId");
    if (requestId !== undefined) {
      responseByRequestId.set(requestId, event);
    }
  }

  return responseByRequestId;
}

function getStringPayload(event: ObservationEvent, key: string): string | undefined {
  const value = event.payload[key];
  return typeof value === "string" ? value : undefined;
}

function getConfidence(timeDeltaMs: number): number {
  return timeDeltaMs <= highConfidenceWindowMs ? 0.9 : 0.7;
}

function compareEvents(left: ObservationEvent, right: ObservationEvent): number {
  return left.sequence - right.sequence || left.timestamp - right.timestamp || left.id.localeCompare(right.id);
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}
