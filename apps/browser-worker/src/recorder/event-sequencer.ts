export class EventSequencer {
  private nextValue: number;

  constructor(start = 0) {
    this.nextValue = start;
  }

  nextSequence(): number {
    const sequence = this.nextValue;
    this.nextValue += 1;
    return sequence;
  }
}
