"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Login failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-magenta block mb-3">Admin</span>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full bg-bg-raised border border-fg/20 px-4 py-3 text-fg font-mono text-sm focus:outline-none focus:border-cyan"
      />
      {error && <p className="text-magenta text-sm mt-3 font-mono">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full mt-4 font-mono text-xs uppercase tracking-widest px-6 py-3.5 bg-magenta text-bg font-bold hover:bg-cyan transition-colors disabled:opacity-50"
      >
        {busy ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
