import axios, { isAxiosError } from "axios";
import axiosRetry, {
  exponentialDelay,
  isNetworkOrIdempotentRequestError,
} from "axios-retry";
import PQueue from "p-queue";
import { memoizeAsync } from "../utils/memoizeAsync.js";
import { toUpstreamError } from "./upstreamError.js";

const BASE_URL = "https://api.openf1.org/v1";

const TTL = {
  MEETINGS: 6 * 60 * 60 * 1000,
  SESSIONS: 5 * 60 * 1000,
};

const RATE_INTERVAL_MS = 1000;
const RATE_CAP = 2;

const RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30_000;

const openf1 = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "User-Agent": "F1Pitwall/1.0",
  },
});

// ==== Rate Limiter ====
const queue = new PQueue({ interval: RATE_INTERVAL_MS, intervalCap: RATE_CAP });

openf1.interceptors.request.use(async (config) => {
  await queue.add(() => {});
  return config;
});

let resumeAt = 0;
let resumeTimer;

function backOff(ms) {
  const target = Date.now() + ms;
  if (target <= resumeAt) return;
  resumeAt = target;
  queue.pause();
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => queue.start(), ms);
  resumeTimer.unref?.();
}

// ==== Retries ====
function retryDelay(retryCount, error) {
  const retryAfterSec = Number(error.response?.headers?.["retry-after"]);
  const delay =
    retryAfterSec > 0
      ? retryAfterSec * 1000
      : exponentialDelay(retryCount, error, BASE_RETRY_DELAY_MS);
  return Math.min(delay, MAX_RETRY_DELAY_MS);
}

axiosRetry(openf1, {
  retries: RETRIES,
  retryDelay,
  retryCondition: (error) =>
    isNetworkOrIdempotentRequestError(error) || error.response?.status === 429,
  onRetry: (retryCount, error) => {
    if (error.response?.status === 429) backOff(retryDelay(retryCount, error));
  },
});

openf1.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toUpstreamError(error)),
);

// ==== Shared helper ====
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

// ==== Session Endpoints ====
async function fetchSessions({ year, meeting_key, session_key } = {}) {
  const params = {};
  if (year) params.year = year;
  if (meeting_key) params.meeting_key = meeting_key;
  if (session_key) params.session_key = session_key;

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

// ==== Timing Endpoints ====
export const getDrivers = (sessionKey) =>
  getList("/drivers", { session_key: sessionKey });

export const getLaps = (sessionKey) =>
  getList("/laps", { session_key: sessionKey });

export const getPositions = (sessionKey) =>
  getList("/position", { session_key: sessionKey });

export const getIntervals = (sessionKey) =>
  getList("/intervals", { session_key: sessionKey });

export const getStints = (sessionKey) =>
  getList("/stints", { session_key: sessionKey });

export const getPits = (sessionKey) =>
  getList("/pit", { session_key: sessionKey });

// ==== Location Endpoints ====
export async function getLocation({ sessionKey, driverNumber, from, to }) {
  return getList("/location", {
    session_key: sessionKey,
    driver_number: driverNumber,
    "date>": from,
    "date<": to,
  });
}

export const getSessions = memoizeAsync(fetchSessions, { ttlMs: TTL.SESSIONS });
export const getMeetings = memoizeAsync(fetchMeetings, { ttlMs: TTL.MEETINGS });
