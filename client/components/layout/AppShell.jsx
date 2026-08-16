"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import Button from "@/components/ui/Button";
import WorkspaceTabs from "./WorkspaceTabs";
import { WorkspaceProvider } from "./WorkspaceProvider";
import { usePathname } from "next/navigation";
import { SessionProvider } from "@/components/auth/SessionProvider";
import AssistantPanel from "@/components/assistant/AssistantPanel";

export default function AppShell({ children, session, landlords, aiEnabled }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/accept-invite") || pathname.startsWith("/verify-email")) return <>{children}</>;
  if (pathname.startsWith("/portal")) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
  }

  return (
    <SessionProvider session={session}>
      <WorkspaceProvider landlords={landlords}>
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
          session={session}
        />
        <div
          className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${collapsed ? "md:ml-[60px]" : "md:ml-[240px]"}`}
        >
          <div className="sticky top-0 z-20 flex h-[52px] items-center justify-between border-b border-default bg-surface px-4 md:hidden">
            <span className="font-bold text-primary">shelta</span>
            <Button
              variant="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </Button>
          </div>
          <WorkspaceTabs />
          {children}
        </div>
        {aiEnabled ? <AssistantPanel route={pathname} /> : null}
      </div>
      </WorkspaceProvider>
    </SessionProvider>
  );
}
