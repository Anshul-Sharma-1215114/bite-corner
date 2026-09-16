import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// One clean bold sans for the whole app — headings just use heavier
// weights of this same family instead of a separate "fun" display font.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Bite Corner",
  description: "Italian & Chinese fast food — hot, fast, delivered.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
