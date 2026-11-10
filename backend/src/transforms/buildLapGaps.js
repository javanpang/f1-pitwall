const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Gap to leader at the end of every lap, from lap completion times.
 */
export function buildLapGaps(index) {
  const byLap = new Map();

  for (const { driver, laps } of index) {
    for (const lap of laps) {
      if (!Number.isInteger(lap.lapNumber) || lap.endMs === null) continue;
      const list = byLap.get(lap.lapNumber) ?? [];
      list.push({ driverNumber: driver.driver_number, endMs: lap.endMs });
      byLap.set(lap.lapNumber, list);
    }
  }

  const laps = [...byLap.keys()]
    .sort((a, b) => a - b)
    .map((lapNumber) => {
      const crossings = byLap.get(lapNumber).sort((a, b) => a.endMs - b.endMs);
      const leader = crossings[0];
      const gaps = {};
      for (const c of crossings) {
        gaps[c.driverNumber] = round3((c.endMs - leader.endMs) / 1000);
      }
      return {
        lap: lapNumber,
        at: new Date(leader.endMs).toISOString(),
        leader: leader.driverNumber,
        gaps,
      };
    });

  return { totalLaps: laps.at(-1)?.lap ?? 0, laps };
}
