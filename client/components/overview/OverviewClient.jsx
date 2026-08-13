"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Building2,
  ChevronDown,
  CircleAlert,
  Download,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

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

export default function OverviewClient({ metrics, bars, monthLabels, activity, tasks }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [period, setPeriod] = useState("This year");
  const [activitySearch, setActivitySearch] = useState("");
  const { activeLandlord } = useWorkspace();
  const filteredActivity = activity.filter(
    (item) =>
      item.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.meta.toLowerCase().includes(activitySearch.toLowerCase()),
  );

  return (
    <>
      <header className="sticky top-0 z-20 hidden h-[66px] items-center justify-between gap-6 border-b border-default bg-surface px-8 md:flex">
        <div>
          <p className="eyebrow">Tuesday, 11 August</p>
          <h1 className="m-0 leading-tight">
            {activeLandlord ? activeLandlord.name : "Agency overview"}
          </h1>
        </div>
        <div className="flex items-center gap-[9px]">
          <label className="flex h-[38px] w-[258px] items-center gap-2 rounded-md border border-default bg-sidebar px-[10px] text-muted">
            <Search size={18} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search anything..."
              aria-label="Search dashboard"
            />
            <span className="rounded border border-default bg-surface px-[5px] py-0.5 text-muted">
              ⌘ K
            </span>
          </label>
          <div className="relative">
            <button
              className="relative grid size-[38px] place-items-center rounded-md border border-default bg-surface text-primary"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <i className="absolute right-[7px] top-[7px] size-1.5 rounded-full border border-inverse bg-danger" />
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-[46px] w-[285px] rounded-[7px] border border-default bg-surface p-[14px] shadow-xl">
                <div className="mb-[9px] flex justify-between">
                  <strong>Notifications</strong>
                  <button
                    className="border-0 bg-transparent text-secondary"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
                </div>
                {["5 rent payments are overdue", "Palm View inspection is on Friday"].map(
                  (message) => (
                    <p
                      className="m-0 flex items-center gap-2 border-t border-default py-[10px] text-secondary"
                      key={message}
                    >
                      <span className="size-1.5 rounded-full bg-warning" />
                      {message}
                    </p>
                  ),
                )}
              </div>
            )}
          </div>
          <button className={`${buttonClass} border-primary bg-primary text-inverse`}>
            <Plus size={18} />
            <span>Quick add</span>
          </button>
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
            >
              <Download size={14} /> Export report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-[13px] max-[1050px]:grid-cols-2 max-[440px]:grid-cols-1">
          {metrics.map((metric) => {
            const IconComponent = IconMap[metric.icon] || Building2;
            return (
              <div
                className="grid min-w-0 grid-cols-[36px_1fr] gap-x-[10px] rounded-[7px] border border-default bg-surface p-[15px] shadow-sm max-md:grid-cols-[30px_1fr] max-md:p-3"
                key={metric.label}
              >
                <div
                  className={`row-span-2 grid size-9 place-items-center rounded-md max-md:size-[30px] ${toneClasses[metric.tone] || toneClasses.green}`}
                >
                  <IconComponent size={20} />
                </div>
                <div className="flex min-w-0 items-center justify-between text-secondary">
                  <span>{metric.label}</span>
                </div>
                <strong className="mt-1 font-semibold">{metric.value}</strong>
                <div className="col-span-full mt-[14px] flex items-center justify-between border-t border-default pt-[10px] text-muted max-md:mt-[10px]">
                  <span>{metric.note}</span>
                  <b
                    className={`rounded px-[5px] py-[3px] ${metric.change.startsWith("+") ? "bg-subtle text-secondary" : "bg-warning-subtle text-warning"}`}
                  >
                    {metric.change}
                  </b>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-[13px] grid grid-cols-[minmax(0,1.6fr)_minmax(290px,.8fr)] gap-[13px] max-[1050px]:grid-cols-1">
          <div className={panelClass}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Revenue &amp; Expenses</h3>
                <p className="m-0 text-muted">Monthly cash flow performance</p>
              </div>
              <div className="flex gap-[13px] text-secondary max-md:hidden">
                <span className="flex items-center gap-[5px]">
                  <i className="size-2 rounded-sm bg-default" /> Expected
                </span>
                <span className="flex items-center gap-[5px]">
                  <i className="size-2 rounded-sm bg-secondary" /> Received
                </span>
              </div>
              <button
                className={`${buttonClass} border-default bg-surface text-primary`}
                onClick={() => setPeriod(period === "This year" ? "Last year" : "This year")}
              >
                {period}
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="mt-[22px] flex items-end justify-between">
              <div className="flex flex-col gap-[3px]">
                <span className="text-secondary">Total received</span>
                <strong>$428,650</strong>
              </div>
              <b className="flex items-center gap-[3px] text-secondary">
                <TrendingUp size={12} /> +12%{" "}
                <span className="font-normal text-muted">vs last year</span>
              </b>
            </div>
            <div className="mt-[13px] flex h-[172px] justify-around gap-2 border-b border-default pt-[9px] max-[440px]:gap-[3px]">
              {bars.map((height, i) => (
                <div
                  className="flex h-full flex-1 flex-col items-center gap-[7px]"
                  key={monthLabels[i]}
                >
                  <div className="bars">
                    <i
                      className="w-[min(10px,38%)] rounded-t-sm bg-default"
                      data-height={Math.round(height * 0.7)}
                    />
                    <b
                      className="w-[min(10px,38%)] rounded-t-sm bg-secondary"
                      data-height={height}
                    />
                  </div>
                  <span className="translate-y-[18px] text-muted max-[440px]:odd:invisible">
                    {monthLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${panelClass} flex min-h-[260px] flex-col`}>
            <div className={headingClass}>
              <div>
                <h3 className="mb-1 mt-0">Occupancy</h3>
                <p className="m-0 text-muted">Current unit status across portfolio</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-[26px] py-[25px] pb-[18px] max-md:gap-[14px] max-[440px]:justify-around">
              <div className="donut">
                <div>
                  <strong>92%</strong>
                  <span>Occupied</span>
                </div>
              </div>
              <div className="min-w-[105px]">
                {[
                  ["Occupied", 289],
                  ["Vacant", 18],
                  ["Under repair", 5],
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
              <button className="flex h-[30px] items-center justify-center gap-[7px] rounded-md border border-primary bg-primary px-[10px] font-semibold text-inverse">
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
            <div className="mt-[10px]">
              {tasks.map((task, i) => (
                <button
                  className="flex w-full items-center gap-[10px] border-0 border-t border-default bg-transparent py-[10px] text-left"
                  key={i}
                >
                  <div
                    className={`flex h-[38px] w-[34px] flex-none flex-col items-center justify-center rounded-[5px] ${toneClasses[task.tone] || toneClasses.green}`}
                  >
                    <b>{task.date}</b>
                    <small className="font-bold">{task.month}</small>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <strong>{task.title}</strong>
                    <small className="text-muted">{task.detail}</small>
                  </div>
                  <ArrowUpRight className="text-muted" size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
