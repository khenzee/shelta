const TYPE_LABELS = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  VOIDED: "Voided",
};

const METHOD_LABELS = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function adaptTransaction(transaction) {
  return {
    ...transaction,
    type: TYPE_LABELS[transaction.type] || transaction.type,
    typeCode: transaction.type,
    status: STATUS_LABELS[transaction.status] || transaction.status,
    method: METHOD_LABELS[transaction.paymentMethod] || transaction.paymentMethod || "—",
    date: formatDate(transaction.transactionDate),
    property: transaction.property?.name || transaction.propertyId || "—",
    landlord: transaction.landlord?.name || transaction.landlordId || "—",
    tenant: transaction.tenantId || null,
    amount: Number(transaction.amount ?? 0),
    reference: transaction.reference || "—",
    notes: transaction.notes || "",
  };
}

export function adaptTransactions(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptTransaction);
}
