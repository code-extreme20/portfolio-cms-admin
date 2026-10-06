import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  FolderKanban,
  RefreshCw,
  ExternalLink,
  Star,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  image: "",
  technologies: "",
  liveUrl: "",
  githubUrl: "",
  category: "",
  featured: false,
  order: 0,
  isActive: true,
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/projects");

      const data =
        response.data?.data ||
        response.data?.projects ||
        [];

      setProjects(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Projects loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ==========================================
  // ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingProject(null);

    setForm({
      ...initialForm,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };

  // ==========================================
  // EDIT MODAL
  // ==========================================

  const openEditModal = (project) => {
    setEditingProject(project);

    setForm({
      title: project.title || "",

      slug: project.slug || "",

      shortDescription:
        project.shortDescription || "",

      description:
        project.description || "",

      image:
        project.image || "",

      technologies:
        Array.isArray(project.technologies)
          ? project.technologies.join(", ")
          : project.technologies || "",

      liveUrl:
        project.liveUrl || "",

      githubUrl:
        project.githubUrl || "",

      category:
        project.category || "",

      featured:
        project.featured === true,

      order:
        typeof project.order === "number"
          ? project.order
          : 0,

      isActive:
        project.isActive !== false,
    });

    setError("");
    setSuccess("");

    setModalOpen(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving || imageUploading) {
      return;
    }

    setModalOpen(false);
    setEditingProject(null);

    setForm({
      ...initialForm,
    });

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
  // GENERATE SLUG
  // ==========================================

  const generateSlug = () => {
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((previous) => ({
      ...previous,
      slug,
    }));
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setImageUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("image", file);

      const response = await api.post(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const responseData =
        response.data?.data ||
        response.data ||
        {};

      const imageUrl =
        responseData.url ||
        responseData.imageUrl ||
        responseData.fileUrl ||
        responseData.path;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by the server."
        );
      }

      setForm((previous) => ({
        ...previous,
        image: imageUrl,
      }));

      setSuccess(
        "Image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "Image upload error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload image."
      );
    } finally {
      setImageUploading(false);

      event.target.value = "";
    }
  };

  // ==========================================
  // CREATE / UPDATE PROJECT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        "Project title is required."
      );

      return;
    }

    if (!form.slug.trim()) {
      setError(
        "Project slug is required."
      );

      return;
    }

    if (!form.description.trim()) {
      setError(
        "Project description is required."
      );

      return;
    }

    try {
      setSaving(true);

      const technologies =
        form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

      const payload = {
        title: form.title.trim(),

        slug: form.slug.trim(),

        shortDescription:
          form.shortDescription.trim(),

        description:
          form.description.trim(),

        image:
          form.image.trim(),

        technologies,

        liveUrl:
          form.liveUrl.trim(),

        githubUrl:
          form.githubUrl.trim(),

        category:
          form.category.trim(),

        featured:
          Boolean(form.featured),

        order:
          Number(form.order),

        isActive:
          Boolean(form.isActive),
      };

      if (editingProject?._id) {
        await api.put(
          `/projects/${editingProject._id}`,
          payload
        );

        setSuccess(
          "Project updated successfully."
        );
      } else {
        await api.post(
          "/projects",
          payload
        );

        setSuccess(
          "Project created successfully."
        );
      }

      await loadProjects();

      setTimeout(() => {
        setModalOpen(false);
        setEditingProject(null);

        setForm({
          ...initialForm,
        });

        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(
        "Project save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save project."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE PROJECT
  // ==========================================

  const handleDelete = async (project) => {
    const confirmed =
      window.confirm(
        `Delete "${project.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/projects/${project._id}`
      );

      setSuccess(
        "Project deleted successfully."
      );

      await loadProjects();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Project delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete project."
      );
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredProjects =
    projects.filter((project) => {
      const query =
        search.toLowerCase().trim();

      if (!query) {
        return true;
      }

      const technologies =
        Array.isArray(
          project.technologies
        )
          ? project.technologies.join(" ")
          : project.technologies || "";

      return (
        project.title
          ?.toLowerCase()
          .includes(query) ||

        project.category
          ?.toLowerCase()
          .includes(query) ||

        project.description
          ?.toLowerCase()
          .includes(query) ||

        technologies
          .toLowerCase()
          .includes(query)
      );
    });

  // ==========================================
  // CATEGORIES
  // ==========================================

  const categories = [
    ...new Set(
      projects
        .map(
          (project) =>
            project.category
        )
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // STATS
  // ==========================================

  const activeProjects =
    projects.filter(
      (project) =>
        project.isActive !== false
    ).length;

  const featuredProjects =
    projects.filter(
      (project) =>
        project.featured === true
    ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-w-0 space-y-4 p-4 lg:p-5">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-2.5">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <FolderKanban size={18} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Projects
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Manage your portfolio projects.
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 lg:self-auto"
        >
          <Plus size={16} />
          Add Project
        </button>

      </div>

      {/* ======================================
          ALERTS
      ====================================== */}

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

      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-3">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div className="relative min-w-0 flex-1 md:max-w-md">

            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search projects..."
              className="w-full rounded-lg border border-slate-700 bg-[#020617] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
            />

          </div>

          <button
            type="button"
            onClick={loadProjects}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-[#020617] px-3 py-2.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

      </div>

      {/* ======================================
          SUMMARY
      ====================================== */}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-4">

          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Total Projects
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {projects.length}
          </p>

        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-4">

          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Active Projects
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {activeProjects}
          </p>

        </div>

        {/* FEATURED */}

        <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-4">

          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Featured
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-400">
            {featuredProjects}
          </p>

        </div>

        {/* CATEGORIES */}

        <div className="rounded-xl border border-slate-800 bg-[#0b1120] p-4">

          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Categories
          </p>

          <p className="mt-1 text-2xl font-bold text-blue-400">
            {categories.length}
          </p>

        </div>

      </div>

      {/* ======================================
          PROJECT TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120]">

        <div className="border-b border-slate-800 px-4 py-3">

          <h2 className="text-sm font-semibold text-white">
            All Projects
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {filteredProjects.length} project
            {filteredProjects.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>

        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">

            <RefreshCw
              size={20}
              className="animate-spin text-blue-500"
            />

          </div>
        ) : filteredProjects.length ===
          0 ? (

          <div className="px-4 py-12 text-center">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <FolderKanban size={21} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-300">
              No projects found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {search
                ? "Try a different search."
                : "Add your first project to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <Plus size={15} />
                Add Project
              </button>
            )}

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-800 bg-[#080d1a] text-left text-[10px] uppercase tracking-wider text-slate-500">

                  <th className="px-4 py-3">
                    Project
                  </th>

                  <th className="px-4 py-3">
                    Category
                  </th>

                  <th className="px-4 py-3">
                    Technologies
                  </th>

                  <th className="px-4 py-3">
                    Featured
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Order
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {filteredProjects.map(
                  (project) => {

                    const technologies =
                      Array.isArray(
                        project.technologies
                      )
                        ? project.technologies
                        : [];

                    return (
                      <tr
                        key={project._id}
                        className="transition hover:bg-slate-950/60"
                      >

                        {/* PROJECT */}

                        <td className="px-4 py-3">

                          <div className="flex items-center gap-3">

                            <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">

                              {project.image ? (
                                <img
                                  src={
                                    project.image
                                  }
                                  alt={
                                    project.title ||
                                    "Project"
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-600">
                                  <ImageIcon
                                    size={18}
                                  />
                                </div>
                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="max-w-[220px] truncate text-sm font-semibold text-slate-200">
                                {project.title}
                              </p>

                              <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-slate-500">
                                /{project.slug}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}

                        <td className="px-4 py-3">

                          <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-300">
                            {project.category ||
                              "—"}
                          </span>

                        </td>

                        {/* TECHNOLOGIES */}

                        <td className="px-4 py-3">

                          <div className="flex max-w-[220px] flex-wrap gap-1">

                            {technologies.length >
                            0 ? (
                              <>
                                {technologies
                                  .slice(0, 3)
                                  .map(
                                    (
                                      technology,
                                      index
                                    ) => (
                                      <span
                                        key={
                                          index
                                        }
                                        className="rounded-md bg-blue-500/10 px-2 py-1 text-[10px] text-blue-400"
                                      >
                                        {
                                          technology
                                        }
                                      </span>
                                    )
                                  )}

                                {technologies.length >
                                  3 && (
                                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
                                    +
                                    {technologies.length -
                                      3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-600">
                                No technologies
                              </span>
                            )}

                          </div>

                        </td>

                        {/* FEATURED */}

                        <td className="px-4 py-3">

                          {project.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-medium text-yellow-400">

                              <Star
                                size={11}
                                fill="currentColor"
                              />

                              Featured

                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600">
                              No
                            </span>
                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3">

                          {project.isActive !==
                          false ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">

                              <CheckCircle2
                                size={11}
                              />

                              Active

                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-400">

                              <XCircle
                                size={11}
                              />

                              Inactive

                            </span>
                          )}

                        </td>

                        {/* ORDER */}

                        <td className="px-4 py-3 text-xs text-slate-400">
                          {project.order ?? 0}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-3">

                          <div className="flex justify-end gap-1.5">

                            {project.liveUrl && (
                              <a
                                href={
                                  project.liveUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                                title="Open live project"
                              >
                                <ExternalLink
                                  size={15}
                                />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  project
                                )
                              }
                              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                              title="Edit"
                            >
                              <Pencil
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  project
                                )
                              }
                              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">

              <div>

                <h2 className="text-base font-bold text-white">
                  {editingProject
                    ? "Edit Project"
                    : "Add Project"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {editingProject
                    ? "Update project information."
                    : "Add a new project to your portfolio."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  imageUploading
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={17} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-4"
            >

              <div className="space-y-3">

                {/* FORM ALERT */}

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

                {/* TITLE / CATEGORY */}

                <div className="grid gap-3 md:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Project Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Portfolio Website"
                      required
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Category
                    </label>

                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="Web Development"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>

                </div>

                {/* SLUG */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Slug *
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="portfolio-website"
                      required
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={
                        generateSlug
                      }
                      className="shrink-0 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      Generate
                    </button>

                  </div>

                </div>

                {/* SHORT DESCRIPTION */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Short Description
                  </label>

                  <textarea
                    name="shortDescription"
                    value={
                      form.shortDescription
                    }
                    onChange={
                      handleChange
                    }
                    rows="2"
                    placeholder="A short summary of this project..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Description *
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Describe the project, features, technologies and your contribution..."
                    required
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                </div>

                {/* IMAGE */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Project Image
                  </label>

                  <div className="grid gap-3 md:grid-cols-[1fr_150px]">

                    <div className="space-y-2.5">

                      <input
                        type="text"
                        name="image"
                        value={
                          form.image
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="https://example.com/project-image.jpg"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                      />

                      <input
                        id="project-image-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={
                          handleImageUpload
                        }
                        className="hidden"
                      />

                      <label
                        htmlFor="project-image-upload"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-slate-400 transition hover:border-blue-500 hover:text-blue-400 ${
                          imageUploading
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >

                        {imageUploading ? (
                          <>
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ImageIcon
                              size={14}
                            />
                            Upload Image
                          </>
                        )}

                      </label>

                      <p className="text-[10px] text-slate-600">
                        Maximum image size: 5MB.
                      </p>

                    </div>

                    {/* PREVIEW */}

                    <div className="min-h-28 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">

                      {form.image ? (
                        <img
                          src={form.image}
                          alt="Project preview"
                          className="h-full min-h-28 w-full object-cover"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full min-h-28 items-center justify-center text-slate-600">
                          <ImageIcon
                            size={24}
                          />
                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* TECHNOLOGIES */}

                <div>

                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Technologies
                  </label>

                  <input
                    type="text"
                    name="technologies"
                    value={
                      form.technologies
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="React, Tailwind CSS, Node.js, MongoDB"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                  />

                  <p className="mt-1 text-[10px] text-slate-600">
                    Separate technologies with commas.
                  </p>

                </div>

                {/* URLS */}

                <div className="grid gap-3 md:grid-cols-2">

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      Live Project URL
                    </label>

                    <div className="relative">

                      <ExternalLink
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        type="url"
                        name="liveUrl"
                        value={
                          form.liveUrl
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="https://example.com"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                      />

                    </div>

                  </div>

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                      GitHub URL
                    </label>

                    <input
                      type="url"
                      name="githubUrl"
                      value={
                        form.githubUrl
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://github.com/username/project"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                    />

                  </div>

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
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />

                </div>

                {/* OPTIONS */}

                <div className="grid gap-2.5 md:grid-cols-2">

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 p-3">

                    <input
                      type="checkbox"
                      name="featured"
                      checked={
                        form.featured
                      }
                      onChange={
                        handleChange
                      }
                      className="h-4 w-4 accent-yellow-500"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        Featured Project
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Highlight this project.
                      </p>
                    </div>

                  </label>

                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-950 p-3">

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={
                        form.isActive
                      }
                      onChange={
                        handleChange
                      }
                      className="h-4 w-4 accent-blue-600"
                    />

                    <div>
                      <p className="text-xs font-medium text-slate-200">
                        Active Project
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Show this project publicly.
                      </p>
                    </div>

                  </label>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-4 flex flex-col-reverse gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    saving ||
                    imageUploading
                  }
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    imageUploading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving && (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {editingProject
                    ? "Update Project"
                    : "Create Project"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Projects;