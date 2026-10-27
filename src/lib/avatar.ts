// Checking an avatar sent from the browser before saving it: every part must be one of
// the options the editor offers. Never trust what the client sends.
import { avatarOptions, type Avatar } from "../components/ds/TrainerAvatar";

/** True if `value` is one of `options` (works for any list of strings). */
function oneOf(options: readonly string[], value: unknown): value is string {
  return typeof value === "string" && options.includes(value);
}

export function parseAvatar(input: Record<string, unknown>): Avatar | null {
  const { skin, hair, hairColor, hat, hatColor, outfit } = input;
  const ok =
    oneOf(avatarOptions.skin, skin) &&
    oneOf(avatarOptions.hair, hair) &&
    oneOf(avatarOptions.hairColor, hairColor) &&
    oneOf(avatarOptions.hat, hat) &&
    oneOf(avatarOptions.color, hatColor) &&
    oneOf(avatarOptions.color, outfit);
  return ok ? ({ skin, hair, hairColor, hat, hatColor, outfit } as Avatar) : null;
}
