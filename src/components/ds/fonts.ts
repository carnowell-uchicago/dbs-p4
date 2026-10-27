import { Exo_2, JetBrains_Mono, Oxanium, Pixelify_Sans } from "next/font/google";

// Neon Arcade's three faces, carried into the spinoff: Oxanium for display and
// buttons, Exo 2 for reading, JetBrains Mono for times and numbers.
// Pixelify Sans is a candidate only: a nod to the DS text box.
const display = Oxanium({ subsets: ["latin"], variable: "--dp-display" });
const body = Exo_2({ subsets: ["latin"], variable: "--dp-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--dp-mono" });
const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--dp-pixel" });

export const fontVars = `${display.variable} ${body.variable} ${mono.variable} ${pixel.variable}`;
