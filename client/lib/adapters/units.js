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
    tenant: unit.tenants?.[0]?.name || "Vacant",
    status: unit.status === "OCCUPIED" ? "Occupied" : unit.status,
    rent: Number(unit.monthlyRent ?? 0),
    deposit: Number(unit.securityDeposit ?? 0),
  };
}

export function adaptUnits(items = []) {
  return items.map(adaptUnit);
}
