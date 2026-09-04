export function adaptDocument(document) {
  return {
    ...document,
    name: document.displayName || "Untitled document",
    category: document.category || "Uncategorized",
    uploadedBy: document.createdBy?.name || "Unknown",
    created: document.createdAt
      ? new Date(document.createdAt).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—",
    status: document.status === "ACTIVE" ? "Active" : document.status,
  };
}

export function adaptDocuments(items = []) {
  const list = Array.isArray(items) ? items : items?.items || [];
  return list.map(adaptDocument);
}
