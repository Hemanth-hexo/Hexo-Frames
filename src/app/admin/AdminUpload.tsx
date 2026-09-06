"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryOption {
  id: string;
  title: string;
}

export default function AdminUpload({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [camera, setCamera] = useState("");
  const [settings, setSettings] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function resetForm() {
    handleFile(null);
    setTitle("");
    setLocation("");
    setCamera("");
    setSettings("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("categoryId", categoryId);
      form.set("title", title);
      form.set("location", location);
      form.set("camera", camera);
      form.set("settings", settings);
      form.set("description", description);

      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Upload failed");

      setMessage({ type: "ok", text: "Committed — Netlify will rebuild the site in a couple of minutes." });
      resetForm();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="w-full max-w-lg">
      <div className="flex items-center justify-between mb-8">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta">Add a photo</span>
        <button onClick={handleLogout} className="font-mono text-xs uppercase tracking-widest text-muted hover:text-cyan transition-colors">
          Log out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Photo</label>
          {preview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-bg-raised mb-3" />
          )}
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-fg/80 font-mono file:mr-4 file:py-2.5 file:px-4 file:border-0 file:font-mono file:text-xs file:uppercase file:tracking-widest file:bg-magenta file:text-bg file:font-bold file:cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg font-mono text-sm focus:outline-none focus:border-cyan"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg text-sm focus:outline-none focus:border-cyan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg text-sm focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Camera</label>
            <input
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              placeholder="Auto-detected from EXIF if left blank"
              className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg text-sm focus:outline-none focus:border-cyan placeholder:text-muted/60"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Settings</label>
          <input
            value={settings}
            onChange={(e) => setSettings(e.target.value)}
            placeholder="Auto-detected from EXIF if left blank (f/2.8 · 1/250s · ISO 800)"
            className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg text-sm focus:outline-none focus:border-cyan placeholder:text-muted/60"
          />
        </div>

        <div>
          <label className="block font-mono text-[0.65rem] uppercase tracking-widest text-muted mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg text-sm focus:outline-none focus:border-cyan resize-none"
          />
        </div>

        {message && (
          <p className={`font-mono text-sm ${message.type === "ok" ? "text-cyan" : "text-magenta"}`}>{message.text}</p>
        )}

        <button
          type="submit"
          disabled={busy || !file || !title}
          className="w-full font-mono text-xs uppercase tracking-widest px-6 py-4 bg-magenta text-bg font-bold hover:bg-cyan transition-colors disabled:opacity-50"
        >
          {busy ? "Uploading & committing…" : "Add to site"}
        </button>
      </form>
    </div>
  );
}
