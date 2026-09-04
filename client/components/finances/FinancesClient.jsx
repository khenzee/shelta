"use client";

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Download,
  Plus,
  ReceiptText,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import TransactionForm from "./TransactionForm";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const TYPE_TABS = ["All types", "Income", "Expense"];
const RENT_TABS = ["All statuses", "Paid", "Partial", "Pending", "Overdue"];

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";

const statusPillClass = (status) =>
  status === "Completed" || status === "Paid"
    ? "inline-flex rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Pending"
      ? "inline-flex rounded bg-info-subtle px-2 py-1 font-bold text-info"
      : status === "Partial"
        ? "inline-flex rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
        : "inline-flex rounded bg-danger-subtle px-2 py-1 font-bold text-danger";

const tableHeaderClass = "h-[37px] bg-sidebar px-3 text-left font-semibold uppercase text-muted";
const tableCellClass =
  "h-[62px] whitespace-nowrap border-t border-default px-3 py-2 text-secondary";
const tablePrimaryClass = "block max-w-[190px] truncate text-primary";
const tableSecondaryClass = "mt-1 block text-muted";

export default function FinancesClient({
  transactions,
  rentSchedule,
  tenants,
  properties,
  units,
  landlords,
}) {
  const router = useRouter();
  const [view, setView] = useState("ledger");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All statuses");
  const [formMode, setFormMode] = useState(null);
  const [voiding, setVoiding] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();

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
  const scopedProperties = activeLandlord
    ? properties.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : properties;
  const scopedTenants = activeLandlord
    ? tenants.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : tenants;
  const scopedUnits = activeLandlord
    ? units.filter((unit) => scopedProperties.some((property) => property.id === unit.propertyId))
    : units;

  const filteredTransactions = scopedTransactions.filter(
    (item) =>
      `${item.category} ${item.property} ${item.reference} ${item.tenant || ""} ${item.notes}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (type === "All types" || item.type === type),
  );
  const filteredRent = scopedRent.filter(
    (item) =>
      `${item.tenant} ${item.property} ${item.unit}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (status === "All statuses" || item.status === status),
  );

  const income = scopedTransactions
    .filter((item) => item.typeCode === "INCOME" && item.status !== "Voided")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = scopedTransactions
    .filter((item) => item.typeCode === "EXPENSE" && item.status !== "Voided")
    .reduce((sum, item) => sum + item.amount, 0);
  const rentDue = scopedRent.reduce((sum, item) => sum + item.due, 0);
  const rentPaid = scopedRent.reduce((sum, item) => sum + item.paid, 0);
  const collectionRate = rentDue ? Math.round((rentPaid / rentDue) * 100) : 0;

  async function confirmVoid() {
    const response = await fetch(`/api/finances/${voiding.id}/void`, { method: "PUT" });
    setVoiding(null);
    if (response.ok) router.refresh();
  }

  function exportCsv() {
    if (view === "ledger") {
      const rows = [
        [
          "Type",
          "Category",
          "Date",
          "Property",
          "Landlord",
          "Method",
          "Reference",
          "Amount",
          "Status",
        ],
        ...filteredTransactions.map((item) => [
          item.type,
          item.category,
          item.date,
          item.property,
          item.landlord,
          item.method,
          item.reference,
          item.amount,
          item.status,
        ]),
      ];
      downloadCsv(rows, "shelta-transactions");
      return;
    }
    const rows = [
      [
        "Tenant",
        "Property",
        "Unit",
        "Due date",
        "Schedule",
        "Due",
        "Paid",
        "Outstanding",
        "Status",
      ],
      ...filteredRent.map((item) => [
        item.tenant,
        item.property,
        item.unit,
        item.dueDate,
        item.frequency,
        item.due,
        item.paid,
        item.outstanding,
        item.status,
      ]),
    ];
    downloadCsv(rows, "shelta-rent-schedule");
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
            Operations / Finances
          </p>
          <h1 className="mb-1 font-medium">
            {activeLandlord ? `${activeLandlord.name}'s finances` : "Financial operations"}
          </h1>
          <p className="m-0 text-muted">
            Track every financial movement and reconcile rent collection.
          </p>
        </div>
        <div className="flex gap-2 max-md:w-full max-md:flex-1">
          <Button variant="secondary" onClick={() => setFormMode("EXPENSE")}>
            <Plus size={15} /> Expense
          </Button>
          <Button onClick={() => setFormMode("INCOME")}>
            <Plus size={15} /> Payment
          </Button>
        </div>
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ArrowDownLeft size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Income recorded</small>
            <strong>{money.format(income)}</strong>
            <small className="truncate text-muted">All completed income</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ArrowUpRight size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Expenses</small>
            <strong>{money.format(expenses)}</strong>
            <small className="truncate text-muted">All completed expenses</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Banknote size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Net income</small>
            <strong>{money.format(income - expenses)}</strong>
            <small className="truncate text-muted">Income minus expenses</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ReceiptText size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Collection rate</small>
            <strong>{collectionRate}%</strong>
            <small className="truncate text-muted">
              {money.format(Math.max(0, rentDue - rentPaid))} outstanding
            </small>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex h-10 items-end gap-1 border-b border-default px-3">
          <button
            className={
              view === "ledger"
                ? "h-[35px] border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-[35px] border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("ledger")}
          >
            Transaction ledger
          </button>
          <button
            className={
              view === "rent"
                ? "h-[35px] border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-[35px] border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("rent")}
          >
            Rent reconciliation
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-[280px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                view === "ledger"
                  ? "Search category, reference or property"
                  : "Search tenant, property or unit"
              }
            />
          </label>
          {view === "ledger" ? (
            <div className="flex flex-1 items-center gap-1 overflow-x-auto max-md:order-3 max-md:basis-full">
              {TYPE_TABS.map((item) => (
                <button
                  className={
                    type === item
                      ? "h-8 whitespace-nowrap rounded border-0 bg-hover px-2.5 font-bold text-primary"
                      : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-2.5 text-secondary hover:bg-hover"
                  }
                  onClick={() => setType(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-1 overflow-x-auto max-md:order-3 max-md:basis-full">
              {RENT_TABS.map((item) => (
                <button
                  className={
                    status === item
                      ? "h-8 whitespace-nowrap rounded border-0 bg-hover px-2.5 font-bold text-primary"
                      : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-2.5 text-secondary hover:bg-hover"
                  }
                  onClick={() => setStatus(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={14} /> Export
          </Button>
        </div>
        {view === "ledger" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Transaction",
                    "Date",
                    "Property",
                    "Tenant / Payee",
                    "Method",
                    "Amount",
                    "Status",
                    "",
                  ].map((heading) => (
                    <th className={tableHeaderClass} key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-hover">
                    <td className={tableCellClass}>
                      <span className="flex items-center gap-2.5">
                        <span
                          className={
                            item.typeCode === "INCOME"
                              ? "grid size-8 flex-none place-items-center rounded-full bg-subtle text-primary"
                              : "grid size-8 flex-none place-items-center rounded-full bg-danger-subtle text-danger"
                          }
                        >
                          {item.typeCode === "INCOME" ? (
                            <ArrowDownLeft size={14} />
                          ) : (
                            <ArrowUpRight size={14} />
                          )}
                        </span>
                        <span className="min-w-0">
                          <b className={tablePrimaryClass}>{item.category}</b>
                          <small className={tableSecondaryClass}>{item.reference}</small>
                        </span>
                      </span>
                    </td>
                    <td className={tableCellClass}>{item.date}</td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.property}</b>
                      <small className={tableSecondaryClass}>{item.landlord}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>
                        {item.tenant
                          ? scopedTenants.find((tenant) => tenant.id === item.tenant)?.name ||
                            "Tenant"
                          : item.notes || "—"}
                      </b>
                      {item.tenant ? (
                        <small className={tableSecondaryClass}>Tenant payment</small>
                      ) : null}
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.method}</b>
                    </td>
                    <td className={tableCellClass}>
                      <strong
                        className={item.typeCode === "INCOME" ? "text-primary" : "text-secondary"}
                      >
                        {item.typeCode === "INCOME" ? "+" : "-"}
                        {money.format(item.amount)}
                      </strong>
                    </td>
                    <td className={tableCellClass}>
                      <span className={statusPillClass(item.status)}>{item.status}</span>
                    </td>
                    <td className={tableCellClass}>
                      {item.status === "Pending" ? (
                        <button
                          className="rounded border border-default bg-surface px-2 py-1 font-semibold text-danger"
                          onClick={() => setVoiding(item)}
                        >
                          Void
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td className="border-t border-default p-10 text-center text-muted" colSpan={8}>
                      <Banknote className="mx-auto mb-2" size={30} />
                      <b className="block text-secondary">No transactions found</b>
                      Adjust the search or type filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Tenant",
                    "Property and unit",
                    "Due date",
                    "Schedule",
                    "Due",
                    "Paid",
                    "Outstanding",
                    "Status",
                  ].map((heading) => (
                    <th className={tableHeaderClass} key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRent.map((item) => (
                  <tr key={item.id} className="hover:bg-hover">
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.tenant}</b>
                      <small className={tableSecondaryClass}>{item.landlord}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.property}</b>
                      <small className={tableSecondaryClass}>Unit {item.unit}</small>
                    </td>
                    <td className={tableCellClass}>{item.dueDate}</td>
                    <td className={tableCellClass}>{item.frequency}</td>
                    <td className={tableCellClass}>{money.format(item.due)}</td>
                    <td className={tableCellClass}>{money.format(item.paid)}</td>
                    <td className={tableCellClass}>
                      <strong className={item.outstanding > 0 ? "text-danger" : "text-primary"}>
                        {money.format(item.outstanding)}
                      </strong>
                    </td>
                    <td className={tableCellClass}>
                      <span className={statusPillClass(item.status)}>{item.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredRent.length === 0 ? (
                  <tr>
                    <td className="border-t border-default p-10 text-center text-muted" colSpan={8}>
                      <ReceiptText className="mx-auto mb-2" size={30} />
                      <b className="block text-secondary">No rent charges found</b>
                      Adjust the search or status filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            {view === "ledger"
              ? `Showing ${filteredTransactions.length} of ${scopedTransactions.length} transactions`
              : `Showing ${filteredRent.length} of ${scopedRent.length} rent charges`}
          </span>
        </div>
      </section>

      {formMode ? (
        <TransactionForm
          mode={formMode}
          landlords={landlords}
          properties={scopedProperties}
          units={scopedUnits}
          tenants={scopedTenants}
          onClose={() => setFormMode(null)}
        />
      ) : null}

      {voiding ? (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4"
          onClick={() => setVoiding(null)}
        >
          <section
            className="w-full max-w-sm rounded-md bg-surface p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Void transaction?</h3>
            <p className="text-secondary">
              {voiding.category} — {money.format(voiding.amount)}. Voided transactions stay in the
              ledger but are excluded from totals.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setVoiding(null)}>
                Cancel
              </Button>
              <Button className="text-danger" onClick={confirmVoid}>
                Void transaction
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
