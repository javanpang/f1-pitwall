const COMPOUNDS = new Set(["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"]);
const SECTORS = [1, 2, 3];
const FALLBACK_TEAM_COLOUR = "#9CA3AF";

const toCompound = (value) => {
  const upper = String(value ?? "").toUpperCase();
  return COMPOUNDS.has(upper) ? upper : "UNKNOWN";
};

const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

const toMs = (iso) => {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

const minOf = (values) => {
  let min = null;
  for (const v of values) {
    if (isNumber(v) && (min === null || v < min)) min = v;
  }
  return min;
};

function groupByDriver(records) {
  const map = new Map();
  for (const rec of records) {
    const list = map.get(rec.driver_number);
    if (list) list.push(rec);
    else map.set(rec.driver_number, [rec]);
  }
  return map;
}

function toSeries(records = [], pick) {
  const series = [];
  for (const r of records) {
    const t = toMs(r.date);
    if (t !== null) series.push({ t, value: pick(r) });
  }
  return series.sort((a, b) => a.t - b.t);
}

function toLapSeries(records = []) {
  const sorted = [...records].sort((a, b) => a.lap_number - b.lap_number);
  return sorted.map((lap, i) => {
    const start = toMs(lap.date_start);
    const endMs =
      isNumber(lap.lap_duration) && start !== null
        ? start + lap.lap_duration * 1000
        : toMs(sorted[i + 1]?.date_start);
    return {
      lapNumber: lap.lap_number,
      endMs,
      duration: lap.lap_duration,
      sectors: SECTORS.map((n) => lap[`duration_sector_${n}`]),
    };
  });
}

export function indexTimingData({
  drivers,
  positions,
  intervals,
  laps,
  stints,
  pits,
}) {
  const positionBy = groupByDriver(positions);
  const intervalBy = groupByDriver(intervals);
  const lapBy = groupByDriver(laps);
  const stintsBy = groupByDriver(stints);
  const pitsBy = groupByDriver(pits);

  return drivers.map((driver) => {
    const n = driver.driver_number;
    return {
      driver,
      positions: toSeries(positionBy.get(n), (r) => r.position),
      intervals: toSeries(intervalBy.get(n), (r) => r.interval),
      laps: toLapSeries(lapBy.get(n)),
      stints: [...(stintsBy.get(n) ?? [])].sort(
        (a, b) => a.stint_number - b.stint_number,
      ),
      pits: toSeries(pitsBy.get(n), () => null),
    };
  });
}

function countUpTo(series, at) {
  if (at === null) return series.length;
  let lo = 0;
  let hi = series.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (series[mid].t <= at) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function statusFor(value, driverBest, overallBest) {
  if (!isNumber(value)) return "default";
  if (overallBest !== null && value <= overallBest) return "overall-best";
  if (driverBest !== null && value <= driverBest) return "personal-best";
  return "default";
}

export function buildTimingTowerRows(index, at = null) {
  const states = [];
  for (const entry of index) {
    const positionCount = countUpTo(entry.positions, at);
    if (positionCount === 0) continue;

    const lapsDone = entry.laps.filter(
      (l) => at === null || (l.endMs !== null && l.endMs <= at),
    );
    states.push({ entry, positionCount, lapsDone });
  }

  const allDone = states.flatMap((s) => s.lapsDone);
  const overallBestLap = minOf(allDone.map((l) => l.duration));
  const overallBestSectors = SECTORS.map((_, i) =>
    minOf(allDone.map((l) => l.sectors[i])),
  );

  const rows = states.map(({ entry, positionCount, lapsDone }) => {
    const { driver } = entry;

    const first = entry.positions[0].value;
    const current = entry.positions[positionCount - 1].value;
    let positionChange = "none";
    if (current < first) positionChange = "up";
    else if (current > first) positionChange = "down";

    const intervalCount = countUpTo(entry.intervals, at);
    const rawInterval =
      intervalCount > 0 ? entry.intervals[intervalCount - 1].value : null;
    const intervalSeconds =
      current === 1 || !isNumber(rawInterval) ? null : rawInterval;

    const timed = lapsDone.filter((l) => isNumber(l.duration));
    const lastLap = timed.at(-1);
    const driverBestLap = minOf(timed.map((l) => l.duration));
    const driverBestSectors = SECTORS.map((_, i) =>
      minOf(lapsDone.map((l) => l.sectors[i])),
    );

    const sectors = SECTORS.map((_, i) => {
      const seconds = lastLap?.sectors[i] ?? null;
      return {
        seconds: isNumber(seconds) ? seconds : null,
        status: statusFor(seconds, driverBestSectors[i], overallBestSectors[i]),
      };
    });

    const currentLapNumber = lapsDone.at(-1)?.lapNumber ?? null;
    const lapInProgress = (currentLapNumber ?? 0) + 1;
    const latestStint = entry.stints
      .filter((s) => at === null || s.lap_start <= lapInProgress)
      .at(-1);
    const ageLaps =
      latestStint &&
      isNumber(latestStint.tyre_age_at_start) &&
      currentLapNumber !== null
        ? latestStint.tyre_age_at_start +
          Math.max(0, currentLapNumber - latestStint.lap_start)
        : null;

    let bestLapStatus = "default";
    if (driverBestLap !== null) {
      bestLapStatus =
        driverBestLap === overallBestLap ? "overall-best" : "personal-best";
    }

    return {
      position: current,
      driverNumber: driver.driver_number,
      nameAcronym: driver.name_acronym,
      teamName: driver.team_name,
      teamColour: driver.team_colour
        ? `#${driver.team_colour}`
        : FALLBACK_TEAM_COLOUR,
      positionChange,
      intervalSeconds,
      sectors,
      lastLap: {
        seconds: lastLap?.duration ?? null,
        status: statusFor(lastLap?.duration, driverBestLap, overallBestLap),
      },
      bestLap: { seconds: driverBestLap, status: bestLapStatus },
      tyre: { compound: toCompound(latestStint?.compound), ageLaps },
      pitStops: countUpTo(entry.pits, at),
    };
  });

  return rows.sort((a, b) => a.position - b.position);
}
