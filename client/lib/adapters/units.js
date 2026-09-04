export function adaptUnit(unit) {
  return {
    ...unit,
    id: unit.id,
    code: unit.number,
    name: unit.number,
    property: unit.property?.name || unit.propertyId,
    propertyId: unit.propertyId,
    landlord: unit.property?.landlord?.name || unit.property?.landlordId,
    landlordId: unit.property?.landlordId,
    tenant: unit.tenants?.[0]
      ? [unit.tenants[0].firstName, unit.tenants[0].lastName].filter(Boolean).join(" ")
      : "",
    bedrooms: Number(unit.bedrooms ?? 0),
    bathrooms: Number(unit.bathrooms ?? 0),
    status: unit.status === "OCCUPIED" ? "Occupied" : unit.status,
    rent: Number(unit.monthlyRent ?? 0),
    deposit: Number(unit.securityDeposit ?? 0),
  };
}

export function adaptUnits(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptUnit);
}
