import { useEffect, useState } from "react";
import {
  Mail,
  Trash2,
  Eye,
  X,
  Loader2,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import api from "../services/api";

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // LOAD MESSAGES
  // =========================
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/contact");

      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // =========================
  // OPEN MESSAGE
  // =========================
  const openMessage = async (item) => {
    setSelectedMessage(item);

    if (item.status === "unread") {
      try {
        const response = await api.put(
          `/contact/${item._id}`,
          {
            status: "read",
          }
        );

        if (response.data.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === item._id
                ? {
                    ...msg,
                    status: "read",
                  }
                : msg
            )
          );

          setSelectedMessage((prev) =>
            prev
              ? {
                  ...prev,
                  status: "read",
                }
              : prev
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updateStatus = async (id, status) => {
    try {
      setError("");
      setMessage("");

      const response = await api.put(
        `/contact/${id}`,
        { status }
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((item) =>
            item._id === id
              ? {
                  ...item,
                  status,
                }
              : item
          )
        );

        setSelectedMessage((prev) =>
          prev?._id === id
            ? {
                ...prev,
                status,
              }
            : prev
        );

        setMessage(
          `Message marked as ${status}.`
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update message"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const deleteMessage = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this message?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/contact/${id}`
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.filter((item) => item._id !== id)
        );

        setSelectedMessage(null);
        setMessage(
          "Message deleted successfully."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete message"
      );
    }
  };

  const unreadCount = messages.filter(
    (item) => item.status === "unread"
  ).length;

  return (
    <div className="min-w-0 space-y-4 p-4 text-slate-100 lg:p-5">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Mail size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white">
              Messages
            </h1>

            <p className="truncate text-xs text-slate-400">
              Manage messages received from your portfolio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMessages}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Mail size={16} />
          )}
          Refresh
        </button>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-400">
            Total Messages
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {messages.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs text-slate-400">
            Unread Messages
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-400">
            {unreadCount}
          </p>
        </div>
      </div>

      {/* =========================
          ALERTS
      ========================= */}
      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* =========================
          MESSAGES
      ========================= */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-center">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-blue-400"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading messages...
            </p>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <Mail
            size={38}
            className="mx-auto text-slate-600"
          />

          <h2 className="mt-3 text-base font-semibold text-white">
            No messages
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Contact form messages will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((item) => (
            <div
              key={item._id}
              className={`min-w-0 rounded-xl border p-4 transition ${
                item.status === "unread"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                {/* MESSAGE INFO */}
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() =>
                    openMessage(item)
                  }
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`font-semibold ${
                        item.status === "unread"
                          ? "text-white"
                          : "text-slate-300"
                      }`}
                    >
                      {item.name}
                    </h2>

                    <span className="truncate text-xs text-slate-500">
                      {item.email}
                    </span>

                    <StatusBadge
                      status={item.status}
                    />
                  </div>

                  {item.subject && (
                    <p className="mt-1.5 font-medium text-sm text-slate-300">
                      {item.subject}
                    </p>
                  )}

                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {item.message}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-600">
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : ""}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openMessage(item)
                    }
                    className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteMessage(item._id)
                    }
                    className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-red-500 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          MESSAGE MODAL
      ========================= */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  Message Details
                </h2>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  Received from{" "}
                  {selectedMessage.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMessage(null)
                }
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="space-y-4 p-4">
              {/* DETAILS */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label="Name"
                  value={selectedMessage.name}
                />

                <Info
                  label="Email"
                  value={selectedMessage.email}
                />

                <Info
                  label="Subject"
                  value={
                    selectedMessage.subject ||
                    "No subject"
                  }
                />

                <Info
                  label="Received"
                  value={
                    selectedMessage.createdAt
                      ? new Date(
                          selectedMessage.createdAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "—"
                  }
                />
              </div>

              {/* MESSAGE */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Message
                </p>

                <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-300">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedMessage._id,
                        "unread"
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                  >
                    <Mail size={14} />
                    Unread
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedMessage._id,
                        "read"
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                  >
                    <CheckCircle2 size={14} />
                    Read
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        selectedMessage._id,
                        "replied"
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400"
                  >
                    <CheckCircle2 size={14} />
                    Replied
                  </button>
                </div>
              </div>

              {/* DELETE */}
              <div className="flex justify-end border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    deleteMessage(
                      selectedMessage._id
                    )
                  }
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================
// STATUS BADGE
// =========================
function StatusBadge({ status }) {
  if (status === "replied") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400">
        Replied
      </span>
    );
  }

  if (status === "read") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-[11px] text-blue-400">
        Read
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-[11px] text-yellow-400">
      <Clock3 size={11} />
      Unread
    </span>
  );
}

// =========================
// INFO
// =========================
function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="break-words text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}

export default Messages;