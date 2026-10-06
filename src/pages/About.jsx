import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import api from "../services/api";

const initialForm = {
  title: "",
  name: "",
  bio: "",
  shortBio: "",
  profileImage: "",
  resumeUrl: "",
  email: "",
  phone: "",
  location: "",
  socialLinks: {
    github: "",
    linkedin: "",
    instagram: "",
    twitter: "",
  },
};

function About() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const response = await api.get("/about");

        if (response.data.success && response.data.data) {
          setForm({
            ...initialForm,
            ...response.data.data,
            socialLinks: {
              ...initialForm.socialLinks,
              ...(response.data.data.socialLinks || {}),
            },
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load About information"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/about", form);

      if (response.data.success) {
        setForm({
          ...initialForm,
          ...response.data.data,
          socialLinks: {
            ...initialForm.socialLinks,
            ...(response.data.data.socialLinks || {}),
          },
        });

        setMessage("About information saved successfully.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save About information"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2
          className="animate-spin text-blue-400"
          size={24}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 p-4 lg:p-5">

      {/* Header */}
      <div className="mb-4">
        <p className="text-xs font-medium text-blue-400">
          Content
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white">
          About
        </h1>

        <p className="mt-0.5 text-xs text-slate-400">
          Manage your personal profile information.
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Information */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">

          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">
              Basic Information
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Your primary profile information.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            <Field
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="About Me"
            />

            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
            />

            <Field
              label="Short Bio"
              name="shortBio"
              value={form.shortBio}
              onChange={handleChange}
              placeholder="Frontend Developer"
            />

            <Field
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="India"
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            <Field
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91..."
            />

            <Field
              label="Profile Image URL"
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://..."
            />

            <Field
              label="Resume URL"
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="https://..."
            />

          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Bio
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              placeholder="Write your professional biography..."
            />
          </div>
        </section>

        {/* Social Links */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">

          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">
              Social Links
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Add links to your social profiles.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            <Field
              label="GitHub"
              name="github"
              value={form.socialLinks.github}
              onChange={handleSocialChange}
              placeholder="https://github.com/..."
            />

            <Field
              label="LinkedIn"
              name="linkedin"
              value={form.socialLinks.linkedin}
              onChange={handleSocialChange}
              placeholder="https://linkedin.com/in/..."
            />

            <Field
              label="Instagram"
              name="instagram"
              value={form.socialLinks.instagram}
              onChange={handleSocialChange}
              placeholder="https://instagram.com/..."
            />

            <Field
              label="Twitter / X"
              name="twitter"
              value={form.socialLinks.twitter}
              onChange={handleSocialChange}
              placeholder="https://x.com/..."
            />

          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );
}

/* Reusable compact field */
function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
      />
    </div>
  );
}

export default About;