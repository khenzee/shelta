function initials(name = "") {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function adaptEmployee(employee) {
  const user = employee.user || {};
  return {
    ...employee,
    name: user.name || "Unnamed employee",
    userId: user.id || employee.userId,
    email: user.email || "",
    phone: user.phone || "Not provided",
    initials: initials(user.name),
    department: employee.department || "Unassigned",
    jobTitle: employee.jobTitle || "",
    roleId: employee.roleId,
    role: employee.role?.name || "Unassigned",
    status:
      employee.status === "ACTIVE"
        ? "Active"
        : employee.status === "INVITED"
          ? "Invited"
          : employee.status,
    properties: (employee.properties || [])
      .map((assignment) => assignment.property?.name || assignment.propertyId)
      .filter(Boolean),
    propertyIds: (employee.properties || [])
      .map((assignment) => assignment.propertyId)
      .filter(Boolean),
    lastLoginAt: user.lastLoginAt || null,
    lastActive: user.lastLoginAt
      ? new Date(user.lastLoginAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Never",
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: employee.createdAt
      ? new Date(employee.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—",
  };
}

export function adaptEmployees(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptEmployee);
}
