import type { ArtifactRef, ObservationEvent } from "@bwc/observation-ir";
import { createId } from "@bwc/shared";
import type { Page, Request, Response } from "playwright";
import { makeEvent } from "./event-factory.js";
import type { EventSequencer } from "./event-sequencer.js";

const staticAssetExtensions = [
  ".avif",
  ".css",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".map",
  ".png",
  ".svg",
  ".webp",
  ".woff",
  ".woff2",
];

const staticResourceTypes = new Set(["document", "font", "image", "media", "script", "stylesheet"]);

export type NetworkCaptureContext = {
  sessionId: string;
  page: Page;
  events: ObservationEvent[];
  sequencer: EventSequencer;
};

export type RequestFacts = {
  requestId: string;
  method: string;
  url: string;
  resourceType: string;
  headers: Record<string, string>;
  postData: string | null;
  timing: ReturnType<Request["timing"]>;
};

export type ResponseFacts = {
  requestId: string;
  method: string;
  url: string;
  resourceType: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  contentType: string | undefined;
  timing: ReturnType<Request["timing"]>;
};

export function attachNetworkCapture(context: NetworkCaptureContext): () => Promise<void> {
  const requestIds = new WeakMap<Request, string>();
  const pendingResponseCaptures = new Set<Promise<void>>();

  const onRequest = (request: Request) => {
    if (shouldFilterRequest(request)) {
      return;
    }

    const requestId = createId("req");
    requestIds.set(request, requestId);
    context.events.push(
      makeNetworkRequestEvent({
        facts: getRequestFacts(request, requestId),
        sessionId: context.sessionId,
        sequence: context.sequencer.nextSequence(),
        pageUrl: context.page.url(),
      }),
    );
  };

  const onResponse = (response: Response) => {
    const request = response.request();
    const requestId = requestIds.get(request);
    if (requestId === undefined) {
      return;
    }

    const capture = Promise.resolve().then(async () => {
      context.events.push(
        makeNetworkResponseEvent({
          facts: await getResponseFacts(response, requestId),
          sessionId: context.sessionId,
          sequence: context.sequencer.nextSequence(),
          pageUrl: context.page.url(),
        }),
      );
    });

    pendingResponseCaptures.add(capture);
    capture.finally(() => pendingResponseCaptures.delete(capture));
  };

  context.page.on("request", onRequest);
  context.page.on("response", onResponse);

  return async () => {
    context.page.off("request", onRequest);
    context.page.off("response", onResponse);
    await Promise.allSettled([...pendingResponseCaptures]);
  };
}

export function makeNetworkRequestEvent(input: {
  facts: RequestFacts;
  sessionId: string;
  sequence: number;
  pageUrl: string;
}): ObservationEvent {
  const artifactRefs = makeRequestArtifactRefs(input.sessionId, input.facts);
  return makeEvent({
    sessionId: input.sessionId,
    type: "network.request",
    sequence: input.sequence,
    pageUrl: input.pageUrl,
    actor: "network",
    payload: {
      requestId: input.facts.requestId,
      method: input.facts.method,
      url: input.facts.url,
      resourceType: input.facts.resourceType,
      headersRef: getArtifactUri(artifactRefs, "headers"),
      bodyRef: getArtifactUri(artifactRefs, "request_body"),
      timing: input.facts.timing,
    },
    artifactRefs,
    tags: detectNetworkTags({
      method: input.facts.method,
      url: input.facts.url,
      headers: input.facts.headers,
      body: input.facts.postData,
    }),
  });
}

export function makeNetworkResponseEvent(input: {
  facts: ResponseFacts;
  sessionId: string;
  sequence: number;
  pageUrl: string;
}): ObservationEvent {
  const artifactRefs = makeResponseArtifactRefs(input.sessionId, input.facts);
  return makeEvent({
    sessionId: input.sessionId,
    type: "network.response",
    sequence: input.sequence,
    pageUrl: input.pageUrl,
    actor: "network",
    payload: {
      requestId: input.facts.requestId,
      method: input.facts.method,
      url: input.facts.url,
      resourceType: input.facts.resourceType,
      status: input.facts.status,
      statusText: input.facts.statusText,
      contentType: input.facts.contentType,
      headersRef: getArtifactUri(artifactRefs, "headers"),
      bodyRef: getArtifactUri(artifactRefs, "response_body"),
      timing: input.facts.timing,
    },
    artifactRefs,
    tags: detectNetworkTags({
      method: input.facts.method,
      url: input.facts.url,
      headers: input.facts.headers,
      body: undefined,
    }),
  });
}

