function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function adaptRentCharge(charge) {
  const lease = charge.lease || {};
  const due = Number(charge.amountDue ?? 0);
  const paid = Number(charge.amountPaid ?? 0);
  const overdue = charge.status !== "paid" && new Date(charge.dueDate) < new Date();
  let status = "Paid";
  if (charge.status !== "paid") {
    if (overdue) status = "Overdue";
    else if (paid > 0) status = "Partial";
    else status = "Pending";
  } else if (paid < due) {
    status = "Partial";
  }
  return {
    ...charge,
    id: charge.id,
    tenant: lease.tenant
      ? [lease.tenant.firstName, lease.tenant.lastName].filter(Boolean).join(" ")
      : "—",
    tenantId: lease.tenantId,
    property: lease.property?.name || lease.propertyId || "—",
    propertyId: lease.propertyId,
    unit: lease.unit?.number || lease.unitId || "—",
    landlord: lease.landlord?.name || lease.landlordId || "—",
    landlordId: lease.landlordId,
    dueDate: formatDate(charge.dueDate),
    frequency: lease.paymentSchedule || "monthly",
    due,
    paid,
    outstanding: Math.max(0, due - paid),
    status,
  };
}

export function adaptRentCharges(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptRentCharge);
}
