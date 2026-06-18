import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Sora } from "next/font/google";  // ← add Sora here
import { Providers } from "./providers";
import { CustomCursor } from "@/components/ui/CustomCursor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

// ← add this block
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "EduFlow CRM",
  description: "A premium landing page for EdTech sales teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ← add sora.variable here
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}