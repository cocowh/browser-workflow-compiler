import type { ObservationEvent } from "@bwc/observation-ir";
import type { RecordingSession } from "@bwc/shared";

export type CreateRecordingSessionInput = {
  name?: string;
  metadata?: Record<string, unknown>;
};

export interface RecordingStore {
  createSession(input: CreateRecordingSessionInput): Promise<RecordingSession>;
  listSessions(): Promise<RecordingSession[]>;
  getSession(sessionId: string): Promise<RecordingSession | undefined>;
  appendEvent(sessionId: string, event: ObservationEvent): Promise<ObservationEvent>;
  listEvents(sessionId: string): Promise<ObservationEvent[]>;
  close(): Promise<void>;
}
