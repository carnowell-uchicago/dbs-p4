"use client";

// Download the timesheet as CSV (made in the browser from text the server already built,
// so there's no extra endpoint to secure), or print it (print styles hide the app chrome).
import { Button } from "@/components/ds/Button";

export function ExportButtons({ csv, filename }: { csv: string; filename: string }) {
  function download() {
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button onClick={download}>Download CSV</Button>
      <Button variant="ghost" onClick={() => window.print()}>
        Print
      </Button>
    </div>
  );
}
