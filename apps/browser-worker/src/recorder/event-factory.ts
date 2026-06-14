import type { ArtifactRef, ObservationEvent } from "@bwc/observation-ir";
import { createId } from "@bwc/shared";

export function makeEvent(input: {
  sessionId: string;
  type: ObservationEvent["type"];
  sequence: number;
  pageUrl: string;
  payload: Record<string, unknown>;
  actor?: ObservationEvent["actor"];
  frameId?: string;
  artifactRefs?: ArtifactRef[];
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
    artifactRefs: input.artifactRefs ?? [],
    tags: input.tags ?? [],
  };

  if (input.frameId !== undefined) {
    event.frameId = input.frameId;
  }

  return event;
}
