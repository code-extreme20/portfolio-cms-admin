import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  BriefcaseBusiness,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  technologies: "",
  order: 0,
  isActive: true,
};

function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD EXPERIENCE
  // ==========================================

  const loadExperiences = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/experience");

      const data =
        response.data?.data ||
        response.data?.experiences ||
        response.data?.experience ||
        [];

      setExperiences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Experience loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load experience."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  // ==========================================
  // ADD
  // ==========================================

  const openAddModal = () => {
    setEditingExperience(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const openEditModal = (experience) => {
    setEditingExperience(experience);

    setForm({
      company: experience.company || "",
      position: experience.position || "",
      location: experience.location || "",

      startDate: experience.startDate
        ? String(experience.startDate).slice(0, 10)
        : "",

      endDate: experience.endDate
        ? String(experience.endDate).slice(0, 10)
        : "",

      current: experience.current === true,

      description: experience.description || "",

      technologies: Array.isArray(experience.technologies)
        ? experience.technologies.join(", ")
        : experience.technologies || "",

      order:
        typeof experience.order === "number"
          ? experience.order
          : 0,

      isActive: experience.isActive !== false,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  // ==========================================
  // CLOSE
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingExperience(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
  };

  // ==========================================
  // INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

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
  // SAVE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.company.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!form.position.trim()) {
      setError("Position is required.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!form.current && !form.endDate) {
      setError(
        "End date is required unless this is your current position."
      );
      return;
    }

    try {
      setSaving(true);

      const technologies = form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        company: form.company.trim(),
        position: form.position.trim(),
        location: form.location.trim(),
        startDate: form.startDate,
        endDate: form.current ? null : form.endDate,
        current: Boolean(form.current),
        description: form.description.trim(),
        technologies,
        order: Number(form.order),
        isActive: Boolean(form.isActive),
      };

      if (editingExperience?._id) {
        await api.put(
          `/experience/${editingExperience._id}`,
          payload
        );

        setSuccess("Experience updated successfully.");
      } else {
        await api.post("/experience", payload);

        setSuccess("Experience created successfully.");
      }

      await loadExperiences();

      setTimeout(() => {
        setModalOpen(false);
        setEditingExperience(null);
        setForm({ ...initialForm });
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Experience save error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save experience."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (experience) => {
    const confirmed = window.confirm(
      `Delete "${experience.position}" at "${experience.company}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/experience/${experience._id}`);

      setSuccess("Experience deleted successfully.");

      await loadExperiences();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Experience delete error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete experience."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredExperiences = experiences.filter(
    (experience) => {
      const query = search.toLowerCase().trim();

      if (!query) return true;

      const technologies = Array.isArray(
        experience.technologies
      )
        ? experience.technologies.join(" ")
        : experience.technologies || "";

      return (
        experience.company
          ?.toLowerCase()
          .includes(query) ||
        experience.position
          ?.toLowerCase()
          .includes(query) ||
        experience.location
          ?.toLowerCase()
          .includes(query) ||
        experience.description
          ?.toLowerCase()
          .includes(query) ||
        technologies.toLowerCase().includes(query)
      );
    }
  );

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // DURATION
  // ==========================================

  const getDuration = (experience) => {
    if (!experience.startDate) return "";

    const start = new Date(experience.startDate);

    const end = experience.current
      ? new Date()
      : experience.endDate
      ? new Date(experience.endDate)
      : new Date();

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "";
    }

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 0) return "";

    const years = Math.floor(months / 12);

    months = months % 12;

    if (years > 0 && months > 0) {
      return `${years}y ${months}m`;
    }

    if (years > 0) {
      return `${years}y`;
    }

    return `${months}m`;
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-5">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <BriefcaseBusiness size={19} />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">
              Experience
            </h1>

            <p className="text-xs text-slate-500">
              Manage your professional experience.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Add Experience
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
              placeholder="Search experience..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={loadExperiences}
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Total Experience
          </p>

          <p className="mt-1.5 text-2xl font-bold text-white">
            {experiences.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Active
          </p>

          <p className="mt-1.5 text-2xl font-bold text-emerald-400">
            {
              experiences.filter(
                (item) => item.isActive !== false
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Current
          </p>

          <p className="mt-1.5 text-2xl font-bold text-blue-400">
            {
              experiences.filter(
                (item) => item.current === true
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Companies
          </p>

          <p className="mt-1.5 text-2xl font-bold text-purple-400">
            {
              new Set(
                experiences
                  .map((item) => item.company)
                  .filter(Boolean)
              ).size
            }
          </p>
        </div>
      </div>

      {/* EXPERIENCE LIST */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            Professional Experience
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {filteredExperiences.length}{" "}
            {filteredExperiences.length !== 1
              ? "experiences"
              : "experience"}{" "}
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
        ) : filteredExperiences.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <BriefcaseBusiness size={21} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-300">
              No experience found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add your first professional experience.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus size={15} />
              Add Experience
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredExperiences.map((experience) => {
              const technologies = Array.isArray(
                experience.technologies
              )
                ? experience.technologies
                : [];

              return (
                <div
                  key={experience._id}
                  className="p-4 transition hover:bg-slate-950/50"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    {/* LEFT */}
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <BriefcaseBusiness size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="text-base font-semibold text-white">
                            {experience.position}
                          </h3>

                          {experience.current && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                              Current
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-sm font-medium text-blue-400">
                          {experience.company}
                        </p>

                        {experience.location && (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {experience.location}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                          <span>
                            {formatDate(
                              experience.startDate
                            )}
                          </span>

                          <span className="text-slate-700">
                            —
                          </span>

                          <span>
                            {experience.current
                              ? "Present"
                              : formatDate(
                                  experience.endDate
                                )}
                          </span>

                          {getDuration(experience) && (
                            <>
                              <span className="text-slate-700">
                                •
                              </span>

                              <span className="text-slate-500">
                                {getDuration(experience)}
                              </span>
                            </>
                          )}
                        </div>

                        {experience.description && (
                          <p className="mt-3 max-w-3xl whitespace-pre-line text-xs leading-5 text-slate-400">
                            {experience.description}
                          </p>
                        )}

                        {technologies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {technologies.map(
                              (technology, index) => (
                                <span
                                  key={index}
                                  className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-300"
                                >
                                  {technology}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex shrink-0 items-center gap-1.5 lg:ml-4">
                      {experience.isActive !== false ? (
                        <span className="hidden items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400 sm:inline-flex">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="hidden items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400 sm:inline-flex">
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}

                      <span className="hidden rounded-md bg-slate-800 px-2.5 py-1 text-[10px] text-slate-500 md:inline-block">
                        Order: {experience.order ?? 0}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(experience)
                        }
                        className="rounded-md border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(experience)
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
          <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingExperience
                    ? "Edit Experience"
                    : "Add Experience"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {editingExperience
                    ? "Update your professional experience."
                    : "Add a new professional experience."}
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

              {/* COMPANY / POSITION */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Company *
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Google"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Position *
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Frontend Developer"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Jaipur, India"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* DATES */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={form.current}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </div>
              </div>

              {/* CURRENT */}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <input
                  type="checkbox"
                  name="current"
                  checked={form.current}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-600"
                />

                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Currently working here
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    End date will automatically be treated as Present.
                  </p>
                </div>
              </label>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe your responsibilities, achievements and work..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm leading-5 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* TECHNOLOGIES */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Technologies
                </label>

                <input
                  type="text"
                  name="technologies"
                  value={form.technologies}
                  onChange={handleChange}
                  placeholder="React, JavaScript, Tailwind CSS"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

                <p className="mt-1.5 text-[10px] text-slate-600">
                  Separate technologies with commas.
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
                    Active Experience
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Show this experience on the public portfolio.
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

                  {editingExperience
                    ? "Update Experience"
                    : "Create Experience"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Experience;