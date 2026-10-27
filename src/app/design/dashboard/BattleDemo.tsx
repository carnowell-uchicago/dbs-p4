"use client";

// The battle scene with sample data and a working (demo) Poké Ball. Nothing is saved.
import { useState } from "react";
import { BattleScene, CoachFromBehind, NamePlate, PlateBar, shiftHp } from "@/components/ds/BattleScene";
import { ClockStage } from "@/components/ds/ClockStage";
import { TextBox } from "@/components/ds/TextBox";
import type { Avatar } from "@/components/ds/TrainerAvatar";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { formatDuration } from "@/lib/format";

const BACK = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/back/25.png";

export function BattleDemo({ avatar }: { avatar: Avatar }) {
  const [out, setOut] = useState(false);
  const todayMs = (3 * 60 + 13) * 60 * 1000;
  const hp = shiftHp(todayMs);
  return (
    <BattleScene
      opponentPlate={
        <NamePlate name="The Clock" tag="Today" side="opponent">
          <PlateBar label="HP" fill={hp.fill} colour={hp.colour} caption={`${formatDuration(todayMs)} of an 8 h day`} />
        </NamePlate>
      }
      opponent={<WatchTimer running={out} elapsed={out ? "00:42:10" : "00:00:00"} caption={out ? "since 1:15 PM" : "Not clocked in"} />}
      coach={<CoachFromBehind name="Pikachu" types={["electric"]} sprite={BACK} />}
      stage={<ClockStage out={out} avatar={avatar} name="Alex" onClick={() => setOut((v) => !v)} />}
      playerPlate={
        <NamePlate name="Alex" tag="Lv 4" side="player">
          <PlateBar label="XP" fill={210 / 400} colour="var(--dk-hp)" caption="210 / 400 XP" />
        </NamePlate>
      }
      line={
        <TextBox speaker="Pikachu" live="polite">
          {out ? "ALEX, I choose you! PIKACHU used Charge. Let's spark some focus!" : "Welcome back, ALEX! Ready for another round whenever you are."}
        </TextBox>
      }
    />
  );
}
