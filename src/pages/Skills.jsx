import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Code2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
  name: "",
  category: "",
  level: 80,
  icon: "",
  description: "",
  order: 0,
  isActive: true,
};

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/skills");

      const data =
        response.data?.data ||
        response.data?.skills ||
        [];

      setSkills(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Skills loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load skills."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openAddModal = () => {
    setEditingSkill(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);

    setForm({
      name: skill.name || "",
      category: skill.category || "",
      level:
        typeof skill.level === "number"
          ? skill.level
          : 80,
      icon: skill.icon || "",
      description: skill.description || "",
      order:
        typeof skill.order === "number"
          ? skill.order
          : 0,
      isActive: skill.isActive !== false,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingSkill(null);
    setForm(initialForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "level" || name === "order"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Skill name is required.");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required.");
      return;
    }

    if (
      Number(form.level) < 0 ||
      Number(form.level) > 100
    ) {
      setError(
        "Skill level must be between 0 and 100."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        level: Number(form.level),
        icon: form.icon.trim(),
        description: form.description.trim(),
        order: Number(form.order),
        isActive: Boolean(form.isActive),
      };

      if (editingSkill?._id) {
        await api.put(
          `/skills/${editingSkill._id}`,
          payload
        );

        setSuccess("Skill updated successfully.");
      } else {
        await api.post("/skills", payload);

        setSuccess("Skill created successfully.");
      }

      await loadSkills();

      setTimeout(() => {
        setModalOpen(false);
        setEditingSkill(null);
        setForm(initialForm);
        setSuccess("");
      }, 500);
    } catch (err) {
      console.error("Skill save error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save skill."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skill) => {
    const confirmed = window.confirm(
      `Delete "${skill.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/skills/${skill._id}`);

      setSuccess("Skill deleted successfully.");

      await loadSkills();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Skill delete error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete skill."
      );
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      skill.name
        ?.toLowerCase()
        .includes(query) ||
      skill.category
        ?.toLowerCase()
        .includes(query) ||
      skill.description
        ?.toLowerCase()
        .includes(query)
    );
  });

  const categories = [
    ...new Set(
      skills
        .map((skill) => skill.category)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-5">

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-2.5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Code2 size={20} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Skills
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Manage your technical skills and expertise.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Add Skill
        </button>

      </div>

      {/* Alerts */}
      {error && !modalOpen && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {success && !modalOpen && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          {success}
        </div>
      )}

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search skills..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={loadSkills}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Total Skills
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {skills.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Active Skills
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {
              skills.filter(
                (skill) =>
                  skill.isActive !== false
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Categories
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-400">
            {categories.length}
          </p>
        </div>

      </div>

      {/* Skills Table */}
      <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900">

        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            All Skills
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {filteredSkills.length} skill
            {filteredSkills.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <RefreshCw
              size={23}
              className="animate-spin text-blue-500"
            />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="px-4 py-10 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <Code2 size={21} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-300">
              No skills found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Add your first skill to get started.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={15} />
              Add Skill
            </button>

          </div>
        ) : (
          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[760px]">

              <thead>
                <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-3">
                    Skill
                  </th>

                  <th className="px-4 py-3">
                    Category
                  </th>

                  <th className="px-4 py-3">
                    Level
                  </th>

                  <th className="px-4 py-3">
                    Order
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredSkills.map((skill) => (
                  <tr
                    key={skill._id}
                    className="transition hover:bg-slate-950/60"
                  >

                    {/* Skill */}
                    <td className="px-4 py-3">

                      <div className="flex items-center gap-2.5">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
                          {skill.icon || (
                            <Code2 size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {skill.name}
                          </p>

                          {skill.description && (
                            <p className="mt-0.5 max-w-xs truncate text-[11px] text-slate-500">
                              {skill.description}
                            </p>
                          )}
                        </div>

                      </div>

                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">

                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                        {skill.category || "—"}
                      </span>

                    </td>

                    {/* Level */}
                    <td className="px-4 py-3">

                      <div className="w-28">

                        <div className="mb-1.5 flex justify-between text-[11px]">

                          <span className="text-slate-500">
                            Proficiency
                          </span>

                          <span className="font-semibold text-slate-300">
                            {skill.level || 0}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  skill.level || 0
                                )
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                    {/* Order */}
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {skill.order ?? 0}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">

                      {skill.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400">
                          <XCircle size={12} />
                          Inactive
                        </span>
                      )}

                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">

                      <div className="flex justify-end gap-1.5">

                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(skill)
                          }
                          className="rounded-md border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(skill)
                          }
                          className="rounded-md border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">

              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingSkill
                    ? "Edit Skill"
                    : "Add Skill"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {editingSkill
                    ? "Update skill information."
                    : "Add a new skill to your portfolio."}
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

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4"
            >

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                  {success}
                </div>
              )}

              {/* Name + Category */}
              <div className="grid gap-3 md:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Skill Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="React.js"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Category *
                  </label>

                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Frontend"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Level + Order */}
              <div className="grid gap-3 md:grid-cols-2">

                <div>
                  <div className="mb-1.5 flex items-center justify-between">

                    <label className="text-xs font-medium text-slate-300">
                      Skill Level
                    </label>

                    <span className="text-xs font-bold text-blue-400">
                      {form.level}%
                    </span>

                  </div>

                  <input
                    type="range"
                    name="level"
                    min="0"
                    max="100"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full accent-blue-500"
                  />
                </div>

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
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Icon */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Icon
                </label>

                <input
                  type="text"
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="⚛️ or icon class/name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />

                <p className="mt-1.5 text-[11px] text-slate-600">
                  You can use an emoji or your existing icon value.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Briefly describe your experience with this skill..."
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-600"
                />

                <div>
                  <p className="text-xs font-medium text-slate-200">
                    Active Skill
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Show this skill on the public portfolio.
                  </p>
                </div>

              </label>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {editingSkill
                    ? "Update Skill"
                    : "Create Skill"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Skills;