import type { Metadata, Viewport } from "next";
import "./style.css";

export const metadata: Metadata = {
  title: { default: "Synestharium", template: "%s — Synestharium" },
  description: "Short audiovisual studies in light, colour and sound, and a members' collective for the people who explore them.",
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>
    <a className="skip" href="#main">Skip to content</a>
    {children}
  </body></html>;
}
