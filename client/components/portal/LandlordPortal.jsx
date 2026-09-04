"use client";

import { useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  Download,
  FileText,
  Gauge,
  Home,
  LogOut,
  Menu,
  ReceiptText,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";

const navItems = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "finances", label: "Finances", icon: ReceiptText },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "documents", label: "Documents", icon: FileText },
];
const headingClass = "mb-[18px] flex items-start justify-between gap-4";
const cardClass = "rounded-md border border-default bg-surface";

export default function LandlordPortal({
  landlord,
  properties,
  tenants,
  transactions,
  rentSchedule,
  maintenance,
  documents,
}) {
  const [active, setActive] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const income = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const due = rentSchedule.reduce((sum, item) => sum + item.due, 0);
  const paid = rentSchedule.reduce((sum, item) => sum + item.paid, 0);

  return (
    <div className="flex min-h-screen bg-canvas text-primary">
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r px-3 pb-[14px] pt-5 transition-transform max-md:w-[240px] ${mobileNav ? "max-md:translate-x-0" : "max-md:-translate-x-full"}`}
      >
        <div className="flex items-center gap-[9px] px-2 pb-[22px]">
          <span className="sidebar-accent grid size-7 place-items-center rounded-[5px]">
            <Home size={17} />
          </span>
          <b className="sidebar-brand flex-1">Shelta</b>
          <button
            className="sidebar-link hidden border-0 bg-transparent max-md:block"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className={`mb-[18px] flex items-center gap-[9px] p-[9px] ${cardClass}`}>
          <span className="sidebar-accent grid size-[29px] place-items-center rounded-full font-bold">
            {landlord.initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
             <b className="sidebar-user truncate">{landlord.name}</b>
             <small className="sidebar-muted">Landlord portal</small>
          </div>
          <ChevronDown size={14} />
        </div>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <button
              className={`sidebar-link flex min-h-[34px] items-center gap-[9px] rounded-[5px] border-0 px-[10px] text-left ${active === item.id ? "sidebar-link-active font-semibold" : ""}`}
              key={item.id}
              onClick={() => {
                setActive(item.id);
                setMobileNav(false);
              }}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
         <div className={`mt-auto border border-white/15 bg-white/5 p-3`}>
           <p className="sidebar-user mb-1 mt-0 font-semibold">Need help?</p>
           <span className="sidebar-muted block leading-normal">
            Contact your property manager for support with your portfolio.
          </span>
           <button className="sidebar-link mt-2 border-0 bg-transparent p-0 font-semibold">
            Contact agency
          </button>
        </div>
       <button className="sidebar-link mt-2 flex min-h-[34px] items-center gap-[9px] rounded-[5px] border-0 bg-transparent px-[10px] text-left">
          <LogOut size={15} /> Sign out
        </button>
      </aside>
      {mobileNav && (
        <button
          className="fixed inset-0 z-30 hidden border-0 bg-primary/30 max-md:block"
          onClick={() => setMobileNav(false)}
          aria-label="Close portal navigation"
        />
      )}
      <main className="ml-[220px] min-w-0 flex-1 max-md:ml-0">
        <header className="sticky top-0 z-20 flex h-[66px] items-center gap-3 border-b border-default bg-surface px-8 max-md:px-4">
          <button
            className="hidden size-[38px] place-items-center rounded-md border border-default bg-surface text-primary max-md:grid"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="m-0 text-muted">Landlord portal</p>
            <h1 className="m-0 leading-tight">
              {navItems.find((item) => item.id === active)?.label}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="grid size-[38px] place-items-center rounded-md border border-default bg-surface text-primary"
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>
            <span className="rounded bg-subtle px-2 py-1 font-semibold text-secondary">
              Read only
            </span>
          </div>
        </header>
        <div className="p-8 max-md:p-4">
          {active === "overview" ? (
            <PortalOverview
              landlord={landlord}
              properties={properties}
              tenants={tenants}
              income={income}
              expenses={expenses}
              due={due}
              paid={paid}
              maintenance={maintenance}
              transactions={transactions}
            />
          ) : active === "properties" ? (
            <PortalProperties properties={properties} tenants={tenants} />
          ) : active === "finances" ? (
            <PortalFinances
              income={income}
              expenses={expenses}
              due={due}
              paid={paid}
              transactions={transactions}
            />
          ) : active === "maintenance" ? (
            <PortalMaintenance maintenance={maintenance} />
          ) : (
            <PortalDocuments documents={documents} />
          )}
        </div>
      </main>
    </div>
  );
}

function PortalOverview({
  landlord,
  properties,
  tenants,
  income,
  expenses,
  due,
  paid,
  maintenance,
  transactions,
}) {
  const kpis = [
    ["Properties", properties.length, `${landlord.units} total units`],
    [
      "Occupancy",
      `${Math.round((landlord.occupied / landlord.units) * 100)}%`,
      `${landlord.occupied} occupied units`,
    ],
    ["Rent received", `$${paid.toLocaleString()}`, `of $${due.toLocaleString()} expected`],
    [
      "Net income",
      `$${(income - expenses).toLocaleString()}`,
      `$${expenses.toLocaleString()} expenses`,
    ],
  ];
  const attention = [
    [
      Wrench,
      `${maintenance.filter((item) => item.status !== "Verified").length} maintenance updates`,
      "Requests currently being handled",
    ],
    [ReceiptText, `$${(due - paid).toLocaleString()} outstanding`, "Across current rent schedules"],
    [
      Users,
      `${tenants.filter((item) => item.status !== "Active").length} tenancy notices`,
      "Expiring or notice status",
    ],
  ];
  return (
    <>
      <section className="mb-5 flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <p className="m-0 text-muted">Welcome back</p>
          <h2 className="my-1">{landlord.name}</h2>
          <span className="text-secondary">
            Here is the current position of your managed portfolio.
          </span>
        </div>
        <Button variant="secondary">
          <Download size={14} /> Download statement
        </Button>
      </section>
      <section
        className={`mb-[14px] grid grid-cols-4 max-[1050px]:grid-cols-2 max-sm:grid-cols-1 ${cardClass}`}
      >
        {kpis.map(([label, value, note], index) => (
          <div
            className="flex min-w-0 flex-col gap-1 border-r border-default p-[18px] last:border-r-0 max-[1050px]:border-b max-[1050px]:even:border-r-0 max-sm:border-r-0"
            key={label}
          >
            <small className="text-secondary">{label}</small>
            <strong className="truncate">{value}</strong>
            <span className="text-muted">{note}</span>
          </div>
        ))}
      </section>
      <section className="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">
        <article className={`p-[18px] ${cardClass}`}>
          <PanelHeading title="Property performance" copy="Occupancy across your real estate" />
          <div>
            {properties.map((property) => (
              <div
                className="flex items-center justify-between gap-4 border-t border-default py-3 first:border-t-0"
                key={property.id}
              >
                <span className="flex min-w-0 flex-col">
                  <b className="truncate">{property.name}</b>
                  <small className="text-muted">
                    {property.occupied} of {property.units} occupied
                  </small>
                </span>
                <strong>{Math.round((property.occupied / property.units) * 100)}%</strong>
              </div>
            ))}
          </div>
        </article>
        <article className={`p-[18px] ${cardClass}`}>
          <PanelHeading title="Needs attention" copy="Items visible to you" />
          <div>
            {attention.map(([Icon, title, copy]) => (
              <div
                className="flex items-center gap-[10px] border-t border-default py-3 first:border-t-0"
                key={title}
              >
                <Icon className="text-secondary" size={15} />
                <span className="flex min-w-0 flex-col">
                  <b>{title}</b>
                  <small className="text-muted">{copy}</small>
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className={`col-span-2 p-[18px] max-[900px]:col-span-1 ${cardClass}`}>
          <PanelHeading
            title="Recent portfolio activity"
            copy="Financial and operational updates"
          />
          {transactions.slice(0, 4).map((item) => (
            <div
              className="grid grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-[10px] border-t border-default py-3 first:border-t-0"
              key={item.id}
            >
              <span className="size-2 rounded-full bg-secondary" />
              <span className="flex min-w-0 flex-col">
                <b>{item.category}</b>
                <small className="truncate text-muted">
                  {item.property} · {item.date}
                </small>
              </span>
              <strong>
                {item.type === "Income" ? "+" : "-"}${item.amount.toLocaleString()}
              </strong>
            </div>
          ))}
        </article>
      </section>
    </>
  );
}

function PanelHeading({ title, copy }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        <h3 className="mb-1 mt-0">{title}</h3>
        <p className="m-0 text-muted">{copy}</p>
      </div>
    </div>
  );
}

function PortalProperties({ properties, tenants }) {
  return (
    <section>
      <div className={headingClass}>
        <div>
          <h2 className="m-0">Your properties</h2>
          <p className="mb-0 mt-1 text-secondary">
            Occupancy and tenant visibility across your real estate.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[14px] max-[1050px]:grid-cols-2 max-sm:grid-cols-1">
        {properties.map((property) => (
          <article className={`p-4 ${cardClass}`} key={property.id}>
            <div className="mb-4 grid size-12 place-items-center rounded-md bg-subtle text-secondary">
              <Building2 size={24} />
            </div>
            <small className="text-muted">
              {property.id} · {property.type}
            </small>
            <h3 className="mb-1 mt-1">{property.name}</h3>
            <p className="mt-0 truncate text-secondary">{property.address}</p>
            <div className="grid grid-cols-3 border-t border-default pt-3">
              {[
                ["Units", property.units],
                ["Occupied", property.occupied],
                ["Tenants", tenants.filter((tenant) => tenant.property === property.name).length],
              ].map(([label, value]) => (
                <span className="flex flex-col text-muted" key={label}>
                  {label}
                  <b className="text-primary">{value}</b>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortalFinances({ income, expenses, due, paid, transactions }) {
  return (
    <section>
      <div className={headingClass}>
        <div>
          <h2 className="m-0">Financial statement</h2>
          <p className="mb-0 mt-1 text-secondary">
            Read-only income, expenses and rent collection records.
          </p>
        </div>
        <Button variant="secondary">
          <Download size={14} /> Export statement
        </Button>
      </div>
      <KpiGrid
        items={[
          ["Income", income],
          ["Expenses", expenses],
          ["Net income", income - expenses],
          ["Outstanding", due - paid],
        ]}
      />
      <div className={`overflow-x-auto ${cardClass}`}>
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="bg-sidebar text-muted">
              {["Date", "Description", "Property", "Reference", "Amount"].map((heading) => (
                <th className="h-[37px] px-3 font-semibold uppercase" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr className="border-t border-default text-secondary" key={item.id}>
                <td className="h-[62px] px-3">{item.date}</td>
                <td className="px-3">
                  <b className="block text-primary">{item.category}</b>
                  <small className="block text-muted">{item.notes}</small>
                </td>
                <td className="px-3">{item.property}</td>
                <td className="px-3">{item.reference}</td>
                <td className="px-3 text-primary">
                  <b>
                    {item.type === "Income" ? "+" : "-"}${item.amount.toLocaleString()}
                  </b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function KpiGrid({ items }) {
  return (
    <div
      className={`mb-[14px] grid grid-cols-4 max-[900px]:grid-cols-2 max-sm:grid-cols-1 ${cardClass}`}
    >
      {items.map(([label, value]) => (
        <div
          className="flex min-w-0 flex-col gap-1 border-r border-default p-[18px] last:border-r-0 max-[900px]:border-b max-[900px]:even:border-r-0 max-sm:border-r-0"
          key={label}
        >
          <small className="text-secondary">{label}</small>
          <strong className="truncate">${value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function PortalMaintenance({ maintenance }) {
  return (
    <section>
      <div className={headingClass}>
        <div>
          <h2 className="m-0">Maintenance updates</h2>
          <p className="mb-0 mt-1 text-secondary">
            Track work being handled across your properties.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {maintenance.map((item) => (
          <article
            className={`grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 p-3 max-sm:grid-cols-[36px_1fr] ${cardClass}`}
            key={item.id}
          >
            <span className="grid size-9 place-items-center rounded-md bg-subtle text-secondary">
              <Wrench size={16} />
            </span>
            <div className="min-w-0">
              <small className="text-muted">
                {item.id} · {item.category}
              </small>
              <h3 className="my-0.5 truncate">{item.title}</h3>
              <p className="m-0 truncate text-secondary">
                {item.property} · Unit {item.unit}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 max-sm:col-span-2 max-sm:items-start">
              <span className="rounded bg-subtle px-2 py-1 font-semibold text-secondary">
                {item.status}
              </span>
              <small className="text-muted">Updated {item.updated}</small>
              <b>${item.estimatedCost.toLocaleString()} estimated</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PortalDocuments({ documents }) {
  return (
    <section>
      <div className={headingClass}>
        <div>
          <h2 className="m-0">Documents</h2>
          <p className="mb-0 mt-1 text-secondary">Files shared with you by the agency.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">
        {documents.map((document) => (
          <article
            className={`grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 p-4 max-sm:grid-cols-[42px_1fr] ${cardClass}`}
            key={document.id}
          >
            <span className="grid size-[42px] place-items-center rounded-md bg-subtle text-secondary">
              <FileText size={21} />
            </span>
            <div className="min-w-0">
              <small className="text-muted">
                {document.category} · v{document.version}
              </small>
              <h3 className="my-0.5 truncate">{document.name}</h3>
              <p className="m-0 truncate text-secondary">
                {document.property} · Updated {document.updated}
              </p>
            </div>
            <Button variant="secondary">
              <Download size={14} /> Download
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
