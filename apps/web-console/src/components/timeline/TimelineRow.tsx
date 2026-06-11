import type { ObservationEvent } from "@bwc/observation-ir";

type TimelineRowProps = {
  event: ObservationEvent;
};

export function TimelineRow({ event }: TimelineRowProps) {
  return (
    <article className="timeline-row">
      <span className="sequence">{event.sequence}</span>
      <div className="event-body">
        <strong>{event.type}</strong>
        <span>{event.pageUrl}</span>
      </div>
      <span className="actor">{event.actor}</span>
    </article>
  );
}
