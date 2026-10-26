import { describe, expect, it, vi, afterEach } from "vitest";
import { AxiosError } from "axios";

async function loadClient(adapter) {
  vi.resetModules();
  const axios = (await import("axios")).default;
  axios.defaults.adapter = adapter;
  return import("./openf1Client.js");
}

const reject = (status, data) => (config) =>
  Promise.reject(
    new AxiosError("fail", "ERR_BAD_REQUEST", config, null, {
      status,
      data,
      headers: {},
      config,
    }),
  );

afterEach(() => vi.useRealTimers());

describe("openf1Client", () => {
  it("returns [] for OpenF1's 'No results found.' 404", async () => {
    const { getMeetings } = await loadClient(
      reject(404, { detail: "No results found." }),
    );
    await expect(getMeetings({ year: 1900 })).resolves.toEqual([]);
  });

  it("still rejects on a 404 with a different body (e.g. wrong endpoint)", async () => {
    const { getMeetings } = await loadClient(
      reject(404, { detail: "Not Found" }),
    );
    await expect(getMeetings({ year: 2026 })).rejects.toMatchObject({
      status: 502,
    });
  });

  it("retries a 429 and then succeeds", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const { getMeetings } = await loadClient((config) =>
      ++calls === 1
        ? reject(429, {})(config)
        : Promise.resolve({
            data: [{}],
            status: 200,
            statusText: "OK",
            headers: {},
            config,
          }),
    );

    const result = getMeetings({ year: 2026 });
    await vi.runAllTimersAsync();

    await expect(result).resolves.toHaveLength(1);
    expect(calls).toBe(2);
  });

  it("gives up after the retry budget and maps 429 to 503", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const { getMeetings } = await loadClient((config) => {
      calls++;
      return reject(429, {})(config);
    });

    const assertion = expect(getMeetings({ year: 2026 })).rejects.toMatchObject(
      { status: 503 },
    );
    await vi.runAllTimersAsync();

    await assertion;
    // TODO: check if calls is 3 or 4 depending on whether the first call counts as a retry.
    expect(calls).toBe(3);
  });

  it("returns [] when a session ahs not laps yet", async () => {
    const { getLaps } = await loadClient(
      reject(404, { detail: "No results found." }),
    );
    await expect(getLaps(1)).resolves.toEqual([]);
  });

  it("sends location date bounds using OpenF1's range-filter keys", async () => {
    let seen;
    const { getLocation } = await loadClient((config) => {
      seen = config.params;
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      });
    });

    await getLocation({
      sessionKey: 9,
      driverNumber: 1,
      from: "2026-01-01T00:00:00.000Z",
      to: "2026-01-01T00:01:00.000Z",
    });

    expect(seen).toEqual({
      session_key: 9,
      driver_number: 1,
      "date>": "2026-01-01T00:00:00.000Z",
      "date<": "2026-01-01T00:01:00.000Z",
    });
  });
});
