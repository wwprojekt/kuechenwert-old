"use client";

import { useState, useCallback, useRef } from "react";
import { clsx } from "clsx";

interface UploadStepProps {
  /** Currently selected file */
  file: File | null;
  /** Called when a file is selected or removed */
  onFileChange: (file: File | null) => void;
  /** Label for the upload area */
  label?: string;
  /** Help text below the upload area */
  helpText?: string;
  /** Accepted file types */
  accept?: string;
  /** Max file size in MB */
  maxSizeMb?: number;
  /** Whether this step can be skipped */
  skippable?: boolean;
  /** Skip button label */
  skipLabel?: string;
  /** Called when user clicks skip */
  onSkip?: () => void;
}

export function UploadStep({
  file,
  onFileChange,
  label = "Grundriss hochladen",
  helpText = "Laden Sie Ihren Grundriss hoch für präzisere Angebote. Alle Raummaße, Türen, Fenster und Anschlüsse sollten erkennbar sein.",
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMb = 5,
  skippable = true,
  skipLabel = "Überspringen",
  onSkip,
}: UploadStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (f: File) => {
      setError(null);

      if (f.size > maxSizeMb * 1024 * 1024) {
        setError(`Die Datei ist zu groß. Maximum: ${maxSizeMb} MB.`);
        return;
      }

      const ext = f.name.split(".").pop()?.toLowerCase();
      const allowedExts = accept
        .split(",")
        .map((a) => a.trim().replace(".", ""));
      if (ext && !allowedExts.includes(ext)) {
        setError(`Dateityp nicht erlaubt. Erlaubt: ${accept}`);
        return;
      }

      onFileChange(f);
    },
    [accept, maxSizeMb, onFileChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-zinc-600">{helpText}</p>

      {file ? (
        /* File selected state */
        <div className="flex items-center gap-4 rounded-xl border-2 border-brand-600 bg-brand-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-100">
            <svg
              className="h-6 w-6 text-brand-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-800">
              {file.name}
            </p>
            <p className="text-xs text-brand-600">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Datei entfernen"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        /* Drop zone */
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={clsx(
            "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition",
            isDragOver
              ? "border-brand-500 bg-brand-50"
              : "border-zinc-300 bg-zinc-50 hover:border-brand-400 hover:bg-brand-50/50",
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200">
            <svg
              className="h-7 w-7 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-700">{label}</p>
            <p className="mt-1 text-xs text-zinc-500">
              PDF, JPG oder PNG · Max. {maxSizeMb} MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {skippable && !file && (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-zinc-500 underline underline-offset-2 transition hover:text-zinc-700"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
