function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function adaptLandlord(landlord) {
  const properties = landlord.properties?.length ?? landlord._count?.properties ?? 0;
  const units = landlord._count?.units ?? landlord.units ?? 0;
  const portal =
    landlord.portalStatus === "ACTIVE"
      ? "Active"
      : landlord.portalStatus === "INVITED"
        ? "Invited"
        : "Inactive";

  return {
    ...landlord,
    id: landlord.id,
    code: landlord.code,
    backendId: landlord.id,
    initials: initials(landlord.name),
    portal,
    emailVerified: Boolean(landlord.emailVerifiedAt),
    properties,
    units,
    attention: Number(landlord.attention ?? 0),
    monthlyRent: Number(landlord.monthlyRent ?? 0),
  };
}

export function adaptLandlords(items = []) {
  const records = Array.isArray(items) ? items : items?.items;
  return Array.isArray(records) ? records.map(adaptLandlord) : [];
}
