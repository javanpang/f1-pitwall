import { toCompound, toTeamColour } from "./shapers.js";

function valueAt(series, t) {
  let value = null;
  for (const point of series) {
    if (point.t > t) break;
    value = point.value;
  }
  return value;
}

const toTyre = (stint) =>
  stint
    ? {
        compound: toCompound(stint.compound),
        ageLaps: Number.isInteger(stint.tyre_age_at_start)
          ? stint.tyre_age_at_start
          : null,
      }
    : null;

/**
 * Build pit stop data with the oldest first, tyre compound change and the position change from in-lap to out-lap.
 */
export function buildPitStops(index) {
  const stops = [];

  for (const { driver, positions, laps, stints, pits } of index) {
    const n = driver.driver_number;

    pits.forEach(({ t, value: pit }, i) => {
      const lap = Number.isInteger(pit.lapNumber) ? pit.lapNumber : null;

      // Pitting on lap N puts the car on a new stint from lap N + 1.
      const before =
        lap === null ? null : stints.filter((s) => s.lap_start <= lap).at(-1);
      const after = lap === null ? null : stints.find((s) => s.lap_start > lap);

      const lapEnd = (number) =>
        laps.find((l) => l.lapNumber === number)?.endMs ?? null;

      // read the position going in from the in-lap
      const inLapStart = lap === null ? null : lapEnd(lap - 1);
      const outLapEnd = lap === null ? null : lapEnd(lap + 1);

      stops.push({
        id: `${n}-${i}`,
        date: new Date(t).toISOString(),
        lapNumber: lap,
        driver: {
          number: n,
          acronym: driver.name_acronym,
          teamColour: toTeamColour(driver.team_colour),
        },
        tyreFrom: toTyre(before),
        tyreTo: toTyre(after),
        stopSeconds: pit.stopSeconds,
        laneSeconds: pit.laneSeconds,
        positionBefore: valueAt(
          positions,
          inLapStart === null ? t : Math.min(inLapStart, t),
        ),
        positionAfter:
          outLapEnd === null ? null : valueAt(positions, outLapEnd),
        settledAt:
          outLapEnd === null ? null : new Date(outLapEnd).toISOString(),
      });
    });
  }

  return stops.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}
