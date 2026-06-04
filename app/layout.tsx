import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import seed from "@/data/seed.json";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${seed.personal.shortName} — ${seed.personal.title}`,
  description: seed.summary,
  openGraph: {
    title: `${seed.personal.shortName} — ${seed.personal.title}`,
    description: seed.summary,
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
