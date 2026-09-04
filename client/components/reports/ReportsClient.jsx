"use client";

import { useState } from "react";
import { BarChart3, Download, ReceiptText, TrendingUp, Users, Wrench } from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const reportTypes = [
  {
    id: "performance",
    name: "Portfolio performance",
    description: "Income, expenses, occupancy and profitability",
    icon: BarChart3,
  },
  {
    id: "rent",
    name: "Rent collection",
    description: "Paid, partial, overdue and outstanding rent",
    icon: ReceiptText,
  },
  {
    id: "maintenance",
    name: "Maintenance costs",
    description: "Requests, completion and repair expenditure",
    icon: Wrench,
  },
  {
    id: "tenants",
    name: "Tenant status",
    description: "Leases and tenancy standing",
    icon: Users,
  },
];

const PERIODS = [
  { id: "year", label: "Year to date" },
  { id: "quarter", label: "This quarter" },
  { id: "month", label: "This month" },
];

function periodStart(period) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  if (period === "year") return new Date(Date.UTC(year, 0, 1));
  if (period === "quarter") return new Date(Date.UTC(year, Math.floor(month / 3) * 3, 1));
  return new Date(Date.UTC(year, month, 1));
}

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";
const reportRowClass = "flex items-center justify-between gap-4 py-3";
const reportValueClass = "text-primary";
const reportSubtextClass = "block text-muted";
const tableHeaderClass = "bg-sidebar px-3 py-3 text-left font-semibold uppercase text-muted";
const tableCellClass = "border-t border-default px-3 py-3 text-secondary";

