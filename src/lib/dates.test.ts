import { describe, expect, it } from "vitest";
import { addDays, daysBetween, isValidDateKey, listDates } from "./dates";

describe("isValidDateKey", () => {
  it("accepts real dates and rejects bad ones", () => {
    expect(isValidDateKey("2026-10-27")).toBe(true);
    expect(isValidDateKey("2028-02-29")).toBe(true); // leap year
    expect(isValidDateKey("2026-02-29")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
    expect(isValidDateKey("2026-1-1")).toBe(false);
    expect(isValidDateKey("not a date")).toBe(false);
  });
});

describe("addDays / daysBetween / listDates", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is not affected by DST changes", () => {
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
    expect(daysBetween("2026-10-31", "2026-11-02")).toBe(2);
  });

  it("lists dates inclusively", () => {
    expect(listDates("2026-10-30", "2026-11-02")).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
  });
});
