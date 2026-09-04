"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Building2,
  CircleAlert,
  DoorOpen,
  Download,
  Search,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import QuickAdd from "@/components/overview/QuickAdd";

const IconMap = {
  Building2,
  Users,
  TrendingUp,
  CircleAlert,
  ArrowDownRight,
  Wrench,
  ArrowUpRight,
};
const toneClasses = {
  green: "bg-subtle text-secondary",
  blue: "bg-subtle text-info",
  orange: "bg-warning-subtle text-warning",
  red: "bg-danger-subtle text-danger",
};

const panelClass =
  "min-w-0 rounded-[7px] border border-default bg-surface p-[18px] shadow-[0_1px_2px_color-mix(in_srgb,var(--color-primary)_4%,transparent)] max-md:p-[15px]";
const headingClass = "flex items-start justify-between gap-[15px]";
const buttonClass =
  "flex h-[38px] items-center justify-center gap-[7px] rounded-md border px-[13px] font-semibold";

const PERIODS = [
  { id: "year", label: "Year" },
  { id: "quarter", label: "Quarter" },
  { id: "month", label: "Month" },
];

function computeFinance(transactions, period) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  const start =
    period === "year"
      ? new Date(Date.UTC(year, 0, 1))
      : period === "quarter"
        ? new Date(Date.UTC(year, quarterStartMonth, 1))
        : new Date(Date.UTC(year, month, 1));
  const monthsInWindow = period === "year" ? 12 : period === "quarter" ? 3 : 1;
  const monthly = Array.from({ length: monthsInWindow }, () => ({ income: 0, expenses: 0 }));
  const labels = [];
  for (let i = 0; i < monthsInWindow; i++) {
    const labelMonth = period === "year" ? i : period === "quarter" ? quarterStartMonth + i : month;
    labels.push(
      new Date(Date.UTC(year, labelMonth, 1)).toLocaleDateString("en", { month: "short" }),
    );
  }
  let income = 0;
  let expenses = 0;
  for (const item of transactions) {
    if (String(item.status).toUpperCase() !== "COMPLETED") continue;
    const date = new Date(item.transactionDate || item.createdAt);
    if (Number.isNaN(date.getTime()) || date < start) continue;
    const amount = Number(item.amount || 0);
    if (Number.isNaN(amount)) continue;
    const bucket =
      period === "year"
        ? date.getUTCMonth()
        : period === "quarter"
          ? date.getUTCMonth() - quarterStartMonth
          : 0;
    if (bucket < 0 || bucket >= monthsInWindow) continue;
    if (String(item.type).toUpperCase() === "INCOME") {
      income += amount;
      monthly[bucket].income += amount;
    } else {
      expenses += amount;
      monthly[bucket].expenses += amount;
    }
  }
  return { income, expenses, monthly, labels };
}

