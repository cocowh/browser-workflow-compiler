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

export type EvidenceGraphNodeType = "action" | "request" | "response";

export type EvidenceGraphEdgeType = "triggered";

export type EvidenceGraphNode = {
  id: string;
  type: EvidenceGraphNodeType;
  sessionId: string;
  sourceEventId: string;
  sourceEventType: ObservationEvent["type"];
  label: string;
  timestamp: number;
  sequence: number;
  pageUrl?: string;
  metadata: Record<string, unknown>;
};

export type EvidenceGraphEdge = {
  id: string;
  type: EvidenceGraphEdgeType;
  sessionId: string;
  fromNodeId: string;
  toNodeId: string;
  sourceLinkId: string;
  sourceEventIds: string[];
  confidence: number;
  reason: ActionRequestLinkReason;
  metadata: {
    actionId: string;
    requestId: string;
    responseEventId?: string;
    timeDeltaMs: number;
  };
};

export type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
};

export type BuildEvidenceGraphOptions = {
  actionRequestLinks?: readonly ActionRequestLink[];
};

const defaultWindowMs = 1_500;
const highConfidenceWindowMs = 500;
const linkableActionTypes = new Set<ObservationEvent["type"]>(["browser.click", "browser.input"]);
const graphNodeEventTypes = new Set<ObservationEvent["type"]>([
  "browser.click",
  "browser.input",
  "network.request",
  "network.response",
]);

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

    const responseEvent = responseByRequestId.get(makeRequestSessionKey(requestEvent.sessionId, requestId));
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

export function buildEvidenceGraph(
  events: readonly ObservationEvent[],
  options: BuildEvidenceGraphOptions = {},
): EvidenceGraph {
  const orderedEvents = [...events].sort(compareEvents);
  const links = options.actionRequestLinks ?? linkActionRequests(orderedEvents);
  const nodes = orderedEvents.flatMap((event) => {
    const node = makeEvidenceGraphNode(event);
    return node === undefined ? [] : [node];
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = [...links].sort(compareLinks).flatMap((link) => {
    const edge = makeTriggeredEdge(link);
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId)) {
      return [];
    }
    return [edge];
  });

  return { nodes, edges };
}

export function makeEvidenceGraphNodeId(event: Pick<ObservationEvent, "id" | "type">): string {
  const nodeType = getGraphNodeType(event.type);
  return `node_${nodeType}_${sanitizeIdPart(event.id)}`;
}

export function makeEvidenceGraphEdgeId(linkId: string): string {
  return `edge_triggered_${sanitizeIdPart(linkId)}`;
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
      responseByRequestId.set(makeRequestSessionKey(event.sessionId, requestId), event);
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

function compareLinks(left: ActionRequestLink, right: ActionRequestLink): number {
  return (
    left.sessionId.localeCompare(right.sessionId) ||
    left.timeDeltaMs - right.timeDeltaMs ||
    left.id.localeCompare(right.id)
  );
}

function makeEvidenceGraphNode(event: ObservationEvent): EvidenceGraphNode | undefined {
  if (!graphNodeEventTypes.has(event.type)) {
    return undefined;
  }

  const type = getGraphNodeType(event.type);
  const node: EvidenceGraphNode = {
    id: makeEvidenceGraphNodeId(event),
    type,
    sessionId: event.sessionId,
    sourceEventId: event.id,
    sourceEventType: event.type,
    label: makeEvidenceGraphNodeLabel(event),
    timestamp: event.timestamp,
    sequence: event.sequence,
    metadata: makeEvidenceGraphNodeMetadata(event),
  };

  if (event.pageUrl !== undefined) {
    node.pageUrl = event.pageUrl;
  }

  return node;
}

function makeTriggeredEdge(link: ActionRequestLink): EvidenceGraphEdge {
  const sourceEventIds = [link.actionEventId, link.requestEventId];
  if (link.responseEventId !== undefined) {
    sourceEventIds.push(link.responseEventId);
  }

  const metadata: EvidenceGraphEdge["metadata"] = {
    actionId: link.actionId,
    requestId: link.requestId,
    timeDeltaMs: link.timeDeltaMs,
  };
  if (link.responseEventId !== undefined) {
    metadata.responseEventId = link.responseEventId;
  }

  return {
    id: makeEvidenceGraphEdgeId(link.id),
    type: "triggered",
    sessionId: link.sessionId,
    fromNodeId: makeEvidenceGraphNodeId({ id: link.actionEventId, type: "browser.click" }),
    toNodeId: makeEvidenceGraphNodeId({ id: link.requestEventId, type: "network.request" }),
    sourceLinkId: link.id,
    sourceEventIds,
    confidence: link.confidence,
    reason: link.reason,
    metadata,
  };
}

function makeEvidenceGraphNodeLabel(event: ObservationEvent): string {
  if (event.type === "browser.click") {
    const text = getStringPayload(event, "text");
    const target = getStringPayload(event, "selector") ?? getStringPayload(event, "target");
    return text !== undefined ? `Click ${text}` : target !== undefined ? `Click ${target}` : "Click";
  }

  if (event.type === "browser.input") {
    const label = getStringPayload(event, "label");
    const target = getStringPayload(event, "selector") ?? getStringPayload(event, "target");
    return label !== undefined ? `Input ${label}` : target !== undefined ? `Input ${target}` : "Input";
  }

  if (event.type === "network.request") {
    const method = getStringPayload(event, "method") ?? "REQUEST";
    const url = getStringPayload(event, "url");
    return url !== undefined ? `${method} ${safePath(url)}` : method;
  }

  if (event.type === "network.response") {
    const status = getNumberPayload(event, "status");
    const url = getStringPayload(event, "url");
    const prefix = status !== undefined ? `Response ${status}` : "Response";
    return url !== undefined ? `${prefix} ${safePath(url)}` : prefix;
  }

  return event.type;
}

function makeEvidenceGraphNodeMetadata(event: ObservationEvent): Record<string, unknown> {
  if (event.type === "browser.click" || event.type === "browser.input") {
    return pickPayload(event, [
      "actionId",
      "actionType",
      "target",
      "selector",
      "text",
      "label",
      "tagName",
      "inputType",
      "valueLength",
      "isSensitive",
      "sensitive",
    ]);
  }

  if (event.type === "network.request") {
    return pickPayload(event, ["requestId", "method", "url", "resourceType", "bodyRef", "headersRef"]);
  }

  if (event.type === "network.response") {
    return pickPayload(event, [
      "requestId",
      "method",
      "url",
      "status",
      "statusText",
      "contentType",
      "bodyRef",
      "headersRef",
    ]);
  }

  return {};
}

function getGraphNodeType(eventType: ObservationEvent["type"]): EvidenceGraphNodeType {
  if (eventType === "browser.click" || eventType === "browser.input") {
    return "action";
  }

  if (eventType === "network.request") {
    return "request";
  }

  if (eventType === "network.response") {
    return "response";
  }

  throw new Error(`Unsupported Evidence Graph node event type: ${eventType}`);
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function getNumberPayload(event: ObservationEvent, key: string): number | undefined {
  const value = event.payload[key];
  return typeof value === "number" ? value : undefined;
}

function pickPayload(event: ObservationEvent, keys: readonly string[]): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of keys) {
    if (event.payload[key] !== undefined) {
      picked[key] = event.payload[key];
    }
  }
  return picked;
}

function safePath(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

function makeRequestSessionKey(sessionId: string, requestId: string): string {
  return `${sessionId}:${requestId}`;
}
