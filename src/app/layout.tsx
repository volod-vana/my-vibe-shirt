import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tee Designer — Vana Connect",
  description:
    "Generate a custom t-shirt design from your Instagram aesthetic and Spotify taste",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
