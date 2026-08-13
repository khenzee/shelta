"use client";

import { useDeferredValue, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  ChevronDown,
  Download,
  FileText,
  Plus,
  ReceiptText,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import TransactionForm from "./TransactionForm";

const summaryCardClass =
  "flex items-center gap-2.5 rounded-md border border-default bg-surface p-3.5";
const summaryIconClass = "grid h-[34px] w-[34px] place-items-center rounded bg-subtle text-primary";
const summaryBodyClass = "flex min-w-0 flex-col gap-0.5";
const tableHeaderClass = "h-[37px] bg-sidebar px-3 font-semibold uppercase text-muted";
const tableCellClass = "h-[62px] border-t border-default px-3 py-2 text-secondary";
const tablePrimaryClass = "block text-primary";
const tableSecondaryClass = "mt-1 block text-muted";

export default function FinancesClient({ transactions, rentSchedule, tenants, properties }) {
  const [view, setView] = useState("ledger");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [status, setStatus] = useState("All statuses");
  const [formMode, setFormMode] = useState(null);
  const [generated, setGenerated] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const scopedTransactions = activeLandlord
    ? transactions.filter((item) => item.landlord === activeLandlord.name)
    : transactions;
  const scopedRent = activeLandlord
    ? rentSchedule.filter((item) => item.landlord === activeLandlord.name)
    : rentSchedule;
  const scopedProperties = activeLandlord
    ? properties.filter((item) => item.landlord === activeLandlord.name)
    : properties;
  const scopedTenants = activeLandlord
    ? tenants.filter((item) => item.landlord === activeLandlord.name)
    : tenants;
  const filteredTransactions = scopedTransactions.filter(
    (item) =>
      `${item.id} ${item.category} ${item.property} ${item.tenant || ""} ${item.reference}`
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
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expenses = scopedTransactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);
  const rentDue = scopedRent.reduce((sum, item) => sum + item.due, 0);
  const rentPaid = scopedRent.reduce((sum, item) => sum + item.paid, 0);
  const collectionRate = rentDue ? Math.round((rentPaid / rentDue) * 100) : 0;

  return (
    <main className="p-8 max-md:p-4">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="section-kicker">Operations / Finances</p>
          <h1>{activeLandlord ? `${activeLandlord.name}'s finances` : "Financial operations"}</h1>
          <p>
            Track every financial movement, reconcile rent, and prepare transparent landlord
            statements.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setFormMode("Expense")}>
            <Plus size={15} /> Expense
          </Button>
          <Button onClick={() => setFormMode("Income")}>
            <Plus size={15} /> Payment
          </Button>
        </div>
      </section>
      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ArrowDownLeft size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Income recorded</small>
            <strong className="text-primary">${income.toLocaleString()}</strong>
            <b className="font-normal text-muted">Current sample period</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ArrowUpRight size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Expenses</small>
            <strong className="text-primary">${expenses.toLocaleString()}</strong>
            <b className="font-normal text-muted">Current sample period</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Banknote size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Net income</small>
            <strong className="text-primary">${(income - expenses).toLocaleString()}</strong>
            <b className="font-normal text-muted">Before agency fees</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ReceiptText size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Collection rate</small>
            <strong className="text-primary">{collectionRate}%</strong>
            <b className="font-normal text-muted">
              ${(rentDue - rentPaid).toLocaleString()} outstanding
            </b>
          </div>
        </div>
      </section>
      {generated ? (
        <div className="mb-3.5 flex items-center gap-2 rounded border border-default bg-sidebar p-3 text-secondary">
          <Download size={15} />
          <span className="flex flex-1 flex-col gap-0.5">
            <b>{generated} prepared</b>
            <small className="text-muted">
              The requested document uses the current workspace and filters.
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
      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex h-10 items-end gap-1 border-b border-default px-3">
          <button
            className={
              view === "ledger"
                ? "h-8.75 border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-8.75 border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("ledger")}
          >
            Transaction ledger
          </button>
          <button
            className={
              view === "rent"
                ? "h-8.75 border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-8.75 border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("rent")}
          >
            Rent reconciliation
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-75 items-center gap-1.75 rounded border border-default bg-sidebar px-2.5 text-muted max-md:w-full">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                view === "ledger"
                  ? "Search transaction, reference or property"
                  : "Search tenant, property or unit"
              }
            />
          </label>
          {view === "ledger" ? (
            <select
              className="h-9 min-w-33.75 rounded border border-default bg-surface px-2.5 text-primary outline-none"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option>All types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          ) : (
            <select
              className="h-9 min-w-33.75 rounded border border-default bg-surface px-2.5 text-primary outline-none"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All statuses</option>
              <option>Paid</option>
              <option>Partial</option>
              <option>Overdue</option>
            </select>
          )}
          <Button variant="secondary" onClick={() => setGenerated("Export")}>
            <Download size={14} /> Export
          </Button>
          <Button variant="secondary" onClick={() => setGenerated("Statement")}>
            <FileText size={14} /> {activeLandlord ? "Landlord statement" : "Agency statement"}
          </Button>
        </div>
        {view === "ledger" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-195 border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Transaction",
                    "Date",
                    "Property and unit",
                    "Tenant / Payee",
                    "Method",
                    "Amount",
                    "Status",
                  ].map((heading) => (
                    <th className={tableHeaderClass} key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td className={tableCellClass}>
                      <div
                        className={
                          item.type === "Income"
                            ? "grid h-8.5 w-8.5 place-items-center rounded-full bg-subtle text-primary"
                            : "grid h-8.5 w-8.5 place-items-center rounded-full bg-danger-subtle text-danger"
                        }
                      >
                        {item.type === "Income" ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                      </div>
                      <span>
                        <b className={tablePrimaryClass}>{item.category}</b>
                        <small className={tableSecondaryClass}>
                          {item.id} · {item.reference}
                        </small>
                      </span>
                    </td>
                    <td className={tableCellClass}>{item.date}</td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.property}</b>
                      <small className={tableSecondaryClass}>Unit {item.unit}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.tenant || item.notes}</b>
                      <small className={tableSecondaryClass}>{item.landlord}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.method}</b>
                      <small className={tableSecondaryClass}>{item.receipt}</small>
                    </td>
                    <td className={tableCellClass}>
                      <strong
                        className={item.type === "Income" ? "text-primary" : "text-secondary"}
                      >
                        {item.type === "Income" ? "+" : "-"}${item.amount.toLocaleString()}
                      </strong>
                    </td>
                    <td className={tableCellClass}>
                      <span
                        className={
                          item.status === "Overdue"
                            ? "inline-flex rounded bg-danger-subtle px-1.75 py-1 font-bold text-danger"
                            : item.status === "Partial"
                              ? "inline-flex rounded bg-warning-subtle px-1.75 py-1 font-bold text-warning"
                              : "inline-flex rounded bg-success-subtle px-1.75 py-1 font-bold text-success"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 border-collapse text-left">
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
                  <tr key={item.id}>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.tenant}</b>
                      <small className={tableSecondaryClass}>{item.id}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{item.property}</b>
                      <small className={tableSecondaryClass}>
                        Unit {item.unit} · {item.landlord}
                      </small>
                    </td>
                    <td className={tableCellClass}>{item.dueDate}</td>
                    <td className={tableCellClass}>{item.frequency}</td>
                    <td className={tableCellClass}>${item.due.toLocaleString()}</td>
                    <td className={tableCellClass}>${item.paid.toLocaleString()}</td>
                    <td className={tableCellClass}>
                      <strong className="text-primary">
                        ${(item.due - item.paid).toLocaleString()}
                      </strong>
                    </td>
                    <td className={tableCellClass}>
                      <span
                        className={
                          item.status === "Overdue"
                            ? "inline-flex rounded bg-danger-subtle px-1.75 py-1 font-bold text-danger"
                            : item.status === "Partial"
                              ? "inline-flex rounded bg-warning-subtle px-1.75 py-1 font-bold text-warning"
                              : "inline-flex rounded bg-success-subtle px-1.75 py-1 font-bold text-success"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex min-h-12 items-center justify-between gap-4 border-t border-default px-3 py-2 text-secondary">
          <span>
            {view === "ledger"
              ? `${filteredTransactions.length} transactions`
              : `${filteredRent.length} rent schedules`}
          </span>
          <button className="flex h-8.5 items-center gap-1 rounded border border-default bg-surface px-2 text-primary">
            <ChevronDown size={13} /> August 2026
          </button>
        </div>
      </section>
      {formMode ? (
        <TransactionForm
          mode={formMode}
          properties={scopedProperties}
          tenants={scopedTenants}
          onClose={() => setFormMode(null)}
        />
      ) : null}
    </main>
  );
}
