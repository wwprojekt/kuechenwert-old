"use client";

export interface AddressData {
  street: string;
  houseNumber: string;
  city: string;
}

interface AddressStepProps {
  data: AddressData;
  /** Bereits erfasste Postleitzahl (read-only Anzeige). */
  plz: string;
  onChange: (patch: Partial<AddressData>) => void;
}

export function AddressStep({ data, plz, onChange }: AddressStepProps) {
  return (
    <div className="space-y-5">
      <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">
        Ihre Adresse wird ausschliesslich an den von Ihnen ausgewaehlten
        Haendler weitergegeben - nachdem dieser den Lead gekauft hat. Bis
        dahin sehen Haendler nur Ihre Postleitzahl.
      </p>

      <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
        <div>
          <label
            htmlFor="addr-street"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            Strasse *
          </label>
          <input
            id="addr-street"
            type="text"
            autoComplete="address-line1"
            value={data.street}
            onChange={(e) => onChange({ street: e.target.value })}
            className="input-field"
            placeholder="z. B. Hauptstrasse"
            required
          />
        </div>
        <div>
          <label
            htmlFor="addr-housenumber"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            Hausnummer *
          </label>
          <input
            id="addr-housenumber"
            type="text"
            autoComplete="address-line2"
            value={data.houseNumber}
            onChange={(e) => onChange({ houseNumber: e.target.value })}
            className="input-field"
            placeholder="12a"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div>
          <label
            htmlFor="addr-plz"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            Postleitzahl
          </label>
          <input
            id="addr-plz"
            type="text"
            value={plz}
            readOnly
            className="input-field bg-zinc-50 text-zinc-500"
            aria-label="Bereits erfasste Postleitzahl"
          />
        </div>
        <div>
          <label
            htmlFor="addr-city"
            className="mb-1.5 block text-sm font-medium text-zinc-700"
          >
            Stadt *
          </label>
          <input
            id="addr-city"
            type="text"
            autoComplete="address-level2"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="input-field"
            placeholder="z. B. Berlin"
            required
          />
        </div>
      </div>
    </div>
  );
}

/** Pflicht-Validierung. */
export function isAddressComplete(data: AddressData): boolean {
  return !!(
    data.street.trim() &&
    data.houseNumber.trim() &&
    data.city.trim()
  );
}
