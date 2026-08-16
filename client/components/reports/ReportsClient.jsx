"use client";

import { useState } from "react";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  ReceiptText,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

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
    description: "Payment, leases and tenancy standing",
    icon: Users,
  },
];
const reportRowClass = "flex items-center justify-between gap-4 py-3";
const reportValueClass = "text-primary";
const reportSubtextClass = "block text-muted";

export default function ReportsClient({
  landlords,
  properties,
  tenants,
  transactions,
  rentSchedule,
  maintenance,
}) {
  const [report, setReport] = useState("performance");
  const [period, setPeriod] = useState("August 2026");
  const [generated, setGenerated] = useState(null);
  const { activeLandlord } = useWorkspace();
  const scope = (items) =>
    activeLandlord ? items.filter((item) => item.landlord === activeLandlord.name) : items;
  const scopedProperties = scope(properties);
  const scopedTenants = scope(tenants);
  const scopedTransactions = scope(transactions);
  const scopedRent = scope(rentSchedule);
  const scopedMaintenance = scope(maintenance);
  const income = scopedTransactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = scopedTransactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalUnits = scopedProperties.reduce((sum, item) => sum + item.units, 0);
  const occupied = scopedProperties.reduce((sum, item) => sum + item.occupied, 0);
  const rentDue = scopedRent.reduce((sum, item) => sum + item.due, 0);
  const rentPaid = scopedRent.reduce((sum, item) => sum + item.paid, 0);
  const maintenanceCost = scopedMaintenance.reduce((sum, item) => sum + item.estimatedCost, 0);
  const landlordRows = landlords.map((landlord) => ({
    ...landlord,
    net: landlord.monthlyRent - landlord.outstanding,
    occupancy: Math.round((landlord.occupied / landlord.units) * 100),
  }));

  return (
    <main className="p-8 max-md:p-4">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="section-kicker">Operations / Reports</p>
          <h1>{activeLandlord ? `${activeLandlord.name}'s reports` : "Reports and analytics"}</h1>
          <p>Review portfolio performance, identify risk, and export transparent statements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled title="Excel export is not available yet">
            <FileSpreadsheet size={15} /> Excel
          </Button>
          <Button disabled title="PDF export is not available yet">
            <FileText size={15} /> PDF report
          </Button>
        </div>
      </section>
      <section className="mb-3.5 flex items-center justify-between gap-3 rounded-md border border-default bg-surface p-2.5 max-md:flex-col max-md:items-stretch">
        <div className="flex gap-1 overflow-x-auto">
          {reportTypes.map((item) => (
            <button
              className={
                report === item.id
                  ? "flex min-w-[155px] items-center gap-2 rounded border-0 bg-subtle p-2 text-left text-primary"
                  : "flex min-w-[155px] items-center gap-2 rounded border-0 bg-surface p-2 text-left text-secondary"
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
        <div className="flex flex-none flex-col gap-1">
          <span className="text-muted">Reporting period</span>
          <button
            className="flex h-8 min-w-[120px] items-center justify-between gap-2 rounded border border-default bg-surface px-2 text-primary"
            onClick={() => setPeriod(period === "August 2026" ? "Year to date" : "August 2026")}
          >
            {period}
            <ChevronDown size={14} />
          </button>
        </div>
      </section>
      {generated ? (
        <div className="mb-3.5 flex items-center gap-2 rounded border border-default bg-sidebar p-3 text-secondary">
          <Download size={15} />
          <span className="flex flex-1 flex-col gap-0.5">
            <b>{generated} export prepared</b>
            <small className="text-muted">
              The generated report uses the current workspace and reporting period.
            </small>
          </span>
          <button
            className="border-0 bg-transparent text-secondary"
            onClick={() => setGenerated(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <section className="mb-3.5 grid grid-cols-4 rounded-md border border-default bg-surface max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="flex flex-col gap-1 border-r border-default p-4">
          <small className="text-secondary">Revenue</small>
          <strong className="text-primary">${income.toLocaleString()}</strong>
          <span className="text-muted">
            <TrendingUp size={12} /> Current period
          </span>
        </div>
        <div className="flex flex-col gap-1 border-r border-default p-4">
          <small className="text-secondary">Net income</small>
          <strong className="text-primary">${(income - expenses).toLocaleString()}</strong>
          <span className="text-muted">${expenses.toLocaleString()} expenses</span>
        </div>
        <div className="flex flex-col gap-1 border-r border-default p-4">
          <small className="text-secondary">Occupancy</small>
          <strong className="text-primary">
            {totalUnits ? Math.round((occupied / totalUnits) * 100) : 0}%
          </strong>
          <span className="text-muted">
            {occupied} of {totalUnits} units
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <small className="text-secondary">Collection rate</small>
          <strong className="text-primary">
            {rentDue ? Math.round((rentPaid / rentDue) * 100) : 0}%
          </strong>
          <span className="text-muted">${(rentDue - rentPaid).toLocaleString()} outstanding</span>
        </div>
      </section>
      <section className="grid grid-cols-[minmax(0,1.6fr)_minmax(260px,.8fr)] gap-3 max-lg:grid-cols-1">
        <article className="min-w-0 rounded-md border border-default bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3>{reportTypes.find((item) => item.id === report)?.name}</h3>
              <p>
                {period} · {activeLandlord ? activeLandlord.name : "All landlord portfolios"}
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
          <h3>Decision notes</h3>
          <div className="flex gap-3 border-t border-default py-3">
            <span className="text-muted">01</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Collection exposure</b>
              {scopedRent.filter((item) => item.status === "Overdue").length} overdue schedules
              require follow-up.
            </p>
          </div>
          <div className="flex gap-3 border-t border-default py-3">
            <span className="text-muted">02</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Maintenance exposure</b>$
              {maintenanceCost.toLocaleString()} estimated across visible requests.
            </p>
          </div>
          <div className="flex gap-3 border-t border-default py-3">
            <span className="text-muted">03</span>
            <p className="m-0 text-secondary">
              <b className="block text-primary">Lease attention</b>
              {scopedTenants.filter((item) => item.status !== "Active").length} tenants have
              expiring or notice status.
            </p>
          </div>
          <Button variant="secondary">
            <Download size={14} /> Download supporting data
          </Button>
        </aside>
      </section>
      {!activeLandlord ? (
        <section className="mt-3 overflow-x-auto rounded-md border border-default bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3>Landlord portfolio comparison</h3>
              <p>Monthly performance across managed portfolios</p>
            </div>
          </div>
          <table className="w-full min-w-[760px] border-collapse text-left">
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
                  <th
                    className="bg-sidebar px-3 py-3 font-semibold uppercase text-muted"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {landlordRows.map((landlord) => (
                <tr key={landlord.id}>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    <span className="mr-2 inline-grid h-[18px] w-[18px] place-items-center rounded bg-secondary text-inverse">
                      {landlord.initials}
                    </span>
                    <b className="text-primary">{landlord.name}</b>
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    {landlord.properties}
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    {landlord.units}
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    {landlord.occupancy}%
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    ${landlord.monthlyRent.toLocaleString()}
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    ${landlord.outstanding.toLocaleString()}
                  </td>
                  <td className="border-t border-default px-3 py-3 text-secondary">
                    <b className="text-primary">${landlord.net.toLocaleString()}</b>
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
    {
      label: "Net operating position",
      value: income - expenses - maintenanceCost,
    },
  ];
  return (
    <div className="divide-y divide-default">
      {rows.map((row) => (
        <div className={reportRowClass} key={row.label}>
          <span className="text-secondary">{row.label}</span>
          <b className={reportValueClass}>
            {row.value < 0 ? "-" : ""}${Math.abs(row.value).toLocaleString()}
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
  return (
    <div className="divide-y divide-default">
      {schedules.map((item) => (
        <div className={reportRowClass} key={item.id}>
          <span className="text-secondary">
            {item.tenant}
            <small className={reportSubtextClass}>
              {item.property} · Unit {item.unit}
            </small>
          </span>
          <b className={reportValueClass}>
            ${item.paid.toLocaleString()} / ${item.due.toLocaleString()}
            <small className={reportSubtextClass}>{item.status}</small>
          </b>
        </div>
      ))}
    </div>
  );
}

function MaintenanceReport({ requests }) {
  return (
    <div className="divide-y divide-default">
      {requests.map((item) => (
        <div className={reportRowClass} key={item.id}>
          <span className="text-secondary">
            {item.title}
            <small className={reportSubtextClass}>
              {item.property} · {item.status}
            </small>
          </span>
          <b className={reportValueClass}>
            ${item.estimatedCost.toLocaleString()}
            <small className={reportSubtextClass}>{item.priority} priority</small>
          </b>
        </div>
      ))}
    </div>
  );
}

function TenantReport({ tenants }) {
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
              {tenant.payment} · ${tenant.balance.toLocaleString()} due
            </small>
          </b>
        </div>
      ))}
    </div>
  );
}
