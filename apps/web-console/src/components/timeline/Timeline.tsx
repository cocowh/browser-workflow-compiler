import type { ObservationEvent } from "@bwc/observation-ir";
import { TimelineRow } from "./TimelineRow";

type TimelineProps = {
  events: ObservationEvent[];
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="timeline">
      {events.map((event) => (
        <TimelineRow event={event} key={event.id} />
      ))}
    </div>
  );
}
