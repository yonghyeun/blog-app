import { IBM_Plex_Mono, IBM_Plex_Sans_KR, Noto_Sans_KR } from "next/font/google";

const bodyFont = Noto_Sans_KR({
  display: "swap",
  preload: false,
  variable: "--font-noto-sans-kr",
  weight: ["400"],
});

const headingFont = IBM_Plex_Sans_KR({
  display: "swap",
  preload: false,
  variable: "--font-ibm-plex-sans-kr",
  weight: ["400", "600"],
});

const codeFont = IBM_Plex_Mono({
  display: "swap",
  preload: false,
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400"],
});

export const fontClassName = [bodyFont.variable, headingFont.variable, codeFont.variable].join(" ");
