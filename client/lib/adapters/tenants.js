export function adaptTenant(tenant) {
  const lease = tenant.leases?.find((item) => ["ACTIVE", "EXPIRING"].includes(item.status)) || tenant.lease;
  return {
    ...tenant,
    id: tenant.id,
    name: tenant.name,
    property: tenant.property?.name || tenant.propertyName || "Unassigned",
    propertyId: tenant.propertyId,
    unit: tenant.unit?.code || tenant.unit?.name || tenant.unitId || "Unassigned",
    unitId: tenant.unitId,
    landlord: tenant.landlord?.name || tenant.landlordId,
    landlordId: tenant.landlordId,
    rent: Number(lease?.monthlyRent ?? tenant.rent ?? 0),
    balance: Number(tenant.balance ?? 0),
    leaseStart: lease?.startDate,
    leaseEnd: lease?.endDate,
    status: tenant.status === "ACTIVE" ? "Active" : tenant.status,
    payment: tenant.paymentStatus || "Current",
    emailVerified: Boolean(tenant.emailVerifiedAt),
  };
}

export function adaptTenants(items = []) {
  return items.map(adaptTenant);
}
