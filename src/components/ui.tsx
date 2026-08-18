"use client";

import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon, Loader } from "./doodles";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function Button({ variant = "default", size, loading, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "secondary" | "pink" | "ghost" | "danger"; size?: "sm" | "lg"; loading?: boolean }) {
  return (
    <button
      className={cx("btn", variant !== "default" && `btn-${variant}`, size && `btn-${size}`, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Loader size={18} /> : null}
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx("input", props.className)} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx("input", props.className)} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx("input", props.className)} />;
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="mb-4">
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <div className="mt-1 text-sm text-muted">{hint}</div> : null}
    </div>
  );
}

export function Alert({ kind = "info", children, className }: { kind?: "info" | "error" | "success" | "warn"; children: ReactNode; className?: string }) {
  const styles: Record<string, string> = {
    info: "bg-[#e6f4f2] border-[#2a9d8f]",
    error: "bg-[#ffe1e6] border-[#d1495b]",
    success: "bg-[#e6f4e9] border-[#4d8b5f]",
    warn: "bg-[#fff3cf] border-[#f7b32b]",
  };
  return (
    <div className={cx("sketch-flat px-4 py-3 text-[0.98rem]", styles[kind], className)} role={kind === "error" ? "alert" : undefined}>
      {children}
    </div>
  );
}

export function Card({ children, className, variant = 1, tape }: { children: ReactNode; className?: string; variant?: 1 | 2 | 3; tape?: boolean }) {
  return <div className={cx(variant === 1 ? "sketch" : variant === 2 ? "sketch-2" : "sketch-3", tape && "tape relative", "p-5 md:p-6", className)}>{children}</div>;
}

export function CopyButton({ text, label = "Copy", size = "sm", variant = "default", className }: { text: string; label?: string; size?: "sm" | "lg"; variant?: "default" | "primary" | "secondary" | "pink" | "ghost"; className?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          /* ignore */
        }
      }}
    >
      <Icon name={copied ? "check" : "copy"} size={16} />
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function Pill({ children, color = "yellow", className }: { children: ReactNode; color?: "yellow" | "teal" | "pink" | "gray"; className?: string }) {
  const c: Record<string, string> = { yellow: "bg-[#fde9b6]", teal: "bg-[#cfe9e5]", pink: "bg-[#ffd6e6]", gray: "bg-[#eee8da]" };
  return <span className={cx("sketch-flat inline-block px-2.5 py-0.5 text-sm leading-tight", c[color], className)}>{children}</span>;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader size={34} />
    </div>
  );
}

/** Tiny fetch helper that surfaces API error messages */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
