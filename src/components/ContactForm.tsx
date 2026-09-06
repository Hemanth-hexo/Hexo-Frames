"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <p className="font-mono text-sm text-cyan max-w-sm">
        Sent — thanks. I&rsquo;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm w-full">
      {/* Honeypot — hidden from real visitors, bots fill it in and get silently ignored server-side. */}
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="bg-transparent border-b border-fg/30 focus:border-cyan pb-2 text-fg placeholder:text-fg/40 font-mono text-sm focus:outline-none transition-colors"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-transparent border-b border-fg/30 focus:border-cyan pb-2 text-fg placeholder:text-fg/40 font-mono text-sm focus:outline-none transition-colors"
      />
      <textarea
        placeholder="What are you looking to shoot?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
        className="bg-transparent border-b border-fg/30 focus:border-cyan pb-2 text-fg placeholder:text-fg/40 font-mono text-sm focus:outline-none transition-colors resize-none"
      />
      {status === "error" && <p className="font-mono text-xs text-magenta">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-2 font-mono text-xs uppercase tracking-widest px-6 py-3.5 bg-magenta text-bg font-bold hover:bg-cyan transition-colors disabled:opacity-50 w-fit"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
