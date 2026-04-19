'use client';

import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../styles/theme.css";
import { usePathname } from "next/navigation";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import LayoutWrapper from "../components/common/LayoutWrapper";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { metadata } from "./metadata";
// import CustomCursor from '../components/common/CustomCursor'; // Commented out - using default cursor

// Primary font for data-heavy sections - clean, modern, highly readable
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Secondary font for wedding/emotional content - elegant, romantic, expressive
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Neutral fallback font for UI elements - simple, consistent
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* <CustomCursor /> */} {/* Commented out - using default cursor */}
        <ThemeProvider>
          <LayoutWrapper>
            {isHomePage && <Navbar />}
            {children}
            {isHomePage && <Footer />}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
