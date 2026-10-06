import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  RefreshCw,
  Wrench,
  CheckCircle2,
  XCircle,
  ListChecks,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
  title: "",
  description: "",
  icon: "",
  features: "",
  price: "",
  order: 0,
  isActive: true,
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD SERVICES
  // ==========================================

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/services");

      const data =
        response.data?.data ||
        response.data?.services ||
        [];

      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Services loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  // ==========================================
  // ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingService(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // ==========================================
  // EDIT MODAL
  // ==========================================

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      title: service.title || "",
      description: service.description || "",
      icon: service.icon || "",

      features: Array.isArray(service.features)
        ? service.features.join("\n")
        : service.features || "",

      price:
        service.price !== undefined &&
        service.price !== null
          ? String(service.price)
          : "",

      order:
        typeof service.order === "number"
          ? service.order
          : 0,

      isActive: service.isActive !== false,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingService(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "order"
          ? Number(value)
          : value,
    }));
  };

  // ==========================================
  // SAVE SERVICE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Service title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Service description is required.");
      return;
    }

    try {
      setSaving(true);

      const features = form.features
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        icon: form.icon.trim(),
        features,
        price: form.price.trim(),
        order: Number(form.order),
        isActive: Boolean(form.isActive),
      };

      if (editingService?._id) {
        await api.put(
          `/services/${editingService._id}`,
          payload
        );

        setSuccess("Service updated successfully.");
      } else {
        await api.post("/services", payload);

        setSuccess("Service created successfully.");
      }

      await loadServices();

      setTimeout(() => {
        setModalOpen(false);
        setEditingService(null);
        setForm({ ...initialForm });
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Service save error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save service."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE SERVICE
  // ==========================================

  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `Delete "${service.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/services/${service._id}`);

      setSuccess("Service deleted successfully.");

      await loadServices();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Service delete error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete service."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredServices = services.filter(
    (service) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      const features = Array.isArray(
        service.features
      )
        ? service.features.join(" ")
        : service.features || "";

      return (
        service.title
          ?.toLowerCase()
          .includes(query) ||
        service.description
          ?.toLowerCase()
          .includes(query) ||
        service.icon
          ?.toLowerCase()
          .includes(query) ||
        features.toLowerCase().includes(query)
      );
    }
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-5">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Wrench size={19} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">
              Services
            </h1>

            <p className="text-xs text-slate-500">
              Manage the services displayed on your portfolio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Add Service
        </button>
      </div>

      {/* ALERTS */}
      {error && !modalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {success && !modalOpen && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
          {success}
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search services..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={loadServices}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Total Services
          </p>

          <p className="mt-1.5 text-2xl font-bold text-white">
            {services.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Active Services
          </p>

          <p className="mt-1.5 text-2xl font-bold text-emerald-400">
            {
              services.filter(
                (item) => item.isActive !== false
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            With Features
          </p>

          <p className="mt-1.5 text-2xl font-bold text-blue-400">
            {
              services.filter(
                (item) =>
                  Array.isArray(item.features) &&
                  item.features.length > 0
              ).length
            }
          </p>
        </div>
      </div>

      {/* SERVICES */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            All Services
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {filteredServices.length}{" "}
            {filteredServices.length !== 1
              ? "services"
              : "service"}{" "}
            found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <RefreshCw
              size={23}
              className="animate-spin text-blue-500"
            />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <Wrench size={21} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-300">
              No services found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add your first service to get started.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus size={15} />
              Add Service
            </button>
          </div>
        ) : (
          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => {
              const features = Array.isArray(
                service.features
              )
                ? service.features
                : [];

              return (
                <div
                  key={service._id}
                  className="group rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:-translate-y-0.5 hover:border-slate-700"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-lg text-blue-400">
                      {service.icon || (
                        <Wrench size={18} />
                      )}
                    </div>

                    <div>
                      {service.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                          <CheckCircle2 size={11} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400">
                          <XCircle size={11} />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="mt-3 text-base font-semibold text-white">
                    {service.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-400">
                    {service.description ||
                      "No description available."}
                  </p>

                  {/* PRICE */}
                  {service.price && (
                    <div className="mt-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Starting Price
                      </span>

                      <p className="mt-0.5 text-base font-bold text-blue-400">
                        {service.price}
                      </p>
                    </div>
                  )}

                  {/* FEATURES */}
                  {features.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-1.5">
                        <ListChecks
                          size={14}
                          className="text-slate-500"
                        />

                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Features
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {features
                          .slice(0, 4)
                          .map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-[11px] text-slate-400"
                            >
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                              <span>{feature}</span>
                            </div>
                          ))}

                        {features.length > 4 && (
                          <p className="pt-0.5 text-[10px] text-slate-600">
                            +{features.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] text-slate-600">
                      Order: {service.order ?? 0}
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(service)
                        }
                        className="rounded-md border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(service)
                        }
                        className="rounded-md border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingService
                    ? "Edit Service"
                    : "Add Service"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {editingService
                    ? "Update service information."
                    : "Create a new service for your portfolio."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3.5 p-4"
            >
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
                  {success}
                </div>
              )}

              {/* TITLE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Service Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Web Development"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe what this service includes..."
                  required
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* ICON / PRICE */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Icon
                  </label>

                  <input
                    type="text"
                    name="icon"
                    value={form.icon}
                    onChange={handleChange}
                    placeholder="💻"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                  <p className="mt-1 text-[10px] text-slate-600">
                    Emoji or existing icon value.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Price
                  </label>

                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Starting from ₹9,999"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* FEATURES */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Features
                </label>

                <textarea
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  rows="5"
                  placeholder={
                    "Responsive Design\nSEO Friendly\nModern UI\nPerformance Optimization"
                  }
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <p className="mt-1 text-[10px] text-slate-600">
                  Write one feature per line.
                </p>
              </div>

              {/* ORDER */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Display Order
                </label>

                <input
                  type="number"
                  name="order"
                  min="0"
                  value={form.order}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* ACTIVE */}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-600"
                />

                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Active Service
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Show this service on the public portfolio.
                  </p>
                </div>
              </label>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {editingService
                    ? "Update Service"
                    : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;