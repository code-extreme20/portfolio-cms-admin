import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  MessageSquareQuote,
  Pencil,
  Trash2,
  X,
  Star,
  CheckCircle2,
  User,
} from "lucide-react";
import api from "../services/api";

const emptyForm = {
  name: "",
  role: "",
  company: "",
  message: "",
  image: "",
  rating: 5,
  order: 0,
  isActive: true,
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // =========================
  // FETCH TESTIMONIALS
  // =========================
  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      const response = await api.get("/testimonials");

      if (response.data.success) {
        setTestimonials(
          response.data.testimonials ||
            response.data.data ||
            []
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch testimonials:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // =========================
  // SEARCH
  // =========================
  const filteredTestimonials = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return testimonials;

    return testimonials.filter((item) => {
      return (
        item.name?.toLowerCase().includes(query) ||
        item.role?.toLowerCase().includes(query) ||
        item.company?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query)
      );
    });
  }, [testimonials, search]);

  // =========================
  // STATS
  // =========================
  const totalTestimonials = testimonials.length;

  const activeTestimonials = testimonials.filter(
    (item) => item.isActive
  ).length;

  const inactiveTestimonials =
    totalTestimonials - activeTestimonials;

  // =========================
  // MODAL
  // =========================
  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setEditingId(testimonial._id);

    setForm({
      name: testimonial.name || "",
      role: testimonial.role || "",
      company: testimonial.company || "",
      message: testimonial.message || "",
      image: testimonial.image || "",
      rating: testimonial.rating || 5,
      order: testimonial.order || 0,
      isActive: testimonial.isActive ?? true,
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
  // SAVE
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.message.trim()
    ) {
      alert("Name and message are required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        rating: Number(form.rating),
        order: Number(form.order),
      };

      if (editingId) {
        await api.put(
          `/testimonials/${editingId}`,
          payload
        );
      } else {
        await api.post(
          "/testimonials",
          payload
        );
      }

      closeModal();
      await fetchTestimonials();
    } catch (error) {
      console.error(
        "Failed to save testimonial:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save testimonial."
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
      "Are you sure you want to delete this testimonial?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/testimonials/${id}`);
      await fetchTestimonials();
    } catch (error) {
      console.error(
        "Failed to delete testimonial:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete testimonial."
      );
    }
  };

  // =========================
  // STARS
  // =========================
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-600"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-w-0 space-y-4 p-4 text-slate-100 lg:p-5">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <MessageSquareQuote
              size={21}
              className="text-blue-400"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white">
              Testimonials
            </h1>

            <p className="truncate text-xs text-[#7890b3]">
              Manage client testimonials shown on your portfolio.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Add Testimonial
        </button>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Total Testimonials
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {totalTestimonials}
          </p>
        </div>

        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Active
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {activeTestimonials}
          </p>
        </div>

        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-4">
          <p className="text-xs font-medium text-[#7890b3]">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-400">
            {inactiveTestimonials}
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
              placeholder="Search testimonials..."
              className="w-full rounded-lg border border-[#293957] bg-[#020617] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#405576] transition focus:border-blue-500"
            />
          </div>

          <button
            onClick={fetchTestimonials}
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
          CONTENT
      ========================= */}
      {loading ? (
        <div className="rounded-xl border border-[#24314d] bg-[#0f172a] p-8 text-center">
          <RefreshCw
            size={25}
            className="mx-auto animate-spin text-blue-500"
          />

          <p className="mt-3 text-sm text-[#7890b3]">
            Loading testimonials...
          </p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#30405e] bg-[#0f172a] p-8 text-center">
          <MessageSquareQuote
            size={35}
            className="mx-auto text-slate-600"
          />

          <h3 className="mt-3 text-base font-semibold text-white">
            No testimonials found
          </h3>

          <p className="mt-1 text-sm text-[#7890b3]">
            {search
              ? "Try a different search term."
              : "Add your first testimonial to get started."}
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
          {filteredTestimonials.map(
            (testimonial) => (
              <div
                key={testimonial._id}
                className="min-w-0 rounded-xl border border-[#24314d] bg-[#0f172a] p-4 transition hover:border-[#30466b]"
              >
                {/* CARD TOP */}
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 shrink-0 rounded-full border border-[#293957] object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/10 ring-1 ring-blue-500/20">
                        <User
                          size={22}
                          className="text-blue-400"
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-white">
                        {testimonial.name}
                      </h3>

                      <p className="truncate text-xs text-[#7890b3]">
                        {testimonial.role ||
                          "Client"}

                        {testimonial.company
                          ? ` • ${testimonial.company}`
                          : ""}
                      </p>

                      <div className="mt-1.5">
                        {renderStars(
                          testimonial.rating || 5
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${
                      testimonial.isActive
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 size={13} />

                    {testimonial.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* MESSAGE */}
                <div className="mt-3 rounded-lg border border-[#293957] bg-[#111c31] p-3">
                  <p className="line-clamp-4 text-sm leading-6 text-slate-300">
                    “{testimonial.message}”
                  </p>
                </div>

                {/* BOTTOM */}
                <div className="mt-3 flex flex-col gap-2 border-t border-[#24314d] pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-[#5d7193]">
                    Order: {testimonial.order ?? 0}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        openEditModal(
                          testimonial
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-transparent px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          testimonial._id
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-transparent px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =========================
          MODAL
      ========================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#293957] bg-[#0f172a] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#293957] bg-[#0f172a] px-4 py-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId
                    ? "Edit Testimonial"
                    : "Add Testimonial"}
                </h2>

                <p className="mt-0.5 text-xs text-[#7890b3]">
                  Add client feedback to your portfolio.
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Bill Gates"
                    required
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Role
                  </label>

                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="Founder"
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

                {/* COMPANY */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Company
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Microsoft"
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

                {/* IMAGE */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Image URL
                  </label>

                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                  />
                </div>

                {/* RATING */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Rating
                  </label>

                  <select
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="1">
                      1 Star
                    </option>
                    <option value="2">
                      2 Stars
                    </option>
                    <option value="3">
                      3 Stars
                    </option>
                    <option value="4">
                      4 Stars
                    </option>
                    <option value="5">
                      5 Stars
                    </option>
                  </select>
                </div>

                {/* ORDER */}
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

              {/* MESSAGE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Message *
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write the client's testimonial..."
                  rows={5}
                  required
                  className="w-full resize-none rounded-lg border border-[#293957] bg-[#020617] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#405576] focus:border-blue-500"
                />
              </div>

              {/* ACTIVE */}
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
                    Active testimonial
                  </p>

                  <p className="text-xs text-[#7890b3]">
                    Show this testimonial on the public portfolio.
                  </p>
                </div>
              </label>

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
                    ? "Update Testimonial"
                    : "Add Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;