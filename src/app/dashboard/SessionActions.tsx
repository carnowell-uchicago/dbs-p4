// Edit + Delete for one session, used on the dashboard and on the timesheet page.
import { DeleteSessionButton } from "./DeleteSessionButton";
import { EditSessionButton, type EditableSession } from "./EditSessionButton";

export function SessionActions({ session, xp }: { session: EditableSession; xp: number }) {
  return (
    <div className="flex shrink-0 gap-1">
      <EditSessionButton session={session} />
      <DeleteSessionButton sessionId={session.id} label={session.label} xp={xp} running={session.end === null} />
    </div>
  );
}
