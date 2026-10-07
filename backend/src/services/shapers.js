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
