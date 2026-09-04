export function adaptDashboard(data = {}) {
  const metric = (label, value, icon, href, note, tone = "green") => ({
    label,
    value,
    icon,
    href,
    tone,
    note,
  });

  const finance = data.finance
    ? {
        income: Number(data.finance.income || 0),
        expenses: Number(data.finance.expenses || 0),
        monthly: (data.finance.monthly || []).map((item) => ({
          income: Number(item.income || 0),
          expenses: Number(item.expenses || 0),
        })),
      }
    : null;
  const unitStatus = {
    occupied: Number(data.unitStatus?.occupied || 0),
    vacant: Number(data.unitStatus?.vacant || 0),
    underRepair: Number(data.unitStatus?.underRepair || 0),
    total: Number(data.unitStatus?.total || 0),
  };

  return {
    metrics: [
      metric("Landlords", data.totalLandlords ?? 0, "Building2", "/landlords", "Registered landlords"),
      metric(
        "Properties",
        data.totalProperties ?? 0,
        "Building2",
        "/properties",
        "Managed properties",
        "blue",
      ),
      metric("Tenants", data.totalTenants ?? 0, "Users", "/tenants", "Active tenants", "blue"),
      metric("Active leases", data.activeLeases ?? 0, "TrendingUp", "/leases", "Active agreements"),
      metric(
        "Pending maintenance",
        data.pendingMaintenance ?? 0,
        "Wrench",
        "/maintenance",
        "Open requests",
        "orange",
      ),
    ],
    finance,
    unitStatus,
    monthLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    notifications: data.notifications || [],
    unreadNotifications: Number(data.unreadNotifications || 0),
    activity: (data.recentTransactions ?? []).map((item) => ({
      title: item.description || item.reference || "Transaction recorded",
      meta: item.type || "Finance update",
      time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently",
      value: item.amount ? String(item.amount) : "-",
      icon: "CircleAlert",
      tone: "green",
    })),
    tasks: (data.tasks || []).map((task) => {
      const date = new Date(task.date);
      return {
        ...task,
        date: date.getDate(),
        month: date.toLocaleDateString("en", { month: "short" }).toUpperCase(),
        tone: task.type === "MAINTENANCE" ? "orange" : "blue",
        href: task.type === "MAINTENANCE" ? "/maintenance" : "/leases",
      };
    }),
  };
}
