import {
  getDrivers,
  getIntervals,
  getLaps,
  getPits,
  getPositions,
  getStints,
} from "../clients/openf1Client.js";

import { cacheWhenFinished } from "./sessionCache.js";
import {
  buildTimingTowerRows,
  indexTimingData,
} from "../transforms/buildTimingTowerRows.js";
import { buildLapGaps } from "../transforms/buildLapGaps.js";
import { buildPitStops } from "../transforms/buildPitStops.js";

async function loadTimingIndex(sessionKey) {
  const [drivers, positions, intervals, laps, stints, pits] = await Promise.all(
    [
      getDrivers(sessionKey),
      getPositions(sessionKey),
      getIntervals(sessionKey),
      getLaps(sessionKey),
      getStints(sessionKey),
      getPits(sessionKey),
    ],
  );
  return indexTimingData({ drivers, positions, intervals, laps, stints, pits });
}

const getTimingIndex = cacheWhenFinished(loadTimingIndex);

export async function getTiming(sessionKey, at = null) {
  const { finished, data: index } = await getTimingIndex(sessionKey);
  return { finished, rows: buildTimingTowerRows(index, at) };
}

export async function getLapGaps(sessionKey) {
  const { finished, data: index } = await getTimingIndex(sessionKey);
  return { finished, lapGaps: buildLapGaps(index) };
}

export async function getPitStops(sessionKey) {
  const { finished, data: index } = await getTimingIndex(sessionKey);
  return { finished, pitStops: buildPitStops(index) };
}
