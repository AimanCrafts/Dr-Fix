import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import "../css/notification-bell.css";

/**
 * NotificationBell (component/jsx/notification-bell.jsx)
 * ------------------------------------------------------
 * The bell in the header, shared by the client and technician headers.
 *
 * - Shows an unread badge. The count is refreshed every 30 seconds while
 *   the tab is visible, and again whenever the tab becomes visible.
 * - Clicking the bell opens a panel with the latest notifications.
 * - Clicking a notification marks it read and opens the page it points to.
 * - "Mark all as read" clears the badge.
 *
 * The role-specific part is only the `api` object
 * (client/api/notifications.js or technician/api/notifications-api.js).
 */

const POLL_MS = 30000;

function timeAgo(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NotificationBell({ api }) {
  const navigate = useNavigate();
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const refreshCount = useCallback(async () => {
    try {
      const { data } = await api.unreadCount();
      setCount(data.unread_count || 0);
    } catch {
      /* a failed poll is not worth bothering the user about */
    }
  }, [api]);

  const loadList = useCallback(async () => {
    try {
      const { data } = await api.list();
      setItems(data.items || []);
      setCount(data.unread_count || 0);
      setError("");
    } catch {
      setError("Couldn't load notifications.");
    }
  }, [api]);

  // Poll the unread count (or the whole list while the panel is open).
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (open) {
        loadList();
      } else {
        refreshCount();
      }
    };

    tick();
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [open, loadList, refreshCount]);

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setItems(null);
      setError("");
      loadList();
    }
    setOpen((value) => !value);
  };

  const handleItemClick = async (item) => {
    setOpen(false);

    if (!item.read_at) {
      setItems((prev) =>
        prev?.map((n) =>
          n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      );
      setCount((c) => Math.max(0, c - 1));
      api.markRead(item.id).catch(() => {});
    }

    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async () => {
    try {
      await api.markAllRead();
      setItems((prev) =>
        prev?.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
      );
      setCount(0);
    } catch {
      setError("Couldn't update notifications.");
    }
  };

  const badge = count > 9 ? "9+" : String(count);

  return (
    <div className="nb" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="nb__button"
        aria-label={
          count > 0 ? `Notifications, ${count} unread` : "Notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <Bell size={22} />
        {count > 0 && (
          <span className="nb__badge" aria-hidden="true">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="nb__panel" role="dialog" aria-label="Notifications">
          <div className="nb__head">
            <strong>Notifications</strong>
            <button
              type="button"
              className="nb__markall"
              onClick={handleMarkAll}
              disabled={count === 0}
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>
          </div>

          <div className="nb__list">
            {error && <p className="nb__state nb__state--error">{error}</p>}

            {!error && items === null && (
              <p className="nb__state">Loading...</p>
            )}

            {!error && items && items.length === 0 && (
              <div className="nb__empty">
                <BellOff size={26} />
                <p>You're all caught up.</p>
                <span>New updates will appear here.</span>
              </div>
            )}

            {!error &&
              items?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`nb__item ${item.read_at ? "" : "is-unread"}`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="nb__dot" aria-hidden="true" />
                  <span className="nb__content">
                    <span className="nb__title">{item.title}</span>
                    {item.body && <span className="nb__body">{item.body}</span>}
                    <span className="nb__time">{timeAgo(item.created_at)}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
