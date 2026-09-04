const STATUS_LABELS = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EXPIRING: "Expiring",
  TERMINATED: "Terminated",
  EXPIRED: "Expired",
  RENEWED: "Renewed",
};

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function adaptLease(lease) {
  const endRaw = lease.endDate ? new Date(lease.endDate) : null;
  const daysLeft = endRaw ? Math.ceil((endRaw.getTime() - Date.now()) / 86400000) : null;
  return {
    ...lease,
    id: lease.id,
    tenant: lease.tenant
      ? [lease.tenant.firstName, lease.tenant.lastName].filter(Boolean).join(" ")
      : "—",
    tenantId: lease.tenantId,
    tenantEmail: lease.tenant?.email || "",
    unit: lease.unit?.number || lease.unitId || "—",
    unitId: lease.unitId,
    property: lease.property?.name || lease.propertyId || "—",
    propertyId: lease.propertyId,
    landlord: lease.landlord?.name || lease.landlordId || "—",
    landlordId: lease.landlordId,
    start: formatDate(lease.startDate),
    end: formatDate(lease.endDate),
    rent: Number(lease.rentAmount ?? 0),
    deposit: Number(lease.securityDeposit ?? 0),
    schedule: lease.paymentSchedule || "monthly",
    status: STATUS_LABELS[lease.status] || lease.status,
    statusCode: lease.status,
    daysLeft,
    expiringSoon: daysLeft !== null && daysLeft > 0 && daysLeft <= 60,
    signed: Boolean(lease.signedDocumentId),
  };
}

export function adaptLeases(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptLease);
}
