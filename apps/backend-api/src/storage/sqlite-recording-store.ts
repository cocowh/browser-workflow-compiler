import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ObservationEvent } from "@bwc/observation-ir";
import { createId, nowIso, type RecordingSession } from "@bwc/shared";
import type { CreateRecordingSessionInput, RecordingStore } from "./recording-store.js";

type SessionRow = {
  id: string;
  name: string | null;
  status: RecordingSession["status"];
  created_at: string;
  updated_at: string;
  started_at: string | null;
  stopped_at: string | null;
  metadata_json: string | null;
};

type EventRow = {
  id: string;
  session_id: string;
  type: ObservationEvent["type"];
  timestamp: number;
  sequence: number;
  page_url: string | null;
  frame_id: string | null;
  actor: ObservationEvent["actor"];
  payload_json: string;
  artifact_refs_json: string;
  tags_json: string;
};

export type SqliteRecordingStoreOptions = {
  dataDir?: string;
};

export class SqliteRecordingStore implements RecordingStore {
  readonly dataDir: string;
  readonly artifactsDir: string;
  private readonly db: DatabaseSync;

  constructor(options: SqliteRecordingStoreOptions = {}) {
    this.dataDir = options.dataDir ?? join(process.cwd(), ".bwc");
    this.artifactsDir = join(this.dataDir, "artifacts");

    mkdirSync(this.artifactsDir, { recursive: true });

    this.db = new DatabaseSync(join(this.dataDir, "bwc.sqlite"));
    this.db.exec("PRAGMA foreign_keys = ON");
    this.db.exec("PRAGMA journal_mode = WAL");
    this.migrate();
  }

  async createSession(input: CreateRecordingSessionInput): Promise<RecordingSession> {
    const now = nowIso();
    const session: RecordingSession = {
      id: createId("sess"),
      status: "created",
      createdAt: now,
      updatedAt: now,
    };

    if (input.name !== undefined) {
      session.name = input.name;
    }

    if (input.metadata !== undefined) {
      session.metadata = input.metadata;
    }

    this.db
      .prepare(
        `INSERT INTO recording_sessions
          (id, name, status, created_at, updated_at, started_at, stopped_at, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        session.id,
        session.name ?? null,
        session.status,
        session.createdAt,
        session.updatedAt,
        session.startedAt ?? null,
        session.stoppedAt ?? null,
        session.metadata === undefined ? null : JSON.stringify(session.metadata),
      );

    return session;
  }

  async listSessions(): Promise<RecordingSession[]> {
    const rows = this.db
      .prepare("SELECT * FROM recording_sessions ORDER BY created_at DESC, id ASC")
      .all() as SessionRow[];
    return rows.map(toSession);
  }

  async getSession(sessionId: string): Promise<RecordingSession | undefined> {
    const row = this.db.prepare("SELECT * FROM recording_sessions WHERE id = ?").get(sessionId) as
      | SessionRow
      | undefined;
    return row === undefined ? undefined : toSession(row);
  }

  async appendEvent(sessionId: string, event: ObservationEvent): Promise<ObservationEvent> {
    this.db
      .prepare(
        `INSERT INTO observation_events
          (id, session_id, type, timestamp, sequence, page_url, frame_id, actor,
           payload_json, artifact_refs_json, tags_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        event.id,
        sessionId,
        event.type,
        event.timestamp,
        event.sequence,
        event.pageUrl ?? null,
        event.frameId ?? null,
        event.actor,
        JSON.stringify(event.payload),
        JSON.stringify(event.artifactRefs),
        JSON.stringify(event.tags),
      );

    return event;
  }

  async listEvents(sessionId: string): Promise<ObservationEvent[]> {
    const rows = this.db
      .prepare(
        `SELECT * FROM observation_events
         WHERE session_id = ?
         ORDER BY sequence ASC, timestamp ASC, id ASC`,
      )
      .all(sessionId) as EventRow[];

    return rows.map(toEvent);
  }

  async close(): Promise<void> {
    this.db.close();
  }

  private migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recording_sessions (
        id TEXT PRIMARY KEY,
        name TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        started_at TEXT,
        stopped_at TEXT,
        metadata_json TEXT
      );

      CREATE TABLE IF NOT EXISTS observation_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        timestamp REAL NOT NULL,
        sequence INTEGER NOT NULL,
        page_url TEXT,
        frame_id TEXT,
        actor TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        artifact_refs_json TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        UNIQUE(session_id, sequence)
      );

      CREATE INDEX IF NOT EXISTS idx_observation_events_session_order
      ON observation_events(session_id, sequence, timestamp, id);
    `);
  }
}

function toSession(row: SessionRow): RecordingSession {
  const session: RecordingSession = {
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.name !== null) {
    session.name = row.name;
  }

  if (row.started_at !== null) {
    session.startedAt = row.started_at;
  }

  if (row.stopped_at !== null) {
    session.stoppedAt = row.stopped_at;
  }

  if (row.metadata_json !== null) {
    session.metadata = JSON.parse(row.metadata_json) as Record<string, unknown>;
  }

  return session;
}

function toEvent(row: EventRow): ObservationEvent {
  const event: ObservationEvent = {
    id: row.id,
    sessionId: row.session_id,
    type: row.type,
    timestamp: row.timestamp,
    sequence: row.sequence,
    actor: row.actor,
    payload: JSON.parse(row.payload_json) as Record<string, unknown>,
    artifactRefs: JSON.parse(row.artifact_refs_json) as ObservationEvent["artifactRefs"],
    tags: JSON.parse(row.tags_json) as string[],
  };

  if (row.page_url !== null) {
    event.pageUrl = row.page_url;
  }

  if (row.frame_id !== null) {
    event.frameId = row.frame_id;
  }

  return event;
}
