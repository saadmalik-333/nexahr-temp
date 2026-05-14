import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "NexaHR — Streamline Your Workforce Management",
  description:
    "From hiring to ID cards — NexaHR handles it all. A modern HR management system for employee onboarding, attendance tracking, and digital ID card generation.",
  keywords: ["HR management", "employee onboarding", "attendance tracking", "NexaHR"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f1729',
              color: '#f0f4ff',
              border: '1px solid #1e2d4a',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0f1729',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f1729',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