export default function ReportsClient({
  landlords,
  properties,
  tenants,
  transactions,
  rentSchedule,
  maintenance,
}) {
  const [report, setReport] = useState("performance");
  const [period, setPeriod] = useState("year");
  const { activeLandlord } = useWorkspace();

  const scopedProperties = activeLandlord
    ? properties.filter((item) => item.landlordId === activeLandlord.id)
    : properties;
  const scopedTenants = activeLandlord
    ? tenants.filter(
        (tenant) =>
          tenant.landlordId === activeLandlord.id || tenant.landlord === activeLandlord.name,
      )
    : tenants;
  const scopedTransactions = activeLandlord
    ? transactions.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : transactions;
  const scopedRent = activeLandlord
    ? rentSchedule.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : rentSchedule;
  const scopedMaintenance = activeLandlord
    ? maintenance.filter((item) => item.landlordId === activeLandlord.id)
    : maintenance;

  const start = periodStart(period);
  const periodTransactions = scopedTransactions.filter(
    (item) => item.status !== "Voided" && new Date(item.transactionDate || item.createdAt) >= start,
  );
  const income = periodTransactions
    .filter((item) => item.typeCode === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = periodTransactions
    .filter((item) => item.typeCode === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalUnits = scopedProperties.reduce((sum, item) => sum + Number(item.units || 0), 0);
  const occupied = scopedProperties.reduce((sum, item) => sum + Number(item.occupied || 0), 0);
  const rentDue = scopedRent.reduce((sum, item) => sum + item.due, 0);
  const rentPaid = scopedRent.reduce((sum, item) => sum + item.paid, 0);
  const outstanding = Math.max(0, rentDue - rentPaid);
  const collectionRate = rentDue ? Math.round((rentPaid / rentDue) * 100) : 0;
  const maintenanceCost = scopedMaintenance.reduce((sum, item) => sum + item.estimatedCost, 0);
  const overdueCount = scopedRent.filter((item) => item.status === "Overdue").length;
  const expiringCount = scopedTenants.filter((tenant) => tenant.expiringSoon).length;
  const periodLabel = PERIODS.find((item) => item.id === period)?.label;

  const landlordRows = landlords.map((landlord) => {
    const ownedProperties = properties.filter((item) => item.landlordId === landlord.id);
    const landlordUnits = ownedProperties.reduce((sum, item) => sum + Number(item.units || 0), 0);
    const landlordOccupied = ownedProperties.reduce(
      (sum, item) => sum + Number(item.occupied || 0),
      0,
    );
    const landlordOutstanding = rentSchedule
      .filter((item) => item.landlordId === landlord.id)
      .reduce((sum, item) => sum + item.outstanding, 0);
    const occupancy = landlordUnits ? Math.round((landlordOccupied / landlordUnits) * 100) : 0;
    return {
      ...landlord,
      landlordUnits,
      landlordOccupied,
      occupancy,
      outstanding: landlordOutstanding,
      net: Number(landlord.monthlyRent || 0) - landlordOutstanding,
    };
  });

  function exportCsv() {
    let rows;
    if (report === "performance") {
      rows = [
        ["Metric", "Value"],
        ["Period", periodLabel],
        ["Rental income", income],
        ["Operating expenses", expenses],
        ["Maintenance exposure", maintenanceCost],
        ["Net operating position", income - expenses - maintenanceCost],
        ["Occupied units", occupied],
        ["Total units", totalUnits],
      ];
    } else if (report === "rent") {
      rows = [
        ["Tenant", "Property", "Unit", "Due date", "Due", "Paid", "Outstanding", "Status"],
        ...scopedRent.map((item) => [
          item.tenant,
          item.property,
          item.unit,
          item.dueDate,
          item.due,
          item.paid,
          item.outstanding,
          item.status,
        ]),
      ];
    } else if (report === "maintenance") {
      rows = [
        [
          "Title",
          "Category",
          "Priority",
          "Status",
          "Property",
          "Unit",
          "Assignee",
          "Estimated cost",
          "Actual cost",
        ],
        ...scopedMaintenance.map((item) => [
          item.title,
          item.category,
          item.priority,
          item.status,
          item.property,
          item.unit,
          item.assignee || "Unassigned",
          item.estimatedCost,
          item.actualCost,
        ]),
      ];
    } else {
      rows = [
        ["Tenant", "Property", "Unit", "Status", "Lease status", "Lease end", "Monthly rent"],
        ...scopedTenants.map((tenant) => [
          tenant.name,
          tenant.property,
          tenant.unit,
          tenant.status,
          tenant.leaseStatus || "—",
          tenant.leaseEnd || "—",
          tenant.rent,
        ]),
      ];
    }
    downloadCsv(rows, `shelta-${report}-report`);
  }

  function downloadCsv(rows, name) {
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Operations / Reports
          </p>
          <h1 className="mb-1 font-medium">
            {activeLandlord ? `${activeLandlord.name}'s reports` : "Reports and analytics"}
          </h1>
          <p className="m-0 text-muted">
            Review portfolio performance, identify risk, and export statements.
          </p>
        </div>
        <Button onClick={exportCsv}>
          <Download size={15} /> Export report
        </Button>
      </section>

      <section className="mb-3.5 flex items-center justify-between gap-3 rounded-md border border-default bg-surface p-2.5 max-md:flex-col max-md:items-stretch">
        <div className="flex gap-1 overflow-x-auto">
          {reportTypes.map((item) => (
            <button
              className={
                report === item.id
                  ? "flex min-w-[155px] items-center gap-2 rounded border-0 bg-hover p-2 text-left text-primary"
                  : "flex min-w-[155px] items-center gap-2 rounded border-0 bg-transparent p-2 text-left text-secondary hover:bg-hover"
              }
              key={item.id}
              onClick={() => setReport(item.id)}
            >
              <item.icon size={16} />
              <span>
                <b>{item.name}</b>
                <small className="text-muted">{item.description}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-none items-center gap-1 rounded border border-default bg-sidebar p-[3px]">
          {PERIODS.map((item) => (
            <button
              className={
                period === item.id
                  ? "h-8 whitespace-nowrap rounded border-0 bg-surface px-3 font-semibold text-primary"
                  : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-3 text-secondary"
              }
              onClick={() => setPeriod(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <TrendingUp size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Revenue</small>
            <strong>{money.format(income)}</strong>
            <small className="truncate text-muted">{periodLabel}</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <BarChart3 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Net income</small>
            <strong>{money.format(income - expenses)}</strong>
            <small className="truncate text-muted">{money.format(expenses)} expenses</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Occupancy</small>
            <strong>{totalUnits ? Math.round((occupied / totalUnits) * 100) : 0}%</strong>
            <small className="truncate text-muted">
              {occupied} of {totalUnits} units
            </small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ReceiptText size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Collection rate</small>
            <strong>{collectionRate}%</strong>
            <small className="truncate text-muted">{money.format(outstanding)} outstanding</small>
          </span>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,.8fr)] gap-3 max-lg:grid-cols-1">
        <article className="min-w-0 rounded-md border border-default bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0">{reportTypes.find((item) => item.id === report)?.name}</h3>
              <p className="m-0 mt-1 text-muted">
                {periodLabel} · {activeLandlord ? activeLandlord.name : "All landlord portfolios"}
              </p>
            </div>
            <span className="rounded bg-subtle px-2 py-1 font-semibold text-primary">
              Generated live
            </span>
          </div>
          {report === "performance" ? (
            <PerformanceReport
              income={income}
              expenses={expenses}
              maintenanceCost={maintenanceCost}
              occupied={occupied}
              totalUnits={totalUnits}
            />
          ) : report === "rent" ? (
            <RentReport schedules={scopedRent} />
          ) : report === "maintenance" ? (
            <MaintenanceReport requests={scopedMaintenance} />
          ) : (
            <TenantReport tenants={scopedTenants} />
          )}
        </article>
        <aside className="rounded-md border border-default bg-surface p-5">
          <h3 className="m-0">Decision notes</h3>
          <div className="mt-2 flex gap-3 border-t border-default py-3">
            <span className="text-muted">01</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Collection exposure</b>
              {overdueCount} overdue rent charge{overdueCount === 1 ? "" : "s"} require follow-up.
            </p>
          </div>
          <div className="flex gap-3 border-t border-default py-3">
            <span className="text-muted">02</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Maintenance exposure</b>
              {money.format(maintenanceCost)} estimated across {scopedMaintenance.length} requests.
            </p>
          </div>
          <div className="flex gap-3 border-t border-default py-3">
            <span className="text-muted">03</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Lease attention</b>
              {expiringCount} lease{expiringCount === 1 ? "" : "s"} expiring within 60 days.
            </p>
          </div>
          <Button variant="secondary" className="w-full" onClick={exportCsv}>
            <Download size={14} /> Download report data
          </Button>
        </aside>
      </section>

      {!activeLandlord ? (
        <section className="mt-3 overflow-x-auto rounded-md border border-default bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0">Landlord portfolio comparison</h3>
              <p className="m-0 mt-1 text-muted">Monthly performance across managed portfolios</p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  [
                    [
                      "Landlord",
                      "Properties",
                      "Units",
                      "Occupancy",
                      "Expected rent",
                      "Outstanding",
                      "Net position",
                    ],
                    ...landlordRows.map((landlord) => [
                      landlord.name,
                      landlord.properties,
                      landlord.landlordUnits,
                      `${landlord.occupancy}%`,
                      landlord.monthlyRent,
                      landlord.outstanding,
                      landlord.net,
                    ]),
                  ],
                  "shelta-landlord-comparison",
                )
              }
            >
              <Download size={14} /> Export
            </Button>
          </div>
          <table className="mt-3 w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                {[
                  "Landlord",
                  "Properties",
                  "Units",
                  "Occupancy",
                  "Expected rent",
                  "Outstanding",
                  "Net position",
                ].map((heading) => (
                  <th className={tableHeaderClass} key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {landlordRows.map((landlord) => (
                <tr key={landlord.id}>
                  <td className={tableCellClass}>
                    <span className="mr-2 inline-grid h-[18px] w-[18px] place-items-center rounded bg-secondary text-inverse">
                      {landlord.initials}
                    </span>
                    <b className="text-primary">{landlord.name}</b>
                  </td>
                  <td className={tableCellClass}>{landlord.properties}</td>
                  <td className={tableCellClass}>{landlord.landlordUnits}</td>
                  <td className={tableCellClass}>{landlord.occupancy}%</td>
                  <td className={tableCellClass}>{money.format(landlord.monthlyRent)}</td>
                  <td className={tableCellClass}>
                    <span className={landlord.outstanding > 0 ? "text-danger" : ""}>
                      {money.format(landlord.outstanding)}
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <b className="text-primary">{money.format(landlord.net)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}

function PerformanceReport({ income, expenses, maintenanceCost, occupied, totalUnits }) {
  const rows = [
    { label: "Rental income", value: income },
    { label: "Operating expenses", value: -expenses },
    { label: "Maintenance exposure", value: -maintenanceCost },
    { label: "Net operating position", value: income - expenses - maintenanceCost },
  ];
  return (
    <div className="divide-y divide-default">
      {rows.map((row) => (
        <div className={reportRowClass} key={row.label}>
          <span className="text-secondary">{row.label}</span>
          <b className={reportValueClass}>
            {row.value < 0 ? "-" : ""}
            {money.format(Math.abs(row.value))}
          </b>
        </div>
      ))}
      <div className={reportRowClass}>
        <span className="text-secondary">Occupied units</span>
        <b className={reportValueClass}>
          {occupied} / {totalUnits}
        </b>
      </div>
    </div>
  );
}

function RentReport({ schedules }) {
  if (!schedules.length) {
    return <p className="py-6 text-center text-muted">No rent charges recorded.</p>;
  }
  return (
    <div className="divide-y divide-default">
      {schedules.slice(0, 15).map((item) => (
        <div className={reportRowClass} key={item.id}>
          <span className="text-secondary">
            {item.tenant}
            <small className={reportSubtextClass}>
              {item.property} · Unit {item.unit}
            </small>
          </span>
          <b className={reportValueClass}>
            {money.format(item.paid)} / {money.format(item.due)}
            <small className={reportSubtextClass}>
              {item.status} · {item.dueDate}
            </small>
          </b>
        </div>
      ))}
      {schedules.length > 15 ? (
        <p className="py-3 text-center text-muted">
          Showing 15 of {schedules.length} charges — export for the full list.
        </p>
      ) : null}
    </div>
  );
}

function MaintenanceReport({ requests }) {
  if (!requests.length) {
    return <p className="py-6 text-center text-muted">No maintenance requests recorded.</p>;
  }
  return (
    <div className="divide-y divide-default">
      {requests.map((item) => (
        <div className={reportRowClass} key={item.id}>
          <span className="text-secondary">
            {item.title}
            <small className={reportSubtextClass}>
              {item.property} · {item.status} · {item.assignee || "Unassigned"}
            </small>
          </span>
          <b className={reportValueClass}>
            {item.estimatedCost > 0 ? money.format(item.estimatedCost) : "—"}
            <small className={reportSubtextClass}>{item.priority} priority</small>
          </b>
        </div>
      ))}
    </div>
  );
}

function TenantReport({ tenants }) {
  if (!tenants.length) {
    return <p className="py-6 text-center text-muted">No tenants recorded.</p>;
  }
  return (
    <div className="divide-y divide-default">
      {tenants.map((tenant) => (
        <div className={reportRowClass} key={tenant.id}>
          <span className="text-secondary">
            {tenant.name}
            <small className={reportSubtextClass}>
              {tenant.property} · Unit {tenant.unit}
            </small>
          </span>
          <b className={reportValueClass}>
            {tenant.status}
            <small className={reportSubtextClass}>
              {tenant.leaseStatus || "No lease"} · {tenant.leaseEnd || "—"}
            </small>
          </b>
        </div>
      ))}
    </div>
  );
}
