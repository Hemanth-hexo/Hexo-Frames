import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { name, email, message, company } = (await request.json()) as {
    name?: string;
    email?: string;
    message?: string;
    company?: string; // honeypot — real visitors never fill this in, it's hidden via CSS
  };

  if (company) {
    // Silently pretend success to whatever filled the honeypot in.
    return NextResponse.json({ ok: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"HexoFrames Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (error) {
    console.error("Contact form send failed:", error);
    return NextResponse.json({ error: "Couldn't send that right now — try emailing directly instead." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
