import { describe, expect, it } from "vitest";
import { avatarOptions, defaultAvatar } from "../components/ds/TrainerAvatar";
import { parseAvatar } from "./avatar";

describe("parseAvatar", () => {
  it("accepts any combination of the editor's options", () => {
    expect(parseAvatar({ ...defaultAvatar })).toEqual(defaultAvatar);
    const other = { skin: avatarOptions.skin[5], hair: "bun", hairColor: avatarOptions.hairColor[6], hat: "none", hatColor: avatarOptions.color[6], outfit: avatarOptions.color[0] };
    expect(parseAvatar(other)).toEqual(other);
  });
  it("rejects anything the editor doesn't offer, and drops extra fields", () => {
    expect(parseAvatar({ ...defaultAvatar, skin: "#000000" })).toBeNull();
    expect(parseAvatar({ ...defaultAvatar, hair: "mohawk" })).toBeNull();
    expect(parseAvatar({ ...defaultAvatar, outfit: "url(javascript:alert(1))" })).toBeNull();
    expect(parseAvatar({ ...defaultAvatar, extra: "x" })).toEqual(defaultAvatar);
  });
});