export default function OverviewClient({
  metrics,
  finance,
  unitStatus,
  activity,
  tasks,
  landlords = [],
  properties = [],
  units = [],
  tenants = [],
  leases = [],
  maintenanceRequests = [],
  transactions = [],
}) {
  const [activitySearch, setActivitySearch] = useState("");
  const [financePeriod, setFinancePeriod] = useState("year");
  const { activeLandlord } = useWorkspace();

  const scopedProperties = activeLandlord
    ? properties.filter(
        (property) =>
          property.landlordId === activeLandlord.id || property.landlord === activeLandlord.name,
      )
    : properties;
  const scopedUnits = activeLandlord
    ? units.filter(
        (unit) => unit.landlordId === activeLandlord.id || unit.landlord === activeLandlord.name,
      )
    : units;
  const scopedTenants = activeLandlord
    ? tenants.filter(
        (tenant) =>
          tenant.landlordId === activeLandlord.id || tenant.landlord === activeLandlord.name,
      )
    : tenants;
  const scopedLeases = activeLandlord
    ? leases.filter(
        (lease) => lease.landlordId === activeLandlord.id || lease.landlord === activeLandlord.name,
      )
    : leases;
  const scopedMaintenance = activeLandlord
    ? maintenanceRequests.filter(
        (request) =>
          request.landlordId === activeLandlord.id ||
          request.property?.landlordId === activeLandlord.id,
      )
    : maintenanceRequests;
  const scopedTransactions = activeLandlord
    ? transactions.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : transactions;

  const displayMetrics = activeLandlord
    ? metrics.map((metric) => {
        if (metric.label === "Landlords")
          return {
            ...metric,
            label: "Expected monthly rent",
            value: scopedProperties.reduce((sum, property) => sum + Number(property.rent || 0), 0),
            money: true,
            href: "/finances",
            note: "Across this portfolio",
          };
        if (metric.label === "Properties")
          return { ...metric, value: scopedProperties.length, note: "In this portfolio" };
        if (metric.label === "Tenants")
          return { ...metric, value: scopedTenants.length || metric.value, note: "In this portfolio" };
        if (metric.label === "Active leases")
          return {
            ...metric,
            value: scopedLeases.filter((item) => String(item.status).toUpperCase() === "ACTIVE")
              .length,
            note: "In this portfolio",
          };
        if (metric.label === "Pending maintenance")
          return {
            ...metric,
            value: scopedMaintenance.filter(
              (item) => String(item.status).toUpperCase() !== "VERIFIED",
            ).length,
            note: "In this portfolio",
          };
        return metric;
      })
    : metrics;

  const displayUnitStatus = activeLandlord
    ? {
        occupied: scopedUnits.filter((unit) => String(unit.status).toUpperCase() === "OCCUPIED")
          .length,
        vacant: scopedUnits.filter((unit) => String(unit.status).toUpperCase() === "VACANT").length,
        underRepair: scopedUnits.filter(
          (unit) =>
            String(unit.status).toUpperCase() === "UNDER_REPAIR" ||
            String(unit.status) === "Under repair",
        ).length,
        total: scopedUnits.length,
      }
    : unitStatus;

  const displayFinance = finance ? computeFinance(scopedTransactions, financePeriod) : null;

  const occupiedUnits = scopedUnits.filter(
    (unit) => String(unit.status).toUpperCase() === "OCCUPIED",
  );
  const vacantUnits = scopedUnits.filter((unit) => String(unit.status).toUpperCase() === "VACANT");
  const expectedMonthlyRent = occupiedUnits.reduce((sum, unit) => sum + Number(unit.rent || 0), 0);
  const vacancyAtRisk = vacantUnits.reduce((sum, unit) => sum + Number(unit.rent || 0), 0);
  const monthsElapsedThisYear = new Date().getUTCMonth() + 1;
  const expectedSoFar = expectedMonthlyRent * monthsElapsedThisYear;
  const rentReceived = displayFinance?.income ?? 0;
  const rentOutstanding = Math.max(0, expectedSoFar - rentReceived);
  const collectionRate = expectedSoFar ? Math.round((rentReceived / expectedSoFar) * 100) : 0;

  async function exportCsv() {
    const formatMoney = (value) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(value);
    const scopeLabel = activeLandlord
      ? `${activeLandlord.name} — scoped`
      : "Shelta agency overview";
    const rows = [
      [scopeLabel, ""],
      ["Generated", new Date().toLocaleString()],
      ["", ""],
      ["Metric", "Value"],
      ...displayMetrics.map((metric) => [metric.label, metric.value]),
      ["", ""],
      ["Income recorded", formatMoney(displayFinance?.income ?? 0)],
      ["Expenses recorded", formatMoney(displayFinance?.expenses ?? 0)],
      ["Net", formatMoney((displayFinance?.income ?? 0) - (displayFinance?.expenses ?? 0))],
      ["", ""],
      ["Occupied units", displayUnitStatus.occupied],
      ["Vacant units", displayUnitStatus.vacant],
      ["Under repair", displayUnitStatus.underRepair],
      ["Total units", displayUnitStatus.total],
    ];
    if (displayFinance?.monthly?.length) {
      rows.push(["", ""], ["Month", "Income", "Expenses"]);
      displayFinance.monthly.forEach((month, index) => {
        rows.push([displayFinance.labels[index], month.income, month.expenses]);
      });
    }
    rows.push(
      [],
      ["Activity"],
      ...activity.map((item) => [item.title, item.meta, item.time, item.value]),
    );
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shelta-overview-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function markNotificationRead(notification) {
    if (notification.readAt) return;
    await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" }).catch(() => {});
    router.refresh();
  }
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const filteredActivity = activity.filter(
    (item) =>
      item.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.meta.toLowerCase().includes(activitySearch.toLowerCase()),
  );
  const money = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
  const maxMonthlyValue = displayFinance
    ? Math.max(1, ...displayFinance.monthly.flatMap((month) => [month.income, month.expenses]))
    : 1;
  const occupancyRate = displayUnitStatus.total
    ? Math.round((displayUnitStatus.occupied / displayUnitStatus.total) * 100)
    : 0;

  return (
    <>
      <header className="sticky top-0 z-20 hidden h-[66px] items-center justify-between gap-6 border-b border-default bg-surface px-8 md:flex">
        <div>
          <p className="eyebrow">{today}</p>
          <h1 className="m-0 leading-tight">
            {activeLandlord ? activeLandlord.name : "Agency overview"}
          </h1>
        </div>
        <div className="flex items-center gap-[9px]">
          <QuickAdd landlords={landlords} properties={properties} units={units} />
        </div>
      </header>

      <main className="px-8 pb-10 pt-7 max-md:px-4 max-md:pb-8 max-md:pt-5">
        <div className="mb-[23px] flex items-end justify-between gap-5 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="mb-1 mt-0 font-medium">
              {activeLandlord ? `${activeLandlord.name}'s portfolio` : "What needs attention"}
            </h2>
            <p className="m-0 text-secondary">
              {activeLandlord
                ? "Review this landlord's properties, tenants, finances and pending work."
                : "Tasks, schedules and pending work across every landlord portfolio."}
            </p>
          </div>
          <div className="flex gap-2 max-md:w-full">
            <button
              className={`${buttonClass} border-default bg-surface text-primary max-md:flex-1`}
              onClick={exportCsv}
              type="button"
            >
              <Download size={14} /> Export report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[13px] max-[1050px]:grid-cols-2 max-[440px]:grid-cols-1">
          {displayMetrics.map((metric) => {
            const IconComponent = IconMap[metric.icon] || Building2;
            return (
              <Link
                href={metric.href || "/"}
                className="flex min-w-0 flex-col rounded-[7px] border border-default bg-surface p-[15px] shadow-sm no-underline transition-colors hover:border-secondary max-md:p-3"
                key={metric.label}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`grid size-9 place-items-center rounded-md max-md:size-[30px] ${toneClasses[metric.tone] || toneClasses.green}`}
                  >
                    <IconComponent size={20} />
                  </span>
                  <span className="text-right text-secondary">{metric.label}</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-2 border-t border-default pt-3 max-md:mt-3 max-md:pt-2.5">
                  <strong className="text-2xl font-semibold leading-none text-primary max-md:text-xl">
                    {metric.money ? money.format(metric.value) : metric.value}
                  </strong>
                  <span className="text-right text-muted">{metric.note}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-[13px] grid grid-cols-[minmax(0,1.6fr)_minmax(290px,.8fr)] gap-[13px] max-[1050px]:grid-cols-1">
          <div className={panelClass}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Revenue &amp; Expenses</h3>
                <p className="m-0 text-muted">Year-to-date cash flow performance</p>
              </div>
              <div className="flex gap-[13px] text-secondary max-md:hidden">
                <span className="flex items-center gap-[5px]">
                  <i className="size-2 rounded-sm bg-default" /> Expected
                </span>
                <span className="flex items-center gap-[5px]">
                  <i className="size-2 rounded-sm bg-secondary" /> Received
                </span>
              </div>
              <div className="flex items-center gap-[7px]">
                <div className="flex items-center rounded-md border border-default bg-sidebar p-[3px]">
                  {PERIODS.map((period) => (
                    <button
                      className={`h-[28px] rounded px-[9px] font-semibold ${
                        financePeriod === period.id
                          ? "border-0 bg-surface text-primary"
                          : "border-0 bg-transparent text-secondary"
                      }`}
                      key={period.id}
                      onClick={() => setFinancePeriod(period.id)}
                      type="button"
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {displayFinance ? (
              <>
                <div className="mt-[22px] flex items-end justify-between">
                  <div className="flex flex-col gap-[3px]">
                    <span className="text-secondary">Income recorded</span>
                    <strong>{money.format(displayFinance.income)}</strong>
                  </div>
                  <div className="text-right">
                    <b className="block text-primary">
                      {money.format(displayFinance.income - displayFinance.expenses)}
                    </b>
                    <span className="text-muted">
                      Net after {money.format(displayFinance.expenses)} expenses
                    </span>
                  </div>
                </div>
                <div className="mt-[13px] flex h-[172px] justify-around gap-2 border-b border-default pt-[9px] max-[440px]:gap-[3px]">
                  {displayFinance.monthly.map((month, i) => (
                    <div
                      className="flex h-full flex-1 flex-col items-center gap-[7px]"
                      key={displayFinance.labels[i]}
                    >
                      <div className="bars">
                        <i
                          className="w-[min(10px,38%)] rounded-t-sm bg-default"
                          style={{
                            height: `${Math.max(2, (month.expenses / maxMonthlyValue) * 100)}%`,
                          }}
                        />
                        <b
                          className="w-[min(10px,38%)] rounded-t-sm bg-secondary"
                          style={{
                            height: `${Math.max(2, (month.income / maxMonthlyValue) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="translate-y-[18px] text-muted max-[440px]:odd:invisible">
                        {displayFinance.labels[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid min-h-[210px] place-items-center text-center text-muted">
                <p>Financial analytics are available to Admins only.</p>
              </div>
            )}
          </div>

          <div className={`${panelClass} flex min-h-[260px] flex-col`}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Occupancy</h3>
                <p className="m-0 text-muted">Current unit status across portfolio</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-[26px] py-[25px] pb-[18px] max-md:gap-[14px] max-[440px]:justify-around">
              <div
                className="donut"
                style={{
                  "--donut-occupied": `${displayUnitStatus.total ? (displayUnitStatus.occupied / displayUnitStatus.total) * 100 : 0}%`,
                  "--donut-repair": `${displayUnitStatus.total ? ((displayUnitStatus.occupied + displayUnitStatus.underRepair) / displayUnitStatus.total) * 100 : 0}%`,
                }}
              >
                <div>
                  <strong>{occupancyRate}%</strong>
                  <span>Occupied</span>
                </div>
              </div>
              <div className="min-w-[105px]">
                {[
                  ["Occupied", displayUnitStatus.occupied],
                  ["Vacant", displayUnitStatus.vacant],
                  ["Under repair", displayUnitStatus.underRepair],
                ].map(([label, value]) => (
                  <div
                    className="flex justify-between gap-[15px] py-[7px] text-secondary"
                    key={label}
                  >
                    <span className="flex items-center gap-1.5">
                      <i className="size-[7px] rounded-full bg-secondary" />
                      {label}
                    </span>
                    <b className="text-primary">{value}</b>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/units"
              className="flex w-full items-center justify-end gap-[3px] border-0 border-t border-default bg-transparent pt-[11px] font-semibold text-primary no-underline hover:text-secondary"
            >
              View unit details &rarr;
            </Link>
          </div>

          <div className={panelClass}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Rent collection</h3>
                <p className="m-0 text-muted">
                  {activeLandlord ? "Expected and collected rent" : "Agency-wide rent position"}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-md bg-subtle text-primary">
                <Banknote size={18} />
              </span>
            </div>
            <div className="mt-[14px] grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-default p-2.5">
                <small className="block text-muted">Expected / month</small>
                <b className="mt-1 block text-primary">{money.format(expectedMonthlyRent)}</b>
              </div>
              <div className="rounded-md border border-default p-2.5">
                <small className="block text-muted">Collected YTD</small>
                <b className="mt-1 block text-primary">{money.format(rentReceived)}</b>
              </div>
              <div className="rounded-md border border-default p-2.5">
                <small className="block text-muted">Outstanding</small>
                <b className="mt-1 block text-danger">{money.format(rentOutstanding)}</b>
              </div>
            </div>
            <div className="mt-[14px] flex items-center justify-between text-secondary">
              <span>Collection rate</span>
              <b className="text-primary">{collectionRate}%</b>
            </div>
            <i className="mt-1 block h-1 overflow-hidden rounded bg-subtle">
              <b
                className="block h-full rounded bg-accent"
                style={{ width: `${collectionRate}%` }}
              />
            </i>
            {!finance ? (
              <p className="mt-2 text-muted">
                Collected totals are available to Admins only. Expected rent is still shown.
              </p>
            ) : null}
          </div>

          <div className={panelClass}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Vacancy at risk</h3>
                <p className="m-0 text-muted">Rent not being earned on empty units</p>
              </div>
              <span className="grid size-9 place-items-center rounded-md bg-warning-subtle text-warning">
                <DoorOpen size={18} />
              </span>
            </div>
            <div className="mt-[14px] flex items-end justify-between">
              <div className="flex flex-col gap-[3px]">
                <span className="text-secondary">Vacant units</span>
                <strong className="text-primary">{vacantUnits.length}</strong>
              </div>
              <div className="text-right">
                <b className="block text-primary">{money.format(vacancyAtRisk)}</b>
                <span className="text-muted">monthly rent not being earned</span>
              </div>
            </div>
            <Link
              href="/units"
              className="mt-[14px] flex w-full items-center justify-end gap-[3px] border-0 border-t border-default bg-transparent pt-[11px] font-semibold text-primary no-underline hover:text-secondary"
            >
              Review vacant units &rarr;
            </Link>
          </div>

          <div className={`${panelClass} pb-[10px]`}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Recent activity</h3>
                <p className="m-0 text-muted">Latest updates across your properties</p>
              </div>
              <label className="flex h-8 w-[180px] items-center gap-2 rounded-md border border-default bg-sidebar px-[10px] text-muted">
                <Search size={14} />
                <input
                  className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Filter activity..."
                />
              </label>
            </div>
            <div className="mt-[10px]">
              {filteredActivity.length === 0 ? (
                <div className="p-10 text-center text-secondary">
                  No recent activity matches &quot;{activitySearch}&quot;
                </div>
              ) : (
                filteredActivity.map((item, i) => {
                  const IconComponent = IconMap[item.icon] || Building2;
                  return (
                    <div
                      className="grid grid-cols-[32px_minmax(0,1fr)_35px_56px] items-center gap-[9px] border-t border-default py-[10px] max-md:grid-cols-[32px_minmax(0,1fr)_45px]"
                      key={i}
                    >
                      <div
                        className={`grid size-[30px] place-items-center rounded-full ${toneClasses[item.tone] || toneClasses.green}`}
                      >
                        <IconComponent size={14} />
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <strong>{item.title}</strong>
                        <span className="truncate text-muted">{item.meta}</span>
                      </div>
                      <span className="truncate text-muted max-md:hidden">{item.time}</span>
                      <b
                        className={`text-right ${toneClasses[item.tone]?.split(" ")[1] || "text-secondary"}`}
                      >
                        {item.value}
                      </b>
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/reports"
              className="flex w-full items-center justify-end gap-[3px] border-0 border-t border-default bg-transparent pt-[11px] font-semibold text-primary no-underline hover:text-secondary"
            >
              View all activity &rarr;
            </Link>
          </div>

          <div className={panelClass}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Upcoming tasks</h3>
                <p className="m-0 text-muted">Prioritized items requiring attention</p>
              </div>
            </div>
            <div className="mt-[10px]">
              {tasks.length ? (
                tasks.map((task, i) => (
                  <Link
                    href={task.href || "/maintenance"}
                    className="flex w-full items-center gap-[10px] border-t border-default py-[10px] text-left no-underline hover:bg-sidebar"
                    key={task.id || i}
                  >
                    <div
                      className={`flex h-[38px] w-[34px] flex-none flex-col items-center justify-center rounded-[5px] ${toneClasses[task.tone] || toneClasses.green}`}
                    >
                      <b>{task.date}</b>
                      <small className="font-bold">{task.month}</small>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <strong className="text-primary">{task.title}</strong>
                      <small className="text-muted">{task.detail}</small>
                    </div>
                    <ArrowUpRight className="text-muted" size={14} />
                  </Link>
                ))
              ) : (
                <p className="border-t border-default py-6 text-center text-muted">
                  No upcoming tasks. All portfolios are up to date.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
