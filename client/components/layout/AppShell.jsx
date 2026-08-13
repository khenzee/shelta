"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import Button from "@/components/ui/Button";
import WorkspaceTabs from "./WorkspaceTabs";
import { WorkspaceProvider } from "./WorkspaceProvider";
import { landlords } from "@/lib/mock-data";
import { usePathname } from "next/navigation";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/portal")) return <>{children}</>;

  return (
    <WorkspaceProvider landlords={landlords}>
      <div className="flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
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
      </div>
    </WorkspaceProvider>
  );
}
