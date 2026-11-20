import type { Metadata, Viewport } from "next";
import { Sorts_Mill_Goudy, Red_Hat_Text } from "next/font/google";
import { asset } from "./asset";
import "./globals.css";

const f_goudy = Sorts_Mill_Goudy({ variable: "--f-goudy", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const f_rht = Red_Hat_Text({ variable: "--f-rht", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Shizuka Luxury | Sell your luxury pieces privately in Dubai",
  description:
    "Get cash for your handbags, watches and jewellery within 72 hours. Shizuka collects, authenticates and gathers private offers on your behalf.",
  openGraph: {
    title: "Shizuka Luxury",
    description: "A private way to sell your handbags, watches and jewellery in Dubai. Cash within 72 hours.",
    images: [{ url: asset("/images/hero.jpg"), width: 2560, height: 1600, alt: "Seen from above: a black quilted handbag on a cream boucl\u00e9 sofa, beside a hand wearing a ring and a gold watch" }],
    locale: "en_GB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#2B221C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${f_goudy.variable} ${f_rht.variable}`}>
      <body>{children}</body>
    </html>
  );
}
