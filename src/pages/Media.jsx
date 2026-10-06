import { useEffect, useState } from "react";
import {
  Image,
  Upload,
  Trash2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import api from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://portfolio-cms-backend-2.onrender.com";
function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD MEDIA
  // =========================
  const loadMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/upload/media");

      if (response.data.success) {
        setMedia(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load media:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load media."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // =========================
  // FILE SELECT
  // =========================
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5 MB."
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // =========================
  // UPLOAD
  // =========================
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await api.post(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setMessage(
          "Image uploaded successfully."
        );

        setSelectedFile(null);

        const fileInput =
          document.getElementById(
            "media-upload"
          );

        if (fileInput) {
          fileInput.value = "";
        }

        await loadMedia();
      }
    } catch (err) {
      console.error("Upload failed:", err);

      setError(
        err.response?.data?.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await api.delete(
        `/upload/media/${id}`
      );

      if (response.data.success) {
        setMedia((currentMedia) =>
          currentMedia.filter(
            (item) => item._id !== id
          )
        );

        setMessage(
          "Image deleted successfully."
        );
      }
    } catch (err) {
      console.error("Delete failed:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete image."
      );
    }
  };

  // =========================
  // IMAGE URL
  // =========================
  const getImageUrl = (url) => {
    if (!url) return "";

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    return `${API_BASE_URL}${url}`;
  };

  // =========================
  // COPY URL
  // =========================
  const copyUrl = async (item) => {
    const fullUrl = getImageUrl(item.url);

    try {
      await navigator.clipboard.writeText(
        fullUrl
      );

      setCopiedId(item._id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // =========================
  // FORMAT SIZE
  // =========================
  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-w-0 space-y-4 p-4 text-slate-100 lg:p-5">
      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Image
                size={21}
                className="text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-white">
                Media Library
              </h1>

              <p className="truncate text-xs text-slate-400">
                Upload and manage images used throughout your portfolio.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMedia}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* =========================
          MESSAGES
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
          UPLOAD
      ========================= */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-white">
            Upload Image
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            JPG, JPEG, PNG, WEBP or GIF · Maximum 5 MB
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="media-upload"
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-slate-950"
            >
              <Upload
                size={24}
                className="mb-2 text-blue-400"
              />

              <span className="max-w-full truncate text-sm font-medium text-slate-200">
                {selectedFile
                  ? selectedFile.name
                  : "Click to choose an image"}
              </span>

              <span className="mt-1 text-[11px] text-slate-500">
                Select one image from your computer
              </span>
            </label>

            <input
              id="media-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />

            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>
        </div>
      </div>

      {/* =========================
          MEDIA HEADER
      ========================= */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Uploaded Media
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {media.length}{" "}
            {media.length === 1
              ? "image"
              : "images"}{" "}
            in your media library
          </p>
        </div>
      </div>

      {/* =========================
          GALLERY
      ========================= */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="text-center">
            <RefreshCw
              size={25}
              className="mx-auto animate-spin text-blue-400"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading media...
            </p>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 px-6 text-center">
          <Image
            size={36}
            className="text-slate-700"
          />

          <h3 className="mt-3 text-base font-semibold text-slate-300">
            No media yet
          </h3>

          <p className="mt-1 max-w-md text-xs text-slate-500">
            Upload your first image using the uploader above.
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => {
            const imageUrl = getImageUrl(
              item.url
            );

            return (
              <div
                key={item._id}
                className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70"
              >
                {/* IMAGE */}
                <div className="aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={imageUrl}
                    alt={
                      item.originalName ||
                      item.filename
                    }
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                {/* DETAILS */}
                <div className="p-3">
                  <h3
                    className="truncate text-sm font-semibold text-white"
                    title={item.originalName}
                  >
                    {item.originalName}
                  </h3>

                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>
                      {formatSize(item.size)}
                    </span>

                    <span>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyUrl(item)
                      }
                      className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                    >
                      {copiedId ===
                      item._id ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy URL
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          item._id
                        )
                      }
                      className="flex items-center justify-center rounded-lg border border-red-500/20 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                      aria-label="Delete image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Media;