"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  FileText,
  Gauge,
  Grid3X3,
  House,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: Gauge, href: "/" },
      { id: "properties", label: "Properties", icon: Building2, href: "/properties" },
      { id: "units", label: "Units", icon: Grid3X3, href: "/units" },
      { id: "tenants", label: "Tenants", icon: Users, href: "/tenants" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "landlords", label: "Landlords", icon: House, href: "/landlords" },
      { id: "finances", label: "Finances", icon: CircleDollarSign, href: "/finances" },
      { id: "maintenance", label: "Maintenance", icon: Wrench, href: "/maintenance" },
      { id: "leases", label: "Leases & documents", icon: FileText, href: "/leases" },
      { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "employees", label: "Team & roles", icon: ShieldCheck, href: "/employees" },
      { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
];

export default function Sidebar({ open, onClose, collapsed, onToggle, session }) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = session?.name?.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "NA";
  const role = session?.role || "AGENT";
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (["finances", "reports"].includes(item.id)) return role === "ADMIN";
        if (item.id === "employees") return ["ADMIN", "MANAGER"].includes(role);
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <button
        className={`fixed inset-0 z-30 border-0 bg-primary/20 transition-opacity duration-300 md:hidden ${open ? "block opacity-100" : "hidden opacity-0"}`}
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-default bg-sidebar px-3 py-4 transition-all duration-300 ease-in-out ${collapsed ? "md:w-15 md:px-2" : "md:w-60 w-60"} ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`mb-5 flex min-h-8 items-center ${collapsed ? "md:flex-col md:justify-center md:gap-2 md:px-0" : "px-2"}`}
        >
          <div className="grid size-7 shrink-0 place-items-center rounded bg-primary text-inverse">
            <Building2 size={16} />
          </div>
          <span className={`ml-2.5 font-semibold text-primary ${collapsed ? "md:hidden" : ""}`}>
            Shelta
          </span>
          <button
            className={`ml-auto hidden size-6 place-items-center rounded border-0 bg-transparent text-muted hover:bg-hover md:grid ${collapsed ? "md:ml-0" : ""}`}
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
          <button
            className="ml-auto grid place-items-center border-0 bg-transparent text-secondary md:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pt-4 pb-2 scrollbar-none">
          {visibleGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              <p
                className={`mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted ${collapsed ? "md:hidden" : ""}`}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={`flex min-h-8 w-full items-center gap-2.5 rounded-md px-2 text-secondary no-underline transition-colors hover:bg-hover hover:text-primary ${collapsed ? "md:justify-center md:px-0" : ""} ${pathname === item.href ? "bg-hover font-medium text-primary" : ""}`}
                  >
                    <item.icon size={16} />
                    <span className={`flex-1 ${collapsed ? "md:hidden" : ""}`}>{item.label}</span>
                    {item.count ? (
                      <small
                        className={`min-w-5 rounded bg-default px-1 py-0.5 text-center text-[9px] font-medium text-secondary ${collapsed ? "md:hidden" : ""}`}
                      >
                        {item.count}
                      </small>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-default pt-3">
          <button
            className={`flex min-h-8 w-full items-center gap-2.5 rounded-md border-0 bg-transparent px-2 text-secondary transition-colors hover:bg-hover hover:text-primary ${collapsed ? "md:justify-center md:px-0" : ""}`}
          >
            <LifeBuoy size={16} />
            <span className={collapsed ? "md:hidden" : ""}>Help & support</span>
          </button>
          <div
            className={`mt-1 flex items-center gap-2.5 rounded-md px-2 pb-1 pt-2 ${collapsed ? "md:justify-center md:px-0" : ""}`}
          >
            <div className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-inverse">
              {initials}
            </div>
            <span className={`min-w-0 flex-1 flex-col ${collapsed ? "md:hidden" : "flex"}`}>
               <b className="truncate font-semibold text-primary">{session?.name || "Agency user"}</b>
                <small className="text-muted">{session?.type === "LANDLORD" ? "Landlord" : role}</small>
            </span>
            <button
              className={`grid size-7 place-items-center rounded border-0 bg-transparent text-muted transition-colors hover:bg-hover hover:text-primary ${collapsed ? "md:hidden" : ""}`}
               aria-label="Log out"
               onClick={logout}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
