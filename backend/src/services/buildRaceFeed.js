const FALLBACK_TEAM_COLOUR = "#9CA3AF";

const CATEGORY_KIND = {
  Flag: "flag",
  SafetyCar: "safety-car",
  Drs: "drs",
  SessionStatus: "session",
};

const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

const toMs = (iso) => {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

export function classifyRaceControl(record) {
  if (String(record.message ?? "").startsWith("FIA STEWARDS")) return "steward";
  return CATEGORY_KIND[record.category] ?? "other";
}

function formatPitMessage(pit) {
  const parts = ["PIT STOP"];
  if (isNumber(pit.stop_duration))
    parts.push(`${pit.stop_duration.toFixed(1)}s stationary`);
  const lane = pit.lane_duration ?? pit.pit_duration;
  if (isNumber(lane)) parts.push(`${lane.toFixed(1)}s in pit lane`);
  return parts.join(" - ");
}

function indexDrivers(drivers) {
  const map = new Map();
  for (const d of drivers) {
    map.set(d.driver_number, {
      number: d.driver_number,
      acronym: d.name_acronym ?? String(d.driver_number),
      teamColour: d.team_colour ? `#${d.team_colour}` : FALLBACK_TEAM_COLOUR,
    });
  }
  return map;
}

/** Merges race control messages and pit stops into one feed, oldest first. */
export function buildRaceFeed({ raceControl = [], pits = [], drivers = [] }) {
  const driverBy = indexDrivers(drivers);
  const driverFor = (n) => (n == null ? null : (driverBy.get(n) ?? null));

  const events = [];

  raceControl.forEach((rc, i) => {
    const t = toMs(rc.date);
    if (t === null) return;
    events.push({
      t,
      id: `rc-${i}`,
      kind: classifyRaceControl(rc),
      flag: rc.flag ?? null,
      lapNumber: rc.lap_number ?? null,
      message: rc.message ?? "",
      driver: driverFor(rc.driver_number),
    });
  });

  pits.forEach((pit, i) => {
    const t = toMs(pit.date);
    if (t === null) return;
    events.push({
      t,
      id: `pit-${i}`,
      kind: "pit",
      flag: null,
      lapNumber: pit.lap_number ?? null,
      message: formatPitMessage(pit),
      driver: driverFor(pit.driver_number),
    });
  });

  return events
    .sort((a, b) => a.t - b.t)
    .map(({ t, ...event }) => ({ ...event, date: new Date(t).toISOString() }));
}
