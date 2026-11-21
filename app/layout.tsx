import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./style.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://synestharium.com"),
  title: { default: "Synestharium", template: "%s — Synestharium" },
  description: "An audiovisual exploration of consciousness and the nature of reality, where neuroscience meets philosophy, ancient wisdom and generative art.",
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={sans.variable + " " + mono.variable}><body>
    <a className="skip" href="#main">Skip to content</a>
    {children}
  </body></html>;
}
