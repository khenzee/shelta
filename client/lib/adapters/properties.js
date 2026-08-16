export function adaptProperty(property) {
  const units = property.units || [];
  const occupied = units.filter((unit) => unit.status === "OCCUPIED").length;
  return {
    ...property,
    id: property.id,
    code: property.code,
    name: property.name,
    address: property.address,
    landlord: property.landlord?.name || property.landlordId,
    landlordId: property.landlordId,
    type: property.type,
    units: property._count?.units ?? units.length,
    occupied: property.occupiedUnits ?? occupied,
    rent: units.reduce((total, unit) => total + Number(unit.monthlyRent ?? 0), 0),
    status: property.status === "ACTIVE" ? "Active" : property.status,
  };
}

export function adaptProperties(items = []) {
  return items.map(adaptProperty);
}
