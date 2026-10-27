import { Exo_2, JetBrains_Mono, Oxanium, Silkscreen } from "next/font/google";

// Neon Arcade's three faces, carried into the spinoff: Oxanium for display and
// buttons, Exo 2 for reading, JetBrains Mono for times and numbers.
// Silkscreen is the game voice (chosen by the student on /design/fonts): only for what
// the coach or the game says. Its lower case is small capitals, so keep lines short.
const display = Oxanium({ subsets: ["latin"], variable: "--dp-display" });
const body = Exo_2({ subsets: ["latin"], variable: "--dp-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--dp-mono" });
const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--dp-pixel" });

export const fontVars = `${display.variable} ${body.variable} ${mono.variable} ${pixel.variable}`;