export function shouldFilterRequest(request: Pick<Request, "resourceType" | "url">): boolean {
  const resourceType = request.resourceType();
  if (staticResourceTypes.has(resourceType)) {
    return true;
  }

  const pathname = safePathname(request.url());
  return staticAssetExtensions.some((extension) => pathname.endsWith(extension));
}

export function detectNetworkTags(input: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null | undefined;
}): string[] {
  const tags = new Set<string>();
  const contentType = input.headers["content-type"] ?? input.headers["Content-Type"];
  const accept = input.headers.accept ?? input.headers.Accept;

  if (contentType?.includes("application/json") || accept?.includes("application/json")) {
    tags.add("json");
  }

  if (looksLikeGraphql(input.url, input.body)) {
    tags.add("graphql");
  }

  if (hasSensitiveHeaders(input.headers)) {
    tags.add("sensitive");
  }

  return [...tags];
}

function getRequestFacts(request: Request, requestId: string): RequestFacts {
  return {
    requestId,
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
    headers: request.headers(),
    postData: request.postData(),
    timing: request.timing(),
  };
}

async function getResponseFacts(response: Response, requestId: string): Promise<ResponseFacts> {
  const request = response.request();
  return {
    requestId,
    method: request.method(),
    url: response.url(),
    resourceType: request.resourceType(),
    status: response.status(),
    statusText: response.statusText(),
    headers: await response.allHeaders(),
    contentType: response.headers()["content-type"],
    timing: request.timing(),
  };
}

function makeRequestArtifactRefs(sessionId: string, facts: RequestFacts): ArtifactRef[] {
  const refs: ArtifactRef[] = [
    {
      id: `${facts.requestId}_request_headers`,
      uri: `artifact://${sessionId}/${facts.requestId}/request.headers.json`,
      kind: "headers",
      mediaType: "application/json",
      sensitive: hasSensitiveHeaders(facts.headers),
    },
  ];

  if (facts.postData !== null) {
    const ref: ArtifactRef = {
      id: `${facts.requestId}_request_body`,
      uri: `artifact://${sessionId}/${facts.requestId}/request.body`,
      kind: "request_body",
      sensitive: hasSensitiveHeaders(facts.headers),
    };

    const mediaType = facts.headers["content-type"];
    if (mediaType !== undefined) {
      ref.mediaType = mediaType;
    }

    refs.push(ref);
  }

  return refs;
}

function makeResponseArtifactRefs(sessionId: string, facts: ResponseFacts): ArtifactRef[] {
  const bodyRef: ArtifactRef = {
    id: `${facts.requestId}_response_body`,
    uri: `artifact://${sessionId}/${facts.requestId}/response.body`,
    kind: "response_body",
    sensitive: hasSensitiveHeaders(facts.headers),
  };

  if (facts.contentType !== undefined) {
    bodyRef.mediaType = facts.contentType;
  }

  return [
    {
      id: `${facts.requestId}_response_headers`,
      uri: `artifact://${sessionId}/${facts.requestId}/response.headers.json`,
      kind: "headers",
      mediaType: "application/json",
      sensitive: hasSensitiveHeaders(facts.headers),
    },
    bodyRef,
  ];
}

function getArtifactUri(refs: ArtifactRef[], kind: ArtifactRef["kind"]): string | undefined {
  return refs.find((ref) => ref.kind === kind)?.uri;
}

function looksLikeGraphql(url: string, body: string | null | undefined): boolean {
  const pathname = safePathname(url);
  if (pathname.includes("graphql")) {
    return true;
  }

  if (body === undefined || body === null || body.length === 0) {
    return false;
  }

  try {
    const parsed = JSON.parse(body) as unknown;
    return typeof parsed === "object" && parsed !== null && ("query" in parsed || "operationName" in parsed);
  } catch {
    return false;
  }
}

function hasSensitiveHeaders(headers: Record<string, string>): boolean {
  return Object.keys(headers).some((name) => {
    const normalized = name.toLowerCase();
    return normalized === "authorization" || normalized === "cookie" || normalized === "set-cookie";
  });
}

function safePathname(url: string): string {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
