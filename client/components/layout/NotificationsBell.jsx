"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      setItems(payload.items || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data load on mount mirrors existing components
    load();
  }, [load]);

  const unread = items.filter((item) => !item.readAt).length;

  async function markRead(notification) {
    if (notification.readAt) return;
    await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" }).catch(() => {});
    await load();
  }

  return (
    <div className="relative">
      <button
        className="relative flex h-[29px] items-center gap-1 whitespace-nowrap rounded border-0 bg-transparent px-2 text-secondary"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
      >
        <Bell size={15} />
        {unread > 0 ? (
          <i className="absolute right-0 top-0 size-1.5 rounded-full bg-danger" />
        ) : null}
        <span className="hidden md:inline">{unread > 0 ? unread : "Notifications"}</span>
      </button>
      {open ? (
        <div className="absolute right-0 top-9 z-30 w-[300px] rounded-md border border-default bg-surface p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 pb-1">
            <b className="text-primary">Notifications</b>
            <button
              className="grid size-6 place-items-center rounded border-0 bg-transparent text-secondary"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            >
              <X size={14} />
            </button>
          </div>
          {loading ? (
            <p className="px-2 py-4 text-center text-muted">Loading…</p>
          ) : items.length ? (
            items.map((notification) => (
              <button
                className="flex w-full items-start gap-2 rounded border-0 border-t border-default bg-transparent px-2 py-2 text-left hover:bg-sidebar"
                key={notification.id}
                onClick={() => markRead(notification)}
                type="button"
                title={notification.readAt ? "Read" : "Mark as read"}
              >
                <span
                  className={`mt-1 size-1.5 flex-none rounded-full ${notification.readAt ? "bg-default" : "bg-warning"}`}
                />
                <span className="min-w-0">
                  <b className="block text-primary">{notification.title}</b>
                  <span className="text-secondary">{notification.body}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-2 py-4 text-center text-muted">No notifications</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
