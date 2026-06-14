import type { ObservationEvent } from "@bwc/observation-ir";
import type { ReplayResult, ReplayStepResult } from "@bwc/replay";
import type { HttpRequestStep, Workflow } from "@bwc/workflow-ir";

export type ActionRequestLinkReason = "nearest_request_after_action";

export type ReplayEvidenceReason = "replay_result_for_workflow_step";

export type EvidenceGraphEdgeReason = ActionRequestLinkReason | ReplayEvidenceReason;

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

export type EvidenceGraphNodeType = "action" | "request" | "response" | "workflow_step" | "replay_result";

export type EvidenceGraphEdgeType = "triggered" | "verified_by";

export type EvidenceGraphNode = {
  id: string;
  type: EvidenceGraphNodeType;
  sessionId: string;
  label: string;
  timestamp: number;
  sequence: number;
  pageUrl?: string;
  sourceEventId?: string;
  sourceEventType?: ObservationEvent["type"];
  evidenceRefs?: string[];
  metadata: Record<string, unknown>;
};

export type EvidenceGraphEdge = {
  id: string;
  type: EvidenceGraphEdgeType;
  sessionId: string;
  fromNodeId: string;
  toNodeId: string;
  sourceLinkId?: string;
  sourceEventIds?: string[];
  sourceReplayId?: string;
  sourceReplayStepResultId?: string;
  evidenceRefs?: string[];
  confidence: number;
  reason: EvidenceGraphEdgeReason;
  metadata: Record<string, unknown>;
};

export type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
};

export type BuildEvidenceGraphOptions = {
  actionRequestLinks?: readonly ActionRequestLink[];
};

export type GenerateMinimalWorkflowOptions = {
  graph?: EvidenceGraph;
  id?: string;
  name?: string;
  selectedRequestEventIds?: readonly string[];
  sourceSessionId?: string;
};

