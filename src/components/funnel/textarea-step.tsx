"use client";

interface TextareaStepProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
}

export function TextareaStep({
  value,
  onChange,
  placeholder = "Ihre Nachricht…",
  helpText = "Optional: Teilen Sie uns weitere Details oder besondere Wünsche mit.",
  maxLength = 1000,
}: TextareaStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-600">{helpText}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={5}
        maxLength={maxLength}
        className="input-field resize-y"
      />
      <p className="text-right text-xs text-zinc-400">
        {value.length} / {maxLength} Zeichen
      </p>
    </div>
  );
}
