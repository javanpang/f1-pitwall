export function shapeSession(s) {
  if (!s) return null;
  return {
    key: s.session_key,
    name: s.session_name,
    type: s.session_type,
    dateStart: s.date_start,
    dateEnd: s.date_end,
  };
}

export function shapeMeeting(m) {
  if (!m) return null;
  return {
    key: m.meeting_key,
    name: m.meeting_name,
    officialName: m.meeting_official_name,
    circuit: m.circuit_short_name,
    country: m.country_name,
    location: m.location,
    dateStart: m.date_start,
    dateEnd: m.date_end,
    year: m.year,
  };
}

// ------ Shared value helpers ------

const COMPOUNDS = new Set(["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"]);
const FALLBACK_TEAM_COLOUR = "#9CA3AF";

export const isNumber = (v) => typeof v === "number" && Number.isFinite(v);

/** ISO timestamp to milliseconds, or null if it doesn't parse. */
export const toMs = (iso) => {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
};

/** OpenF1 tyre compound, normalised to a known compound or "UNKNOWN". */
export const toCompound = (value) => {
  const upper = String(value ?? "").toUpperCase();
  return COMPOUNDS.has(upper) ? upper : "UNKNOWN";
};

/** OpenF1 `team_colour` to a CSS colour, with a grey fallback. */
export const toTeamColour = (raw) => (raw ? `#${raw}` : FALLBACK_TEAM_COLOUR);
