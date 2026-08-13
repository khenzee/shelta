import { Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Shelta CRM",
  description: "Property Management CRM",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased font-sans`}>
      <body className="font-sans bg-transparent">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