export type AddReplayResultEvidenceOptions = {
  replayResult: ReplayResult;
  workflow: Workflow;
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
const supportedHttpMethods = new Set<HttpRequestStep["method"]>([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
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

export function makeWorkflowStepNodeId(workflowId: string, stepId: string): string {
  return `node_workflow_step_${sanitizeIdPart(workflowId)}_${sanitizeIdPart(stepId)}`;
}

export function makeReplayResultNodeId(replayId: string, replayStepResultId: string): string {
  return `node_replay_result_${sanitizeIdPart(replayId)}_${sanitizeIdPart(replayStepResultId)}`;
}

export function makeVerifiedByEdgeId(
  workflowId: string,
  stepId: string,
  replayId: string,
  replayStepResultId: string,
): string {
  return `edge_verified_by_${sanitizeIdPart(workflowId)}_${sanitizeIdPart(stepId)}_${sanitizeIdPart(replayId)}_${sanitizeIdPart(replayStepResultId)}`;
}

export function generateMinimalWorkflow(
  events: readonly ObservationEvent[],
  options: GenerateMinimalWorkflowOptions = {},
): Workflow {
  const orderedEvents = [...events].sort(compareEvents);
  const graph = options.graph ?? buildEvidenceGraph(orderedEvents);
  const selectedRequestEventIds =
    options.selectedRequestEventIds === undefined ? undefined : new Set(options.selectedRequestEventIds);
  const requestEvents = orderedEvents.filter((event) => {
    if (event.type !== "network.request") {
      return false;
    }
    return selectedRequestEventIds === undefined || selectedRequestEventIds.has(event.id);
  });
  const steps = requestEvents.flatMap((event) => {
    const step = makeHttpRequestStep(event, graph);
    return step === undefined ? [] : [step];
  });
  const sourceSessionId =
    options.sourceSessionId ?? requestEvents[0]?.sessionId ?? orderedEvents[0]?.sessionId ?? "unknown";

  return {
    id: options.id ?? makeWorkflowId(sourceSessionId),
    name: options.name ?? "Recorded API Workflow",
    version: 1,
    sourceSessionId,
    inputs: {},
    variables: {},
    steps,
    evidenceRefs: collectWorkflowEvidenceRefs(steps),
  };
}

export function makeWorkflowId(sourceSessionId: string): string {
  return `wf_${sanitizeIdPart(sourceSessionId)}`;
}

export function makeWorkflowStepId(requestEventId: string): string {
  return `step_${sanitizeIdPart(requestEventId)}`;
}

export function addReplayResultEvidence(graph: EvidenceGraph, options: AddReplayResultEvidenceOptions): EvidenceGraph {
  const { replayResult, workflow } = options;
  if (replayResult.workflowId !== workflow.id) {
    throw new Error(`Replay result workflow ID ${replayResult.workflowId} does not match workflow ID ${workflow.id}`);
  }

  const existingNodeIds = new Set(graph.nodes.map((node) => node.id));
  const existingEdgeIds = new Set(graph.edges.map((edge) => edge.id));
  const workflowStepsById = new Map(workflow.steps.map((step) => [step.id, step]));
  const workflowStepOrder = new Map(workflow.steps.map((step, index) => [step.id, index]));
  const maxSequence = graph.nodes.reduce((max, node) => Math.max(max, node.sequence), -1);
  const nodesToAdd: EvidenceGraphNode[] = [];
  const edgesToAdd: EvidenceGraphEdge[] = [];

  const orderedStepResults = [...replayResult.stepResults].sort((left, right) =>
    compareReplayStepResults(left, right, workflowStepOrder),
  );

  for (const [index, stepResult] of orderedStepResults.entries()) {
    const workflowStep = workflowStepsById.get(stepResult.stepId);
    if (workflowStep === undefined) {
      continue;
    }

    const timestamp = parseIsoTimestamp(stepResult.startedAt);
    const workflowStepNodeId = makeWorkflowStepNodeId(workflow.id, workflowStep.id);
    const replayResultNodeId = makeReplayResultNodeId(replayResult.id, stepResult.id);
    const workflowStepSequence = maxSequence + index * 2 + 1;
    const replayResultSequence = workflowStepSequence + 1;

    if (!existingNodeIds.has(workflowStepNodeId)) {
      const node = makeWorkflowStepNode(workflow, workflowStep, timestamp, workflowStepSequence);
      nodesToAdd.push(node);
      existingNodeIds.add(node.id);
    }

    if (!existingNodeIds.has(replayResultNodeId)) {
      const node = makeReplayResultNode(workflow, replayResult, stepResult, timestamp, replayResultSequence);
      nodesToAdd.push(node);
      existingNodeIds.add(node.id);
    }

    const edge = makeVerifiedByEdge(workflow, replayResult, stepResult, workflowStepNodeId, replayResultNodeId);
    if (!existingEdgeIds.has(edge.id)) {
      edgesToAdd.push(edge);
      existingEdgeIds.add(edge.id);
    }
  }

  return {
    nodes: [...graph.nodes, ...nodesToAdd],
    edges: [...graph.edges, ...edgesToAdd],
  };
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

function makeHttpRequestStep(event: ObservationEvent, graph: EvidenceGraph): HttpRequestStep | undefined {
  const method = getHttpMethod(event);
  const url = getStringPayload(event, "url");

  if (method === undefined || url === undefined) {
    return undefined;
  }

  const evidenceRefs = graph.edges
    .filter((edge) => edge.type === "triggered" && edge.toNodeId === makeEvidenceGraphNodeId(event))
    .sort(compareEdges)
    .map((edge) => makeEvidenceRef(edge.id));

  return {
    id: makeWorkflowStepId(event.id),
    type: "http.request",
    method,
    url,
    evidenceRefs,
  };
}

function makeTriggeredEdge(link: ActionRequestLink): EvidenceGraphEdge {
  const sourceEventIds = [link.actionEventId, link.requestEventId];
  if (link.responseEventId !== undefined) {
    sourceEventIds.push(link.responseEventId);
  }

  const metadata: Record<string, unknown> = {
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

function makeWorkflowStepNode(
  workflow: Workflow,
  step: HttpRequestStep,
  timestamp: number,
  sequence: number,
): EvidenceGraphNode {
  return {
    id: makeWorkflowStepNodeId(workflow.id, step.id),
    type: "workflow_step",
    sessionId: workflow.sourceSessionId,
    label: `${step.method} ${safePath(step.url)}`,
    timestamp,
    sequence,
    evidenceRefs: [...step.evidenceRefs].sort(),
    metadata: {
      workflowId: workflow.id,
      workflowStepId: step.id,
      stepType: step.type,
      method: step.method,
      url: step.url,
      sourceSessionId: workflow.sourceSessionId,
    },
  };
}

function makeReplayResultNode(
  workflow: Workflow,
  replayResult: ReplayResult,
  stepResult: ReplayStepResult,
  timestamp: number,
  sequence: number,
): EvidenceGraphNode {
  const metadata: Record<string, unknown> = {
    replayId: replayResult.id,
    replayStepResultId: stepResult.id,
    workflowId: workflow.id,
    workflowStepId: stepResult.stepId,
    status: stepResult.status,
    startedAt: stepResult.startedAt,
    endedAt: stepResult.endedAt,
    durationMs: stepResult.durationMs,
    request: stepResult.request,
  };
  if (stepResult.response !== undefined) {
    metadata.response = stepResult.response;
  }
  if (stepResult.error !== undefined) {
    metadata.error = stepResult.error;
  }

  return {
    id: makeReplayResultNodeId(replayResult.id, stepResult.id),
    type: "replay_result",
    sessionId: workflow.sourceSessionId,
    label: `Replay ${stepResult.status} ${stepResult.stepId}`,
    timestamp,
    sequence,
    evidenceRefs: [...stepResult.evidenceRefs].sort(),
    metadata,
  };
}

function makeVerifiedByEdge(
  workflow: Workflow,
  replayResult: ReplayResult,
  stepResult: ReplayStepResult,
  fromNodeId: string,
  toNodeId: string,
): EvidenceGraphEdge {
  const metadata: Record<string, unknown> = {
    workflowId: workflow.id,
    workflowStepId: stepResult.stepId,
    replayId: replayResult.id,
    replayStepResultId: stepResult.id,
    status: stepResult.status,
    durationMs: stepResult.durationMs,
  };
  if (stepResult.response !== undefined) {
    metadata.responseStatus = stepResult.response.status;
  }
  if (stepResult.error !== undefined) {
    metadata.errorName = stepResult.error.name;
  }

  return {
    id: makeVerifiedByEdgeId(workflow.id, stepResult.stepId, replayResult.id, stepResult.id),
    type: "verified_by",
    sessionId: workflow.sourceSessionId,
    fromNodeId,
    toNodeId,
    sourceReplayId: replayResult.id,
    sourceReplayStepResultId: stepResult.id,
    evidenceRefs: [...stepResult.evidenceRefs].sort(),
    confidence: 1,
    reason: "replay_result_for_workflow_step",
    metadata,
  };
}

function compareReplayStepResults(
  left: ReplayStepResult,
  right: ReplayStepResult,
  workflowStepOrder: ReadonlyMap<string, number>,
): number {
  const leftIndex = workflowStepOrder.get(left.stepId) ?? Number.MAX_SAFE_INTEGER;
  const rightIndex = workflowStepOrder.get(right.stepId) ?? Number.MAX_SAFE_INTEGER;
  return leftIndex - rightIndex || left.stepId.localeCompare(right.stepId) || left.id.localeCompare(right.id);
}

function compareEdges(left: EvidenceGraphEdge, right: EvidenceGraphEdge): number {
  return left.id.localeCompare(right.id);
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

function parseIsoTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function getHttpMethod(event: ObservationEvent): HttpRequestStep["method"] | undefined {
  const method = getStringPayload(event, "method")?.toUpperCase();
  if (method !== undefined && supportedHttpMethods.has(method as HttpRequestStep["method"])) {
    return method as HttpRequestStep["method"];
  }
  return undefined;
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

function makeEvidenceRef(edgeId: string): string {
  return `evidence://${edgeId}`;
}

function collectWorkflowEvidenceRefs(steps: readonly HttpRequestStep[]): string[] {
  return [...new Set(steps.flatMap((step) => step.evidenceRefs))].sort();
}
