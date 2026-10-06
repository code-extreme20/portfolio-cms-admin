import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  FileText,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  Eye,
  Tag,
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: "",
  author: "Admin",
  published: false,
  publishedAt: "",
  order: 0,
  isActive: true,
};

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // =========================
  // FETCH BLOGS
  // =========================
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/blogs");

      if (response.data.success) {
        setBlogs(
          response.data.blogs ||
            response.data.data ||
            []
        );
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // =========================
  // SEARCH
  // =========================
  const filteredBlogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return blogs;

    return blogs.filter((blog) => {
      return (
        blog.title?.toLowerCase().includes(query) ||
        blog.slug?.toLowerCase().includes(query) ||
        blog.category?.toLowerCase().includes(query) ||
        blog.author?.toLowerCase().includes(query) ||
        blog.excerpt?.toLowerCase().includes(query) ||
        blog.content?.toLowerCase().includes(query) ||
        blog.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        )
      );
    });
  }, [blogs, search]);

  // =========================
  // STATS
  // =========================
  const totalBlogs = blogs.length;

  const publishedBlogs = blogs.filter(
    (blog) => blog.published
  ).length;

  const draftBlogs = totalBlogs - publishedBlogs;

  const activeBlogs = blogs.filter(
    (blog) => blog.isActive
  ).length;

  // =========================
  // MODAL
  // =========================
  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      publishedAt: "",
    });

    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingId(blog._id);

    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImage: blog.coverImage || "",
      category: blog.category || "",
      tags: Array.isArray(blog.tags)
        ? blog.tags.join(", ")
        : blog.tags || "",
      author: blog.author || "Admin",
      published: blog.published ?? false,
      publishedAt: blog.publishedAt
        ? new Date(blog.publishedAt)
            .toISOString()
            .slice(0, 10)
        : "",
      order: blog.order || 0,
      isActive: blog.isActive ?? true,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // GENERATE SLUG
  // =========================
  const generateSlug = () => {
    if (!form.title.trim()) return;

    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((prev) => ({
      ...prev,
      slug,
    }));
  };

  // =========================
  // SAVE BLOG
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Blog title is required.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Blog slug is required.");
      return;
    }

    if (!form.content.trim()) {
      alert("Blog content is required.");
      return;
    }

    try {
      setSaving(true);

      const tagsArray = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage.trim(),
        category: form.category.trim(),
        tags: tagsArray,
        author: form.author.trim() || "Admin",
        published: form.published,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt)
          : form.published
          ? new Date()
          : null,
        order: Number(form.order) || 0,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.put(
          `/blogs/${editingId}`,
          payload
        );
      } else {
        await api.post("/blogs", payload);
      }

      closeModal();
      await fetchBlogs();
    } catch (error) {
      console.error(
        "Failed to save blog:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save blog."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blog?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/blogs/${id}`);
      await fetchBlogs();
    } catch (error) {
      console.error(
        "Failed to delete blog:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete blog."
      );
    }
  };

  return (
    <div className="min-w-0 space-y-4 p-4 text-slate-100 lg:p-5">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <FileText
              size={21}
              className="text-blue-400"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white">
              Blogs
            </h1>

            <p className="truncate text-xs text-[#7890b3]">
              Manage blog posts published on your portfolio.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Add Blog
        </button>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Total Blogs
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {totalBlogs}
          </p>
        </div>

        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Published
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {publishedBlogs}
          </p>
        </div>

        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Drafts
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-400">
            {draftBlogs}
          </p>
        </div>

        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-400">
            {activeBlogs}
          </p>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}
      <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5d7193]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search blogs..."
              className="w-full rounded-lg border border-[#293957] bg-[#020617] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#405576] transition focus:border-blue-500"
            />
          </div>

          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#30405e] bg-[#020617] px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-[#111c31] disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* =========================
          BLOG LIST
      ========================= */}
      {loading ? (
        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-8 text-center">
          <RefreshCw
            size={25}
            className="mx-auto animate-spin text-blue-500"
          />

          <p className="mt-3 text-sm text-[#7890b3]">
            Loading blogs...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#30405e] bg-[#0f172a] p-8 text-center">
          <FileText
            size={35}
            className="mx-auto text-slate-600"
          />

          <h3 className="mt-3 text-base font-semibold text-white">
            No blogs found
          </h3>

          <p className="mt-1 text-sm text-[#7890b3]">
            {search
              ? "Try a different search term."
              : "Add your first blog to get started."}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="min-w-0 overflow-hidden rounded-xl border border-[#24314d] bg-[#0f172a] transition hover:border-[#30466b]"
            >
              {/* COVER IMAGE */}
              <div className="relative h-40 w-full overflow-hidden bg-[#020617]">
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileText
                      size={40}
                      className="text-slate-700"
                    />
                  </div>
                )}

                {/* STATUS */}
                <div className="absolute right-3 top-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium backdrop-blur-md ${
                      blog.published
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {blog.published ? (
                      <>
                        <CheckCircle2 size={13} />
                        Published
                      </>
                    ) : (
                      <>
                        <Clock3 size={13} />
                        Draft
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4">
                {/* BADGES */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {blog.category && (
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-400">
                      {blog.category}
                    </span>
                  )}

                  {!blog.isActive && (
                    <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-[11px] font-medium text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>

                {/* TITLE */}
                <h2 className="line-clamp-2 text-lg font-bold text-white">
                  {blog.title}
                </h2>

                {/* SLUG */}
                <p className="mt-1 truncate text-xs text-[#5d7193]">
                  /{blog.slug}
                </p>

                {/* EXCERPT */}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                  {blog.excerpt ||
                    blog.content ||
                    "No description available."}
                </p>

                {/* TAGS */}
                {Array.isArray(blog.tags) &&
                  blog.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {blog.tags.map(
                        (tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-400"
                          >
                            <Tag size={11} />
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  )}

                {/* META */}
                <div className="mt-3 flex flex-col gap-1 border-t border-[#24314d] pt-3 text-xs text-[#5d7193]">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      Author:{" "}
                      <span className="text-slate-300">
                        {blog.author || "Admin"}
                      </span>
                    </span>

                    <span>
                      Order:{" "}
                      <span className="text-slate-300">
                        {blog.order ?? 0}
                      </span>
                    </span>
                  </div>

                  {blog.publishedAt && (
                    <span>
                      Published:{" "}
                      <span className="text-slate-300">
                        {new Date(
                          blog.publishedAt
                        ).toLocaleDateString()}
                      </span>
                    </span>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      openEditModal(blog)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-transparent px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(blog._id)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-transparent px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>

                  {blog.slug && (
                    <button
                      onClick={() =>
                        window.open(
                          `/blog/${blog.slug}`,
                          "_blank"
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-[#30405e] bg-[#020617] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-[#111c31]"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          MODAL
      ========================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#293957] bg-[#0f172a] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#293957] bg-[#0f172a] px-4 py-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId
                    ? "Edit Blog"
                    : "Add Blog"}
                </h2>

                <p className="mt-0.5 text-xs text-[#7890b3]">
                  Create and manage your portfolio blog post.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#111c31] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3 p-4"
            >
              {/* TITLE + SLUG */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Title *
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="My First Blog"
                    required
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

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
                      placeholder="my-first-blog"
                      required
                      className="min-w-0 flex-1 rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={generateSlug}
                      className="shrink-0 rounded-lg border border-[#30405e] bg-[#111c31] px-3 text-xs font-medium text-blue-300 transition hover:bg-[#17243b]"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* EXCERPT */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Excerpt
                </label>

                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={handleChange}
                  placeholder="Short description of your blog..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                />
              </div>

              {/* CONTENT */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Content *
                </label>

                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write your blog content here..."
                  rows={8}
                  required
                  className="w-full resize-y rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm leading-6 text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                />
              </div>

              {/* IMAGE + CATEGORY */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Cover Image URL
                  </label>

                  <input
                    type="text"
                    name="coverImage"
                    value={form.coverImage}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
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
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>
              </div>

              {/* AUTHOR + TAGS */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Author
                  </label>

                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Admin"
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Tags
                  </label>

                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                    placeholder="react, javascript, tailwindcss"
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />

                  <p className="mt-1 text-[11px] text-[#5d7193]">
                    Separate tags using commas.
                  </p>
                </div>
              </div>

              {/* DATE + ORDER */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Published Date
                  </label>

                  <input
                    type="date"
                    name="publishedAt"
                    value={form.publishedAt}
                    onChange={handleChange}
                    className="scheme-dark w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Order
                  </label>

                  <input
                    type="number"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* STATUS */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#293957] bg-[#020617] p-3">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Published
                    </p>

                    <p className="text-xs text-[#7890b3]">
                      Make this blog publicly visible.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#293957] bg-[#020617] p-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 accent-blue-600"
                  />

                  <div>
                    <p className="text-sm font-medium text-white">
                      Active
                    </p>

                    <p className="text-xs text-[#7890b3]">
                      Enable this blog in the CMS.
                    </p>
                  </div>
                </label>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-2 border-t border-[#293957] pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-[#30405e] bg-[#020617] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-[#111c31]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Blog"
                    : "Add Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;