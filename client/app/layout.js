import { Manrope } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { authenticatedFetch, getAccessToken } from "@/lib/server/auth";
import { adaptLandlords } from "@/lib/adapters/landlords";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Shelta CRM",
  description: "Property Management CRM",
};

export default async function RootLayout({ children }) {
  const hasSession = Boolean(await getAccessToken());
  let session = null;
  let landlords = [];

  if (hasSession) {
    const [sessionResponse, landlordsResponse] = await Promise.all([
      authenticatedFetch("auth/session"),
      authenticatedFetch("landlords?limit=100"),
    ]);
    if (sessionResponse.ok) session = await sessionResponse.json();
    if (landlordsResponse.ok) landlords = adaptLandlords((await landlordsResponse.json()).items || []);
  }

  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased font-sans`}>
      <body className="font-sans bg-transparent">
        <AppShell session={session} landlords={landlords} aiEnabled={process.env.AI_ENABLED === "true"}>{children}</AppShell>
      </body>
    </html>
  );
}
