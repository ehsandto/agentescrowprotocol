import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Outfit } from "next/font/google";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AgentEscrow Protocol",
  description:
    "AgentEscrow enables AI agents to negotiate, execute, verify, and settle agreements through GenLayer consensus.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} bg-app font-sans antialiased`}>
        <Providers>
          <div className="relative min-h-screen">
            <div className="bg-grid pointer-events-none absolute inset-0" />
            <div className="relative">
              <Nav />
              <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-10">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
