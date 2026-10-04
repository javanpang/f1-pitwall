import { describe, expect, it, vi } from "vitest";
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

  it("maps a 429 to a 503", async () => {
    const { getMeetings } = await loadClient(reject(429, {}));
    await expect(getMeetings({ year: 2026 })).rejects.toMatchObject({
      status: 503,
    });
  });
});
