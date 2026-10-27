"use client";

// "All 151 / Coached me": applies as soon as you pick one (no need to press Search).
// It submits the surrounding GET form after React has updated the hidden input.
import { useEffect, useRef, useState } from "react";
import { Segmented } from "@/components/ds/Segmented";

export function ShowFilter({ show }: { show: string }) {
  const [value, setValue] = useState(show);
  const wrapper = useRef<HTMLDivElement>(null);
  const changed = useRef(false);

  useEffect(() => {
    if (changed.current) wrapper.current?.closest("form")?.requestSubmit();
  }, [value]);

  return (
    <div ref={wrapper}>
      <Segmented
        label="Show"
        name="show"
        value={value}
        onChange={(v) => {
          changed.current = true;
          setValue(v);
        }}
        options={[
          { value: "all", label: "All 151" },
          { value: "met", label: "Coached me" },
        ]}
      />
    </div>
  );
}
