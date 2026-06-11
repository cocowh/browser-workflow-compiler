import type { ObservationEvent } from "@bwc/observation-ir";

type EventInspectorProps = {
  event: ObservationEvent | undefined;
};

export function EventInspector({ event }: EventInspectorProps) {
  if (!event) {
    return <p className="empty-state">Select an event to inspect its payload and evidence references.</p>;
  }

  return (
    <>
      <dl className="details">
        <div>
          <dt>Event ID</dt>
          <dd>{event.id}</dd>
        </div>
        <div>
          <dt>Actor</dt>
          <dd>{event.actor}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{event.tags.join(", ") || "none"}</dd>
        </div>
      </dl>
      <pre className="payload">{JSON.stringify(event.payload, null, 2)}</pre>
    </>
  );
}
