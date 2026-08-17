"use client";

import type { HeroBlockWidths } from "@/types/homepage";
import { Field, FieldGrid, TextInput } from "@/components/homepage-builder/fields";

const BLOCK_FIELDS: { key: keyof HeroBlockWidths; label: string }[] = [
  { key: "eyebrow", label: "Eyebrow width (px, 0 = auto)" },
  { key: "heading", label: "Heading width (px, 0 = auto)" },
  { key: "description", label: "Description width (px, 0 = auto)" },
  { key: "buttons", label: "Buttons width (px, 0 = auto)" },
  { key: "badges", label: "Badges width (px, 0 = auto)" },
];

export function BlockWidthsEditor({
  widths,
  onChange,
}: {
  widths: HeroBlockWidths;
  onChange: (next: HeroBlockWidths) => void;
}) {
  return (
    <FieldGrid>
      {BLOCK_FIELDS.map((f) => (
        <Field key={f.key} label={f.label}>
          <TextInput
            type="number"
            min={0}
            max={1200}
            step={4}
            value={widths[f.key]}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange({ ...widths, [f.key]: n });
            }}
          />
        </Field>
      ))}
    </FieldGrid>
  );
}
