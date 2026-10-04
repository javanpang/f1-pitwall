import axios, { isAxiosError } from "axios";
import { memoizeAsync } from "../utils/memoizeAsync.js";
import { toUpstreamError } from "./upstreamError.js";

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

// Handle OpenF1 API errors consistently
openf1.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toUpstreamError(error)),
);

// ==== Session Endpoints ====
async function getList(path, params) {
  try {
    const { data } = await openf1.get(path, { params });
    return data;
  } catch (error) {
    const original = error.cause ?? error;
    if (
      isAxiosError(original) &&
      original.response?.status === 404 &&
      original.response.data?.detail === "No results found."
    )
      return [];
    throw error;
  }
}

async function fetchSessions({ year, meeting_key } = {}) {
  const params = {};
  if (year) params.year = year;
  if (meeting_key) params.meeting_key = meeting_key;

  return getList("/sessions", params);
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

  return getList("/meetings", params);
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
