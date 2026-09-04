const STATUS_LABELS = {
  ACTIVE: "Active",
  FORMER: "Former",
  NOTICE_GIVEN: "Notice Given",
  ARCHIVED: "Archived",
};

const LEASE_STATUS_LABELS = {
  ACTIVE: "Active",
  EXPIRING: "Expiring",
  DRAFT: "Draft",
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

export function adaptTenant(tenant) {
  const lease = tenant.leases?.find((item) => ["ACTIVE", "EXPIRING"].includes(item.status)) || null;
  const leaseEndRaw = lease?.endDate ? new Date(lease.endDate) : null;
  const daysLeft = leaseEndRaw ? Math.ceil((leaseEndRaw.getTime() - Date.now()) / 86400000) : null;
  const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 60;
  const name =
    tenant.name ||
    [tenant.firstName, tenant.lastName].filter(Boolean).join(" ") ||
    "Unnamed tenant";
  return {
    ...tenant,
    id: tenant.id,
    name,
    firstName: tenant.firstName || name.split(" ")[0],
    lastName: tenant.lastName || name.split(" ").slice(1).join(" "),
    initials: name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase(),
    property: tenant.property?.name || tenant.propertyName || "Unassigned",
    propertyId: tenant.propertyId,
    unit:
      tenant.unit?.number ||
      tenant.unit?.code ||
      tenant.unit?.name ||
      tenant.unitId ||
      "Unassigned",
    unitId: tenant.unitId,
    landlord: tenant.landlord?.name || tenant.landlordId || "Unassigned",
    landlordId: tenant.landlordId,
    rent: Number(lease?.rentAmount ?? tenant.rent ?? 0),
    leaseStatus: lease ? LEASE_STATUS_LABELS[lease.status] || lease.status : null,
    leaseStart: formatDate(lease?.startDate),
    leaseEnd: formatDate(lease?.endDate),
    leaseDaysLeft: daysLeft,
    expiringSoon,
    status: STATUS_LABELS[tenant.status] || tenant.status,
    phone: tenant.phone || "Not provided",
    occupation: tenant.occupation || "Not provided",
    employer: tenant.employer || "Not provided",
    guarantor: tenant.guarantorName || tenant.guarantor || "Not provided",
    emailVerified: Boolean(tenant.emailVerifiedAt),
  };
}

export function adaptTenants(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptTenant);
}
