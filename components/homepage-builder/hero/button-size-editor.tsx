"use client";

import type { HeroButtonSize } from "@/types/homepage";
import { Field, FieldGrid, TextInput } from "@/components/homepage-builder/fields";

const SIZE_FIELDS: { key: keyof HeroButtonSize; label: string; min: number; max: number; step: number }[] = [
  { key: "width", label: "Width (px, 0 = auto)", min: 0, max: 400, step: 1 },
  { key: "height", label: "Height (px, 0 = auto)", min: 0, max: 200, step: 1 },
  { key: "borderRadius", label: "Border radius (px)", min: 0, max: 100, step: 1 },
  { key: "paddingX", label: "Horizontal padding (px)", min: 0, max: 120, step: 1 },
  { key: "paddingY", label: "Vertical padding (px)", min: 0, max: 80, step: 1 },
  { key: "fontSize", label: "Font size (px, 0 = theme)", min: 0, max: 40, step: 1 },
  { key: "fontWeight", label: "Font weight (0 = theme)", min: 0, max: 900, step: 100 },
];

export function ButtonSizeEditor({
  size,
  onChange,
}: {
  size: HeroButtonSize;
  onChange: (next: HeroButtonSize) => void;
}) {
  return (
    <FieldGrid>
      {SIZE_FIELDS.map((f) => (
        <Field key={f.key} label={f.label}>
          <TextInput
            type="number"
            min={f.min}
            max={f.max}
            step={f.step}
            value={size[f.key]}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange({ ...size, [f.key]: n });
            }}
          />
        </Field>
      ))}
    </FieldGrid>
  );
}
