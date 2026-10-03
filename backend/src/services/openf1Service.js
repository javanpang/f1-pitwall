import axios from "axios";
import { memoizeAsync } from "../utils/memoizeAsync.js";

const BASE_URL = "https://api.openf1.org/v1";

const TTL = {
  MEETINGS: 6 * 60 * 60 * 1000,
  SESSIONS: 5 * 60 * 1000,
};

const openf1 = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "F1Pitwall/1.0",
  },
});

// ==== Session Endpoints ====

async function fetchSessions({ year, meeting_key } = {}) {
  const params = {};
  if (year) params.year = year;
  if (meeting_key) params.meeting_key = meeting_key;

  const { data } = await openf1.get("/sessions", { params });
  return data;
}

export async function getLatestSession() {
  const { data } = await openf1.get("/sessions", {
    params: { session_key: "latest" },
  });
  return data[0] || null;
}

// ==== Meeting Endpoints ====

async function fetchMeetings({ year } = {}) {
  const params = {};
  if (year) params.year = year;

  const { data } = await openf1.get("/meetings", { params });
  return data;
}

export async function getLatestMeeting() {
  const { data } = await openf1.get("/meetings", {
    params: { meeting_key: "latest" },
  });
  return data[0] || null;
}

// ==== Driver Endpoints ====

export async function getDrivers(sessionKey) {
  const { data } = await openf1.get("/drivers", {
    params: { session_key: sessionKey },
  });
  return data;
}

export const getSessions = memoizeAsync(fetchSessions, { ttlMs: TTL.SESSIONS });
export const getMeetings = memoizeAsync(fetchMeetings, { ttlMs: TTL.MEETINGS });
