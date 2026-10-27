import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OptionProductSplit, OptionProfessorIntro, OptionTitleScreen } from "./options";

export const metadata: Metadata = { title: "Front page options · Dusk" };

const mono = { fontFamily: "var(--dp-mono)" };

function Option({ letter, name, notes, children }: { letter: string; name: string; notes: string[]; children: ReactNode }) {
  return (
    <section aria-labelledby={`opt-${letter}`} className="border-t-4 border-(--dk-gold)">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <h2 id={`opt-${letter}`} className="text-sm font-bold uppercase tracking-[0.1em] text-(--dk-gold)" style={mono}>
          Option {letter} · {name}
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--dk-muted)">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
      {children}
    </section>
  );
}

export default function LandingOptions() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--dp-display)" }}>
          Front page: three directions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--dk-muted)">
          Same Dusk theme and components. Each one leads with a clear promise, one main action, a live look at the product, how it
          works, and a privacy note. Press any Poké Ball to try the animation.
        </p>
      </div>
      <Option
        letter="A"
        name="Title screen"
        notes={[
          "Feels like booting the game: centred logo, the animation is the hero, a 'Press start' button.",
          "Strongest personality and the simplest page. Says less about timesheets until the feature cards.",
        ]}
      >
        <OptionTitleScreen />
      </Option>
      <Option
        letter="B"
        name="Product split"
        notes={[
          "Classic product hero: the promise on the left, the real dashboard on the right, then a day with the coach.",
          "Clearest about what the app does (best for a classmate seeing it for the first time). Least game-like layout.",
        ]}
      >
        <OptionProductSplit />
      </Option>
      <Option
        letter="C"
        name="Professor intro"
        notes={[
          "The games' opening speech: the professor welcomes you and asks what you'll train for, then three steps.",
          "Most charming and story-like. More reading before the action, and the two choices both just lead to sign up.",
        ]}
      >
        <OptionProfessorIntro />
      </Option>
    </main>
  );
}
