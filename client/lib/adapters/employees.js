function initials(name = "") {
  return name.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export function adaptEmployee(employee) {
  const user = employee.user || {};
  return {
    ...employee,
    name: user.name || "Unnamed employee",
    email: user.email || "",
    phone: user.phone || "Not provided",
    initials: initials(user.name),
    department: employee.department || "Unassigned",
    role: employee.role?.name || "Unassigned",
    status: employee.status === "ACTIVE" ? "Active" : employee.status,
    properties: (employee.properties || []).map((assignment) => assignment.property?.name || assignment.propertyId).filter(Boolean),
    lastActive: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never",
  };
}

export function adaptEmployees(items = []) {
  return items.map(adaptEmployee);
}
