'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import LayoutWrapper from "../components/common/LayoutWrapper";
import { metadata } from "./metadata";
// import CustomCursor from '../components/common/CustomCursor'; // Commented out - using default cursor

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* <CustomCursor /> */} {/* Commented out - using default cursor */}
        <LayoutWrapper>
          {isHomePage && <Navbar />}
          {children}
          {isHomePage && <Footer />}
        </LayoutWrapper>
      </body>
    </html>
  );
}
