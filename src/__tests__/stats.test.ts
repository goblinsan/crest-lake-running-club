describe('Stats logic', () => {
  it('filters past events by date', () => {
    const now = new Date('2026-06-01T00:00:00Z');
    const events = [
      { id: '1', date: new Date('2026-05-01T06:00:00Z'), title: 'Past Run 1' },
      { id: '2', date: new Date('2026-05-15T07:00:00Z'), title: 'Past Run 2' },
      { id: '3', date: new Date('2026-06-15T07:00:00Z'), title: 'Future Run' },
    ];
    const pastEvents = events.filter((e) => e.date < now);
    expect(pastEvents).toHaveLength(2);
    expect(pastEvents.map((e) => e.title)).not.toContain('Future Run');
  });

  it('sorts top attendees by check-in count descending', () => {
    const attendees = [
      { id: 'u1', name: 'Alice', checkIns: 10 },
      { id: 'u2', name: 'Bob', checkIns: 5 },
      { id: 'u3', name: 'Carol', checkIns: 8 },
    ];
    const sorted = [...attendees].sort((a, b) => b.checkIns - a.checkIns);
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[1].name).toBe('Carol');
    expect(sorted[2].name).toBe('Bob');
  });

  it('filters attendees with zero check-ins from leaderboard', () => {
    const attendees = [
      { id: 'u1', name: 'Alice', checkIns: 3 },
      { id: 'u2', name: 'Bob', checkIns: 0 },
      { id: 'u3', name: 'Carol', checkIns: 1 },
    ];
    const filtered = attendees.filter((a) => a.checkIns > 0);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.name)).not.toContain('Bob');
  });

  it('formats attendance run label correctly', () => {
    function runLabel(count: number): string {
      return `${count} ${count === 1 ? 'run' : 'runs'}`;
    }
    expect(runLabel(1)).toBe('1 run');
    expect(runLabel(0)).toBe('0 runs');
    expect(runLabel(5)).toBe('5 runs');
  });
});
