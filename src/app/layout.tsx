import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadGen — Find the right mover",
  description:
    "Tell us about your move. We'll match you with trusted moving companies who compete for your job.",
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
