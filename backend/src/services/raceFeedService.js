import {
  getDrivers,
  getPits,
  getRaceControl,
} from "../clients/openf1Client.js";

import { cacheWhenFinished } from "./sessionCache.js";
import { buildRaceFeed } from "../transforms/buildRaceFeed.js";

async function loadRaceFeed(sessionKey) {
  const [raceControl, pits, drivers] = await Promise.all([
    getRaceControl(sessionKey),
    getPits(sessionKey),
    getDrivers(sessionKey),
  ]);
  return buildRaceFeed({ raceControl, pits, drivers });
}

const getCachedRaceFeed = cacheWhenFinished(loadRaceFeed);

export async function getRaceFeed(sessionKey) {
  const { finished, data: events } = await getCachedRaceFeed(sessionKey);
  return { finished, events };
}
