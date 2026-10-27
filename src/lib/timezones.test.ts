import { describe, expect, it } from "vitest";
import { COMMON_ZONES, gmtOffset, zoneOptions } from "./timezones";
import { isValidTimeZone } from "./time";

const SUMMER = new Date("2026-07-01T12:00:00Z");
const WINTER = new Date("2026-12-01T12:00:00Z");

describe("time-zone menu", () => {
  it("only lists real IANA zones", () => {
    for (const z of COMMON_ZONES) expect(isValidTimeZone(z.zone)).toBe(true);
  });
  it("shows the official offset for that date (daylight saving included)", () => {
    expect(gmtOffset("America/Chicago", SUMMER)).toBe("GMT−05:00");
    expect(gmtOffset("America/Chicago", WINTER)).toBe("GMT−06:00");
    expect(gmtOffset("Asia/Kolkata", WINTER)).toBe("GMT+05:30");
    expect(gmtOffset("Europe/London", WINTER)).toBe("GMT+00:00");
  });
  it("labels each option with its offset and cities, sorted west to east", () => {
    const options = zoneOptions(WINTER);
    expect(options.find((o) => o.value === "America/Chicago")?.label).toBe("GMT−06:00 · Central Time: Chicago, Dallas, Winnipeg");
    expect(options[0].value).toBe("Pacific/Honolulu");
    expect(options.at(-1)?.value).toBe("Pacific/Auckland");
  });
  it("keeps a saved zone that isn't in the list", () => {
    expect(zoneOptions(WINTER, "Europe/Vienna").some((o) => o.value === "Europe/Vienna")).toBe(true);
  });
});
