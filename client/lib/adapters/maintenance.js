const statusLabels = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  VERIFIED: "Verified",
};

const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function adaptMaintenanceRequest(request) {
  const createdAt = request.createdAt ? new Date(request.createdAt) : null;
  const updatedAt = request.updatedAt ? new Date(request.updatedAt) : null;
  const tenant = request.tenant;
  return {
    ...request,
    id: request.id,
    title: request.title || "Maintenance request",
    description: request.description || "No description provided.",
    category: request.category || "OTHER",
    priority: priorityLabels[request.priority] || request.priority || "Medium",
    statusCode: request.status,
    status: statusLabels[request.status] || request.status || "Open",
    property: request.property?.name || request.propertyId || "Unassigned",
    propertyId: request.propertyId,
    landlord: request.property?.landlord?.name || request.landlord || "",
    landlordId: request.property?.landlordId || request.property?.landlord?.id || "",
    unit: request.unit?.number || request.unitId || "Unassigned",
    tenant: tenant ? `${tenant.firstName} ${tenant.lastName}` : "",
    assignee: request.assignedTo?.name || "",
    assigneeId: request.assignedToId || "",
    estimatedCost: Number(request.estimatedCost || 0),
    actualCost: Number(request.actualCost || 0),
    photos: request.documents?.length || 0,
    created: createdAt ? createdAt.toLocaleDateString() : "Unknown",
    updated: updatedAt ? updatedAt.toLocaleDateString() : "Not updated",
  };
}

export function adaptMaintenanceRequests(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptMaintenanceRequest);
}
