import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { TeamThemeProvider } from "@/lib/team-theme-context";
import { SidebarProvider } from "@/lib/sidebar-context";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FPL Companion | AI-Powered Fantasy Premier League Insights",
  description: "Your intelligent companion for Fantasy Premier League. Get AI-powered transfer suggestions, captaincy picks, and team analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          <TeamThemeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </TeamThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
