import type { ObservationEvent } from "@bwc/observation-ir";
import type { RecordingSession } from "@bwc/shared";
import { Activity, Network, Play, Square, Waypoints } from "lucide-react";
import { EventInspector } from "../inspector/EventInspector";
import { SessionList } from "../sessions/SessionList";
import { Timeline } from "../timeline/Timeline";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { PanelHeader } from "../ui/PanelHeader";

type AppShellProps = {
  session: RecordingSession;
  events: ObservationEvent[];
  selectedEvent: ObservationEvent | undefined;
};

export function AppShell({ session, events, selectedEvent }: AppShellProps) {
  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Recording sessions">
        <div className="brand">
          <Waypoints size={22} aria-hidden="true" />
          <span>BWC</span>
        </div>
        <Button icon={<Play size={16} aria-hidden="true" />}>Record</Button>
        <SessionList sessions={[session]} activeSessionId={session.id} />
      </aside>

      <section className="workspace" aria-label="Session workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Recording Session</p>
            <h1>{session.name ?? session.id}</h1>
          </div>
          <Badge label="Recording state" icon={<Activity size={16} aria-hidden="true" />}>
            {session.status}
          </Badge>
        </header>

        <section className="timeline-panel" aria-label="Observation timeline">
          <PanelHeader
            eyebrow="Observation IR"
            title="Timeline"
            action={
              <Button variant="icon" label="Stop recording" icon={<Square size={17} aria-hidden="true" />}>
                Stop recording
              </Button>
            }
          />
          <Timeline events={events} />
        </section>
      </section>

      <aside className="inspector" aria-label="Event inspector">
        <PanelHeader
          eyebrow="Inspector"
          title={selectedEvent?.type ?? "No event selected"}
          action={<Network size={19} aria-hidden="true" />}
        />
        <EventInspector event={selectedEvent} />
      </aside>
    </main>
  );
}
