"use client";

// Pick the timesheet's range: a length (1 week, 2 weeks, or custom days) and EITHER its
// first or its last day. It's a plain GET form, so the choice lives in the URL
// (/log?preset=1w&anchor=end&date=2026-10-27) and the server builds the timesheet.
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { Field } from "@/components/ds/Field";
import { Segmented } from "@/components/ds/Segmented";

export function RangeForm({ preset, anchor, date, days, today }: { preset: string; anchor: string; date: string; days: number; today: string }) {
  const [length, setLength] = useState(preset);
  const [which, setWhich] = useState(anchor);
  return (
    <form method="get" className="flex flex-wrap items-end gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) neon-panel p-4 print:hidden">
      <Segmented
        label="Length"
        name="preset"
        value={length}
        onChange={setLength}
        options={[
          { value: "1w", label: "1 week" },
          { value: "2w", label: "2 weeks" },
          { value: "custom", label: "Custom" },
        ]}
      />
      {length === "custom" && <Field label="Days" name="days" type="number" min={1} max={366} defaultValue={days} required className="w-24" />}
      <Segmented
        label="The date is the"
        name="anchor"
        value={which}
        onChange={setWhich}
        options={[
          { value: "start", label: "First day" },
          { value: "end", label: "Last day" },
        ]}
      />
      <Field label={which === "start" ? "First day" : "Last day"} name="date" type="date" defaultValue={date} max={today} required />
      <Button type="submit">Show timesheet</Button>
    </form>
  );
}
