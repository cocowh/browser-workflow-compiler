import type { RecordingSession } from "@bwc/shared";
import { CircleDot } from "lucide-react";

type SessionListProps = {
  sessions: RecordingSession[];
  activeSessionId?: string;
};

export function SessionList({ sessions, activeSessionId }: SessionListProps) {
  return (
    <section className="session-list" aria-label="Sessions">
      {sessions.map((session) => (
        <article className={session.id === activeSessionId ? "session-item active" : "session-item"} key={session.id}>
          <div>
            <strong>{session.name ?? session.id}</strong>
            <span>{session.id}</span>
          </div>
          <CircleDot size={16} aria-hidden="true" />
        </article>
      ))}
    </section>
  );
}
