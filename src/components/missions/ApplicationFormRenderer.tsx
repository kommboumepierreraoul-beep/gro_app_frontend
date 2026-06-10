"use client";

import { FormField } from "@/lib/missions/types";

interface Props {
  fields: FormField[];
  responses: Record<string, unknown>;
  onChange: (r: Record<string, unknown>) => void;
}

export default function ApplicationFormRenderer({
  fields,
  responses,
  onChange,
}: Props) {
  const update = (id: string, value: unknown) =>
    onChange({ ...responses, [id]: value });

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-xs font-medium text-[#42493e] mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === "text" && (
            <input
              type="text"
              value={(responses[field.id] as string) ?? ""}
              onChange={(e) => update(field.id, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          )}

          {field.type === "textarea" && (
            <textarea
              rows={2}
              value={(responses[field.id] as string) ?? ""}
              onChange={(e) => update(field.id, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18] resize-none"
            />
          )}

          {field.type === "boolean" && (
            <div className="flex gap-2">
              {["Oui", "Non"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update(field.id, opt === "Oui")}
                  className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    responses[field.id] === (opt === "Oui")
                      ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                      : "border-[#c2c9bb]/30 text-[#42493e]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {field.type === "select" && field.options && (
            <select
              value={(responses[field.id] as string) ?? ""}
              onChange={(e) => update(field.id, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            >
              <option value="">Sélectionner...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {field.type === "number" && (
            <input
              type="number"
              value={(responses[field.id] as number) ?? ""}
              onChange={(e) => update(field.id, Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#c2c9bb]/30 rounded-lg text-sm focus:outline-none focus:border-[#154212] text-[#191c18]"
            />
          )}
        </div>
      ))}
    </div>
  );
}
