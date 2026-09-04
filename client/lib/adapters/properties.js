const STATUS_LABELS = {
  ACTIVE: "Active",
  VACANT: "Vacant",
  UNDER_MAINTENANCE: "Under Maintenance",
  SOLD: "Sold",
  ARCHIVED: "Archived",
};

const ACCENTS = ["forest", "gold", "brick", "blue", "olive"];

function hashId(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

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
    status: STATUS_LABELS[property.status] || property.status,
    accent: ACCENTS[hashId(property.id) % ACCENTS.length],
  };
}

export function adaptProperties(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptProperty);
}
