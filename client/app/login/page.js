import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/server/auth";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  if (await getAccessToken()) redirect("/");
  return <Suspense><LoginForm /></Suspense>;
}
