"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "upload" | "link";

export function ImageUploader({
  value,
  onChange,
  label,
  folder = "prosumer-lens",
  hint,
  className,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  hint?: string;
  className?: string;
}) {
  const [mode, setMode] = useState<Mode>(value ? "link" : "upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setError(null);
    onChange("");
  };

  const modeButton = (m: Mode, text: string, Icon: typeof Upload) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setError(null);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
        mode === m ? "bg-primary text-primary-foreground" : "text-foreground-muted hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </button>
  );

  return (
    <div className={cn("space-y-2.5", className)}>
      {label && (
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">{label}</span>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-full border border-border p-0.5">
          {modeButton("upload", "Upload", Upload)}
          {modeButton("link", "Use Link", Link2)}
        </div>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11.5px] font-semibold text-foreground-muted hover:bg-muted hover:text-foreground"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      {mode === "upload" ? (
        <div className="flex items-start gap-3">
          <label
            className={cn(
              "relative flex min-h-[96px] min-w-[96px] cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-dashed border-border bg-muted/40 transition-colors hover:bg-muted/60",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {value ? (
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="flex flex-col items-center gap-1 p-2 text-center">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
                ) : (
                  <Upload className="h-5 w-5 text-foreground-muted" />
                )}
                <span className="text-[10.5px] leading-tight text-foreground-muted">
                  {uploading ? "Uploading…" : "Click to upload"}
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </label>

          <div className="flex-1 space-y-1.5 pt-1">
            {value && (
              <p className="truncate text-[11.5px] text-foreground-muted" title={value}>
                {value}
              </p>
            )}
            <p className="text-[11px] text-foreground-muted">
              {uploading ? "Uploading to Cloudinary…" : "PNG, JPG, WebP up to 5MB. Auto-optimized for the homepage."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 text-[13.5px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
      {hint && !error && <p className="text-[11.5px] text-foreground-muted">{hint}</p>}
    </div>
  );
}
