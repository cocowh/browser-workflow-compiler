import { AppShell } from "./components/layout/AppShell";
import { demoEvents, demoSession } from "./data/demo";

export function App() {
  return <AppShell session={demoSession} events={demoEvents} selectedEvent={demoEvents.at(-1)} />;
}
