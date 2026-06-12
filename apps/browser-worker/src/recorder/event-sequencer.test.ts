import { describe, expect, it } from "vitest";
import { EventSequencer } from "./event-sequencer.js";

describe("EventSequencer", () => {
  it("returns monotonic sequence values from zero by default", () => {
    const sequencer = new EventSequencer();

    expect(sequencer.nextSequence()).toBe(0);
    expect(sequencer.nextSequence()).toBe(1);
    expect(sequencer.nextSequence()).toBe(2);
  });

  it("can start from a custom sequence", () => {
    const sequencer = new EventSequencer(10);

    expect(sequencer.nextSequence()).toBe(10);
    expect(sequencer.nextSequence()).toBe(11);
  });
});
