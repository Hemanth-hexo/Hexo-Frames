import type { Metadata } from "next";
import { Space_Mono, Inter, Anton } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Display face — a heavy, condensed poster/flyer weight, the kind an actual
// gig or festival flyer gets set in. Space Mono stays underneath it for
// anything that reads as camera data (settings, coordinates, labels): a
// loud headline next to quiet technical facts.
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HexoFrames — Hemanth Sarode, Photographer & Videographer",
  description:
    "Photography and videography by Hemanth Sarode — wildlife, automotive heritage, live music, and street work shot across India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
